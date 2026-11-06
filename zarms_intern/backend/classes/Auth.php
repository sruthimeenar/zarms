<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    }

    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function generateToken($userId, $email, $role) {
        $issuedAt = time();
        $expiresAt = $issuedAt + JWT_EXPIRY;

        return JWT::encode([
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'userId' => (int)$userId,
            'email' => $email,
            'role' => $role
        ], JWT_SECRET, 'HS256');
    }

    public function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            return ['valid' => true, 'payload' => (array)$decoded];
        } catch (Exception $e) {
            return ['valid' => false, 'error' => $e->getMessage()];
        }
    }

    public function getUserById($userId) {
        return $this->db->fetchOne("SELECT * FROM users WHERE id = ? LIMIT 1", [$userId]);
    }

    public function createUser($name, $email, $phone, $password, $role = ROLE_ADMIN) {
        $hashedPassword = self::hashPassword($password);

        $this->db->execute(
            "INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
            [$name, strtolower($email), $phone, $hashedPassword, $role, STATUS_ACTIVE]
        );

        return (int)$this->db->lastInsertId();
    }

    public function createSession($userId, $ipAddress = null, $userAgent = null) {
        $user = $this->getUserById($userId);
        if (!$user) {
            throw new Exception('User not found');
        }

        $token = $this->generateToken($userId, $user['email'], $user['role']);
        $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRY);

        $this->db->execute(
            "INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)",
            [$userId, $token, $ipAddress, $userAgent, $expiresAt]
        );

        return $token;
    }

    public function validateSession($token) {
        $verification = $this->verifyToken($token);
        if (!$verification['valid']) {
            return null;
        }

        $sql = "SELECT u.*
                FROM sessions s
                INNER JOIN users u ON s.user_id = u.id
                WHERE s.token = ? AND s.expires_at > NOW()
                LIMIT 1";

        $user = $this->db->fetchOne($sql, [$token]);

        if (!$user || $user['status'] !== STATUS_ACTIVE) {
            return null;
        }

        return $this->sanitizeUser($user);
    }

    public function revokeSession($token) {
        return $this->db->execute("DELETE FROM sessions WHERE token = ?", [$token]) > 0;
    }

    public function setPrimaryAdmin($userId) {
        $this->db->execute("UPDATE users SET is_primary_admin = 0 WHERE role IN (?, ?)", [ROLE_ADMIN, ROLE_SUPERADMIN]);
        return $this->db->execute("UPDATE users SET is_primary_admin = 1 WHERE id = ?", [$userId]) > 0;
    }

    public function logLoginAttempt($userId = null, $success = false, $reason = null, $ipAddress = null) {
        $email = null;
        if ($userId) {
            $user = $this->db->fetchOne("SELECT email FROM users WHERE id = ?", [$userId]);
            $email = $user['email'] ?? null;
        }

        $this->db->execute(
            "INSERT INTO login_audits (user_id, email, ip_address, user_agent, success, reason) VALUES (?, ?, ?, ?, ?, ?)",
            [
                $userId,
                $email,
                $ipAddress,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $success ? 1 : 0,
                $reason
            ]
        );
    }

    public function checkLoginRateLimit($email, $ipAddress = null) {
        // Count failed attempts within the rate limit window
        $result = $this->db->fetchOne(
            "SELECT COUNT(*) as attempts
             FROM login_audits
             WHERE email = ?
             AND success = 0
             AND attempted_at > DATE_SUB(NOW(), INTERVAL ? SECOND)",
            [strtolower($email), RATE_LIMIT_WINDOW]
        );

        $attempts = (int)($result['attempts'] ?? 0);

        if ($attempts >= RATE_LIMIT_LOGIN) {
            // Rate limit exceeded
            $minutes = (int)ceil(RATE_LIMIT_WINDOW / 60);
            $this->rateLimitMessage = "Too many failed login attempts. Please try again in {$minutes} minutes.";
            return false;
        }

        $this->rateLimitMessage = null;
        return true;
    }

    public function getRateLimitMessage() {
        return $this->rateLimitMessage;
    }

    private $rateLimitMessage = null;

    private function sanitizeUser($user) {
        if (!$user) return null;
        unset($user['password']);
        return $user;
    }
}
