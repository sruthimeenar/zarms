<?php

/**
 * Authentication Routes
 */

$db = Database::getInstance();
$auth = new Auth();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // INITIALIZE SUPERADMIN (One-time setup)
    // ============================================================
    case 'initialize-superadmin':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Check if any users exist
        $existingUsers = $db->query("SELECT COUNT(*) as count FROM users")->fetch(PDO::FETCH_ASSOC);
        if ($existingUsers['count'] > 0) {
            Response::forbidden('Superadmin already exists. Use registration flow.');
        }

        // Validate input
        $validation = Validator::validate($data, [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email',
            'phone' => 'required|phone',
            'password' => 'required|password'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            $userId = $auth->createUser(
                $data['name'],
                $data['email'],
                $data['phone'],
                $data['password'],
                ROLE_SUPERADMIN
            );

            $auth->logLoginAttempt($userId, true, 'Superadmin account created');

            Response::success([
                'message' => 'Superadmin account created successfully',
                'userId' => $userId
            ], 201);

        } catch (Exception $e) {
            error_log("Superadmin creation error: " . $e->getMessage());
            Response::serverError('Failed to create superadmin account');
        }
        break;

    // ============================================================
    // REGISTRATION FLOW (3 steps: initiate -> verify OTP -> complete)
    // ============================================================

    case 'register-initiate':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email',
            'phone' => 'required|phone'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Check if user already exists
            $existingUser = $db->query(
                "SELECT id FROM users WHERE email = ? OR phone = ?",
                [$data['email'], $data['phone']]
            )->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                Response::error('User with this email or phone already exists');
            }

            // Check for pending registration
            $pendingReg = $db->query(
                "SELECT id FROM registration_requests WHERE email = ? AND status = ?",
                [$data['email'], STATUS_PENDING]
            )->fetch(PDO::FETCH_ASSOC);

            if ($pendingReg) {
                // Delete old pending request
                $db->execute("DELETE FROM registration_requests WHERE id = ?", [$pendingReg['id']]);
            }

            // Create registration request
            $requestId = $db->execute(
                "INSERT INTO registration_requests (name, email, phone, status) VALUES (?, ?, ?, ?)",
                [$data['name'], $data['email'], $data['phone'], STATUS_PENDING]
            );

            // Get primary admin
            $primaryAdmin = $db->query(
                "SELECT id, email, name FROM users WHERE is_primary_admin = 1 LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$primaryAdmin) {
                Response::serverError('No primary admin found. Cannot process registration.');
            }

            // Generate OTP for primary admin
            $otp = OTP::generate();
            OTP::create($primaryAdmin['id'], $otp, OTP_TYPE_REGISTRATION);

            // Send OTP email to primary admin
            Email::sendRegistrationOtpToAdmin(
                $primaryAdmin['email'],
                $primaryAdmin['name'],
                $data['name'],
                $data['email'],
                $data['phone'],
                $otp
            );

            Response::success([
                'message' => 'Registration initiated. OTP sent to admin for approval.',
                'requestId' => $requestId
            ], 201);

        } catch (Exception $e) {
            error_log("Registration initiate error: " . $e->getMessage());
            Response::serverError('Failed to initiate registration');
        }
        break;

    case 'register-verify-otp':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email',
            'otp' => 'required|min:6|max:6'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Get latest pending registration request by email
            $request = $db->query(
                "SELECT * FROM registration_requests WHERE email = ? AND status = ? ORDER BY created_at DESC LIMIT 1",
                [$data['email'], STATUS_PENDING]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                Response::notFound('Registration request not found or already processed');
            }

            // Get primary admin
            $primaryAdmin = $db->query(
                "SELECT id FROM users WHERE is_primary_admin = 1 LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$primaryAdmin) {
                Response::serverError('No primary admin found');
            }

            // Verify OTP
            $otpValid = OTP::verify($primaryAdmin['id'], $data['otp'], OTP_TYPE_REGISTRATION);

            if (!$otpValid) {
                Response::unauthorized('Invalid or expired OTP');
            }

            // Update registration status
            $db->execute(
                "UPDATE registration_requests SET status = ? WHERE id = ?",
                [STATUS_APPROVED, $request['id']]
            );

            Response::success([
                'message' => 'OTP verified successfully. Registration approved.',
                'requestId' => $request['id']
            ]);

        } catch (Exception $e) {
            error_log("OTP verification error: " . $e->getMessage());
            Response::serverError('Failed to verify OTP');
        }
        break;

    case 'register-complete':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email',
            'password' => 'required|password'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Get approved registration request by email
            $request = $db->query(
                "SELECT * FROM registration_requests WHERE email = ? AND status = ? ORDER BY created_at DESC LIMIT 1",
                [$data['email'], STATUS_APPROVED]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                Response::notFound('Registration request not found or not approved');
            }

            // Create user account
            $userId = $auth->createUser(
                $request['name'],
                $request['email'],
                $request['phone'],
                $data['password'],
                ROLE_ADMIN
            );

            // Update registration request
            $db->execute(
                "UPDATE registration_requests SET status = ?, processed_at = NOW() WHERE id = ?",
                [STATUS_COMPLETED, $request['id']]
            );

            // Log registration
            $auth->logLoginAttempt($userId, true, 'Account created via registration');

            // Send welcome email
            Email::sendRegistrationSuccess($request['email'], $request['name']);

            Response::success([
                'message' => 'Registration completed successfully',
                'userId' => $userId
            ], 201);

        } catch (Exception $e) {
            error_log("Registration complete error: " . $e->getMessage());
            Response::serverError('Failed to complete registration');
        }
        break;

    // ============================================================
    // LOGIN
    // ============================================================

    case 'login':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Check rate limiting
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            if (!$auth->checkLoginRateLimit($data['email'], $ipAddress)) {
                $rateLimitMessage = $auth->getRateLimitMessage();
                Response::error($rateLimitMessage ?? 'Too many login attempts. Please try again later.', 429);
            }

            // Get user
            $user = $db->query(
                "SELECT * FROM users WHERE email = ?",
                [$data['email']]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                $auth->logLoginAttempt(null, false, 'User not found', $ipAddress);
                Response::unauthorized('Invalid email or password');
            }

            // Check if user is active
            if ($user['status'] !== STATUS_ACTIVE) {
                $auth->logLoginAttempt($user['id'], false, 'Account inactive', $ipAddress);
                Response::forbidden('Your account is inactive. Please contact administrator.');
            }

            // Verify password
            if (!$auth->verifyPassword($data['password'], $user['password'])) {
                $auth->logLoginAttempt($user['id'], false, 'Invalid password', $ipAddress);
                Response::unauthorized('Invalid email or password');
            }

            // Create session
            $token = $auth->createSession($user['id'], $ipAddress);

            // Update last login
            $db->execute(
                "UPDATE users SET last_login_at = NOW() WHERE id = ?",
                [$user['id']]
            );

            // Log successful login
            $auth->logLoginAttempt($user['id'], true, 'Login successful', $ipAddress);

            // Return user data and token
            Response::success([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['role'],
                    'isPrimaryAdmin' => (bool)$user['is_primary_admin']
                ]
            ]);

        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            Response::serverError('Login failed');
        }
        break;

    // ============================================================
    // LOGOUT
    // ============================================================

    case 'logout':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $user = $authMiddleware->requireAuth();

            // Get token from request
            $headers = getallheaders();
            $token = null;
            if (isset($headers['Authorization'])) {
                if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                    $token = $matches[1];
                }
            }

            if ($token) {
                $auth->revokeSession($token);
            }

            Response::success(['message' => 'Logged out successfully']);

        } catch (Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            Response::serverError('Logout failed');
        }
        break;

    // ============================================================
    // SESSION VALIDATION
    // ============================================================

    case 'session':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $user = $authMiddleware->requireAuth();

            Response::success([
                'valid' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['role'],
                    'isPrimaryAdmin' => (bool)$user['is_primary_admin']
                ]
            ]);

        } catch (Exception $e) {
            Response::unauthorized('Invalid session');
        }
        break;

    // ============================================================
    // FORGOT PASSWORD (3 steps: initiate -> verify OTP -> reset)
    // ============================================================

    case 'forgot-password':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Get user
            $user = $db->query(
                "SELECT id, email, name FROM users WHERE email = ?",
                [$data['email']]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Email doesn't exist - return user-friendly error
                Response::error('No account found with this email address. Please check your email or contact support.');
            }

            // Generate OTP
            $otp = OTP::generate();
            OTP::create($user['id'], $otp, OTP_TYPE_PASSWORD_RESET);

            // Send OTP email
            Email::sendPasswordResetOTP($user['email'], $user['name'], $otp);

            Response::success([
                'message' => 'Password reset code sent to your email',
                'email' => $data['email']
            ]);

        } catch (Exception $e) {
            error_log("Forgot password error: " . $e->getMessage());
            Response::serverError('Failed to send reset code');
        }
        break;

    case 'verify-reset-otp':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email',
            'otp' => 'required|min:6|max:6'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Get user
            $user = $db->query(
                "SELECT id FROM users WHERE email = ?",
                [$data['email']]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::unauthorized('Invalid email or OTP');
            }

            // Verify OTP
            $otpValid = OTP::verify($user['id'], $data['otp'], OTP_TYPE_PASSWORD_RESET);

            if (!$otpValid) {
                Response::unauthorized('Invalid or expired OTP');
            }

            Response::success([
                'message' => 'OTP verified successfully',
                'email' => $data['email']
            ]);

        } catch (Exception $e) {
            error_log("Verify reset OTP error: " . $e->getMessage());
            Response::serverError('Failed to verify OTP');
        }
        break;

    case 'reset-password':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        // Validate input
        $validation = Validator::validate($data, [
            'email' => 'required|email',
            'otp' => 'required|min:6|max:6',
            'password' => 'required|password'
        ]);

        if (!$validation['valid']) {
            Response::validationError($validation['errors']);
        }

        try {
            // Get user
            $user = $db->query(
                "SELECT id, name, email FROM users WHERE email = ?",
                [$data['email']]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::unauthorized('Invalid email or OTP');
            }

            // Verify OTP is still valid
            if (!OTP::isVerified($user['id'], $data['otp'], OTP_TYPE_PASSWORD_RESET)) {
                Response::unauthorized('OTP not verified or expired');
            }

            // Update password
            $hashedPassword = $auth->hashPassword($data['password']);
            $db->execute(
                "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
                [$hashedPassword, $user['id']]
            );

            // Revoke all existing sessions
            $db->execute("DELETE FROM sessions WHERE user_id = ?", [$user['id']]);

            // Delete OTP
            $db->execute(
                "DELETE FROM otps WHERE user_id = ? AND type = ?",
                [$user['id'], OTP_TYPE_PASSWORD_RESET]
            );

            // Log password reset
            $auth->logLoginAttempt($user['id'], true, 'Password reset successful');

            // Send password reset success email
            try {
                Email::sendPasswordResetSuccess($user['email'], $user['name']);
            } catch (Exception $emailError) {
                error_log("Password reset success email failed: " . $emailError->getMessage());
                // Continue even if email fails
            }

            Response::success(['message' => 'Password reset successfully']);

        } catch (Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
            Response::serverError('Failed to reset password');
        }
        break;

    default:
        Response::notFound('Auth endpoint not found');
}
