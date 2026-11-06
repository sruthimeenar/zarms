<?php

class OTP {
    private static function db() {
        return Database::getInstance();
    }

    public static function generate() {
        return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function create($userId, $otp, $type) {
        $db = self::db();

        $db->execute(
            "DELETE FROM otps WHERE user_id = ? AND type = ?",
            [$userId, $type]
        );

        $expiresAt = date('Y-m-d H:i:s', time() + (OTP_EXPIRY_MINUTES * 60));

        $db->execute(
            "INSERT INTO otps (user_id, otp, type, expires_at, attempts, resend_count) VALUES (?, ?, ?, ?, 0, 0)",
            [$userId, $otp, $type, $expiresAt]
        );

        return true;
    }

    public static function verify($userId, $otp, $type) {
        $db = self::db();

        $record = $db->fetchOne(
            "SELECT * FROM otps WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1",
            [$userId, $type]
        );

        if (!$record) {
            return false;
        }

        if (!empty($record['verified_at'])) {
            return false;
        }

        if (strtotime($record['expires_at']) < time()) {
            return false;
        }

        if ((int)$record['attempts'] >= OTP_MAX_ATTEMPTS) {
            return false;
        }

        if ($record['otp'] !== $otp) {
            $db->execute("UPDATE otps SET attempts = attempts + 1 WHERE id = ?", [$record['id']]);
            return false;
        }

        $db->execute("UPDATE otps SET verified_at = NOW() WHERE id = ?", [$record['id']]);
        return true;
    }

    public static function isVerified($userId, $otp, $type) {
        $db = self::db();

        $record = $db->fetchOne(
            "SELECT * FROM otps WHERE user_id = ? AND type = ? AND otp = ? ORDER BY created_at DESC LIMIT 1",
            [$userId, $type, $otp]
        );

        if (!$record) {
            return false;
        }

        if (empty($record['verified_at'])) {
            return false;
        }

        if (strtotime($record['expires_at']) < time()) {
            return false;
        }

        return true;
    }
}
