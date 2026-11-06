<?php

/**
 * User Management Routes
 */

$db = Database::getInstance();
$auth = new Auth();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {
    // ============================================================
    // CREATE USER (Superadmin only)
    // ============================================================
    case 'create':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireSuperadmin();

            // Make password optional
            $validation = Validator::validate($data, [
                'name' => 'required|min:2|max:100',
                'email' => 'required|email',
                'phone' => 'required|phone',
                'password' => 'optional|password',
                'role' => 'required'
            ]);

            if (!$validation['valid']) {
                Response::validationError($validation['errors']);
            }

            if (!in_array($data['role'], [ROLE_ADMIN, ROLE_SUPERADMIN])) {
                Response::error('Invalid role');
            }

            $existing = $db->query(
                "SELECT id FROM users WHERE email = ? OR phone = ?",
                [$data['email'], $data['phone']]
            )->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                Response::error('User with this email or phone already exists');
            }

            // Generate password if not provided
            $password = $data['password'] ?? null;
            $isGenerated = false;

            if (!$password) {
                // Generate secure random password (12 characters with uppercase, lowercase, numbers, special chars)
                $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
                $password = '';
                for ($i = 0; $i < 12; $i++) {
                    $password .= $chars[random_int(0, strlen($chars) - 1)];
                }
                $isGenerated = true;
            }

            $newUserId = $auth->createUser(
                $data['name'],
                $data['email'],
                $data['phone'],
                $password,
                $data['role']
            );

            // Send email with credentials to new user
            try {
                Email::sendUserCredentials($data['email'], $data['name'], $password, $data['role'], $isGenerated);
            } catch (Exception $emailError) {
                error_log("Failed to send user credentials email: " . $emailError->getMessage());
                // Continue even if email fails - user is created
            }

            $newUser = $db->query(
                "SELECT id, name, email, phone, role, status, is_primary_admin, created_at, last_login_at
                 FROM users WHERE id = ?",
                [$newUserId]
            )->fetch(PDO::FETCH_ASSOC);

            $newUser['isPrimaryAdmin'] = (bool)$newUser['is_primary_admin'];
            unset($newUser['is_primary_admin']);

            $message = $isGenerated
                ? 'User created successfully. Password has been sent to their email.'
                : 'User created successfully.';

            Response::success([
                'message' => $message,
                'user' => $newUser,
                'passwordGenerated' => $isGenerated
            ], 201);

        } catch (Exception $e) {
            error_log("Create user error: " . $e->getMessage());
            Response::serverError('Failed to create user');
        }
        break;

    // ============================================================
    // GET ALL USERS (Admin only)
    // ============================================================
    case 'list':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Pagination
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 20;
            $offset = ($page - 1) * $limit;

            // Filters
            $role = $_GET['role'] ?? null;
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;

            // Build query
            $whereConditions = [];
            $params = [];

            // Regular admins cannot see superadmins
            if ($currentUser['role'] === ROLE_ADMIN) {
                $whereConditions[] = "role != ?";
                $params[] = ROLE_SUPERADMIN;
            }

            if ($role) {
                $whereConditions[] = "role = ?";
                $params[] = $role;
            }

            if ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }

            if ($search) {
                $whereConditions[] = "(name LIKE ? OR email LIKE ? OR phone LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM users {$whereClause}";
            $total = $db->query($countQuery, $params)->fetch(PDO::FETCH_ASSOC)['total'];

            // Get users
            $query = "SELECT id, name, email, phone, role, status, is_primary_admin, created_at, last_login_at
                      FROM users {$whereClause}
                      ORDER BY created_at DESC
                      LIMIT {$limit} OFFSET {$offset}";

            $users = $db->query($query, $params)->fetchAll(PDO::FETCH_ASSOC);

            // Convert database boolean to actual boolean
            foreach ($users as &$user) {
                $user['isPrimaryAdmin'] = (bool)$user['is_primary_admin'];
                unset($user['is_primary_admin']);
            }

            Response::success([
                'users' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);

        } catch (Exception $e) {
            error_log("Get users error: " . $e->getMessage());
            Response::serverError('Failed to retrieve users');
        }
        break;

    // ============================================================
    // GET SINGLE USER
    // ============================================================
    case 'get':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = $authMiddleware->requireAuth();

            $userId = $pathParts[3] ?? null;
            if (!$userId) {
                Response::error('User ID required');
            }

            // Users can view their own profile, admins can view any
            if ($currentUser['id'] != $userId && !in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN])) {
                Response::forbidden('You can only view your own profile');
            }

            $user = $db->query(
                "SELECT id, name, email, phone, role, status, is_primary_admin, created_at, last_login_at
                 FROM users WHERE id = ?",
                [$userId]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::notFound('User not found');
            }

            $user['isPrimaryAdmin'] = (bool)$user['is_primary_admin'];
            unset($user['is_primary_admin']);

            Response::success(['user' => $user]);

        } catch (Exception $e) {
            error_log("Get user error: " . $e->getMessage());
            Response::serverError('Failed to retrieve user');
        }
        break;

    // ============================================================
    // UPDATE USER
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = $authMiddleware->requireAuth();

            $userId = $pathParts[3] ?? null;
            if (!$userId) {
                Response::error('User ID required');
            }

            // Get target user
            $targetUser = $db->query("SELECT * FROM users WHERE id = ?", [$userId])->fetch(PDO::FETCH_ASSOC);
            if (!$targetUser) {
                Response::notFound('User not found');
            }

            // Permission check
            $isSelf = $currentUser['id'] == $userId;
            $isAdmin = in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);
            $isSuperadmin = $currentUser['role'] === ROLE_SUPERADMIN;

            if (!$isSelf && !$isAdmin) {
                Response::forbidden('You can only update your own profile');
            }

            // Validate input
            $rules = [];
            if (isset($data['name'])) $rules['name'] = 'min:2|max:100';
            if (isset($data['email'])) $rules['email'] = 'email';
            if (isset($data['phone'])) $rules['phone'] = 'phone';
            if (isset($data['password'])) $rules['password'] = 'password';

            if (!empty($rules)) {
                $validation = Validator::validate($data, $rules);
                if (!$validation['valid']) {
                    Response::validationError($validation['errors']);
                }
            }

            // Only superadmin can change role and status
            if (isset($data['role']) && !$isSuperadmin) {
                Response::forbidden('Only superadmin can change user roles');
            }

            if (isset($data['status']) && !$isSuperadmin) {
                Response::forbidden('Only superadmin can change user status');
            }

            // Cannot change primary admin flag
            if (isset($data['isPrimaryAdmin'])) {
                Response::forbidden('Cannot change primary admin status via this endpoint');
            }

            // Build update query
            $updates = [];
            $params = [];

            if (isset($data['name'])) {
                $updates[] = "name = ?";
                $params[] = $data['name'];
            }

            if (isset($data['email'])) {
                // Check email uniqueness
                $existing = $db->query(
                    "SELECT id FROM users WHERE email = ? AND id != ?",
                    [$data['email'], $userId]
                )->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    Response::error('Email already in use');
                }

                $updates[] = "email = ?";
                $params[] = $data['email'];
            }

            if (isset($data['phone'])) {
                // Check phone uniqueness
                $existing = $db->query(
                    "SELECT id FROM users WHERE phone = ? AND id != ?",
                    [$data['phone'], $userId]
                )->fetch(PDO::FETCH_ASSOC);

                if ($existing) {
                    Response::error('Phone number already in use');
                }

                $updates[] = "phone = ?";
                $params[] = $data['phone'];
            }

            if (isset($data['password'])) {
                $updates[] = "password = ?";
                $params[] = $auth->hashPassword($data['password']);
            }

            if (isset($data['role']) && $isSuperadmin) {
                $updates[] = "role = ?";
                $params[] = $data['role'];
            }

            if (isset($data['status']) && $isSuperadmin) {
                $updates[] = "status = ?";
                $params[] = $data['status'];
            }

            if (empty($updates)) {
                Response::error('No valid fields to update');
            }

            $updates[] = "updated_at = NOW()";
            $params[] = $userId;

            $updateQuery = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
            $db->execute($updateQuery, $params);

            // Get updated user
            $updatedUser = $db->query(
                "SELECT id, name, email, phone, role, status, is_primary_admin, created_at, last_login_at
                 FROM users WHERE id = ?",
                [$userId]
            )->fetch(PDO::FETCH_ASSOC);

            $updatedUser['isPrimaryAdmin'] = (bool)$updatedUser['is_primary_admin'];
            unset($updatedUser['is_primary_admin']);

            Response::success([
                'message' => 'User updated successfully',
                'user' => $updatedUser
            ]);

        } catch (Exception $e) {
            error_log("Update user error: " . $e->getMessage());
            Response::serverError('Failed to update user');
        }
        break;

    // ============================================================
    // DELETE USER (Superadmin only)
    // ============================================================
    case 'delete':
        if ($requestMethod !== 'DELETE') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $isPrimaryAdmin = (bool)($currentUser['is_primary_admin'] ?? false);
            if ($currentUser['role'] !== ROLE_SUPERADMIN && !$isPrimaryAdmin) {
                Response::forbidden('Superadmin or primary admin access required');
            }

            $userId = $pathParts[3] ?? null;
            if (!$userId) {
                Response::error('User ID required');
            }

            // Cannot delete yourself
            if ($currentUser['id'] == $userId) {
                Response::forbidden('Cannot delete your own account');
            }

            // Get user to delete
            $userToDelete = $db->query("SELECT * FROM users WHERE id = ?", [$userId])->fetch(PDO::FETCH_ASSOC);
            if (!$userToDelete) {
                Response::notFound('User not found');
            }

            // Cannot delete primary admin
            if ($userToDelete['is_primary_admin']) {
                Response::forbidden('Cannot delete primary admin');
            }

            // Primary admin cannot delete superadmins
            if ($isPrimaryAdmin && $currentUser['role'] !== ROLE_SUPERADMIN && $userToDelete['role'] === ROLE_SUPERADMIN) {
                Response::forbidden('Cannot delete a superadmin');
            }

            // Delete user (cascade will handle related records)
            $db->execute("DELETE FROM users WHERE id = ?", [$userId]);

            Response::success(['message' => 'User deleted successfully']);

        } catch (Exception $e) {
            error_log("Delete user error: " . $e->getMessage());
            Response::serverError('Failed to delete user');
        }
        break;

    // ============================================================
    // SET PRIMARY ADMIN (Superadmin only)
    // ============================================================
    case 'set-primary-admin':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireSuperadmin();

            $userId = $pathParts[3] ?? null;
            if (!$userId) {
                Response::error('User ID required');
            }

            // Get user
            $user = $db->query("SELECT * FROM users WHERE id = ?", [$userId])->fetch(PDO::FETCH_ASSOC);
            if (!$user) {
                Response::notFound('User not found');
            }

            // User must be admin or superadmin
            if (!in_array($user['role'], [ROLE_ADMIN, ROLE_SUPERADMIN])) {
                Response::error('User must be an admin or superadmin');
            }

            // Set primary admin
            $auth->setPrimaryAdmin($userId);

            Response::success(['message' => 'Primary admin updated successfully']);

        } catch (Exception $e) {
            error_log("Set primary admin error: " . $e->getMessage());
            Response::serverError('Failed to set primary admin');
        }
        break;

    // ============================================================
    // GET LOGIN AUDITS (Admin only)
    // ============================================================
    case 'login-audits':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Pagination
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 50;
            $offset = ($page - 1) * $limit;

            // Filters
            $userId = $_GET['userId'] ?? null;
            $success = isset($_GET['success']) ? (bool)$_GET['success'] : null;

            // Build query
            $whereConditions = [];
            $params = [];

            if ($userId) {
                $whereConditions[] = "la.user_id = ?";
                $params[] = $userId;
            }

            if ($success !== null) {
                $whereConditions[] = "la.success = ?";
                $params[] = $success ? 1 : 0;
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM login_audits la {$whereClause}";
            $total = $db->query($countQuery, $params)->fetch(PDO::FETCH_ASSOC)['total'];

            // Get audits
            $query = "SELECT la.*, u.name, u.email
                      FROM login_audits la
                      LEFT JOIN users u ON la.user_id = u.id
                      {$whereClause}
                      ORDER BY la.attempted_at DESC
                      LIMIT {$limit} OFFSET {$offset}";

            $audits = $db->query($query, $params)->fetchAll(PDO::FETCH_ASSOC);

            // Convert boolean
            foreach ($audits as &$audit) {
                $audit['success'] = (bool)$audit['success'];
            }

            Response::success([
                'audits' => $audits,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);

        } catch (Exception $e) {
            error_log("Get login audits error: " . $e->getMessage());
            Response::serverError('Failed to retrieve login audits');
        }
        break;

    default:
        Response::notFound('User endpoint not found');
}
