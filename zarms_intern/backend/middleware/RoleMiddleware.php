<?php

class RoleMiddleware {

    /**
     * Require superadmin role
     */
    public static function requireSuperadmin() {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            $user = (new AuthMiddleware())->requireAuth();
        }

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        if ($user['role'] !== ROLE_SUPERADMIN) {
            Response::forbidden('Superadmin access required');
        }

        return $user;
    }

    /**
     * Require admin or superadmin role
     */
    public static function requireAdmin() {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            $user = (new AuthMiddleware())->requireAuth();
        }

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        if (!in_array($user['role'], [ROLE_ADMIN, ROLE_SUPERADMIN])) {
            Response::forbidden('Admin access required');
        }

        return $user;
    }

    /**
     * Require specific role
     */
    public static function requireRole($role) {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            $user = (new AuthMiddleware())->requireAuth();
        }

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        if ($user['role'] !== $role) {
            Response::forbidden("Role '{$role}' required");
        }

        return $user;
    }

    /**
     * Require one of multiple roles
     */
    public static function requireAnyRole($roles) {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user) {
            $user = (new AuthMiddleware())->requireAuth();
        }

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        if (!in_array($user['role'], $roles)) {
            $rolesList = implode(', ', $roles);
            Response::forbidden("One of the following roles required: {$rolesList}");
        }

        return $user;
    }

    /**
     * Check if user can access resource (either owner or admin)
     */
    public static function canAccessResource($resourceUserId) {
        $user = AuthMiddleware::getCurrentUser();

        if (!$user) {
            Response::unauthorized('Authentication required');
        }

        // Superadmin can access everything
        if ($user['role'] === ROLE_SUPERADMIN) {
            return $user;
        }

        // User can access their own resources
        if ($user['id'] === $resourceUserId) {
            return $user;
        }

        Response::forbidden('You do not have permission to access this resource');
    }
}
