<?php

class AuthMiddleware {
    private $auth;

    public function __construct() {
        $this->auth = new Auth();
    }

    /**
     * Check if user is authenticated
     */
    public function requireAuth() {
        $token = $this->getTokenFromRequest();

        if (!$token) {
            Response::unauthorized('No authentication token provided');
        }

        $user = $this->auth->validateSession($token);

        if (!$user) {
            Response::unauthorized('Invalid or expired token');
        }

        // Store user in global scope for access in routes
        $GLOBALS['currentUser'] = $user;

        return $user;
    }

    /**
     * Check if user is authenticated (optional - doesn't fail if not authenticated)
     */
    public function optionalAuth() {
        $token = $this->getTokenFromRequest();

        if (!$token) {
            return null;
        }

        $user = $this->auth->validateSession($token);

        if ($user) {
            $GLOBALS['currentUser'] = $user;
        }

        return $user;
    }

    /**
     * Get token from request headers
     */
    private function getTokenFromRequest() {
        // Check Authorization header
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            // Format: "Bearer <token>"
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
            // Format: "<token>" (no Bearer prefix)
            return $headers['Authorization'];
        }

        // Check for token in query parameter (less secure, but sometimes needed)
        if (isset($_GET['token'])) {
            return $_GET['token'];
        }

        return null;
    }

    /**
     * Get current authenticated user
     */
    public static function getCurrentUser() {
        return $GLOBALS['currentUser'] ?? null;
    }

    /**
     * Check if current user has specific role
     */
    public static function hasRole($role) {
        $user = self::getCurrentUser();
        return $user && $user['role'] === $role;
    }

    /**
     * Check if current user is superadmin
     */
    public static function isSuperadmin() {
        return self::hasRole(ROLE_SUPERADMIN);
    }

    /**
     * Check if current user is admin or above
     */
    public static function isAdmin() {
        $user = self::getCurrentUser();
        return $user && in_array($user['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);
    }
}
