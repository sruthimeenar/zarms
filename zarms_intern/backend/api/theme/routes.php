<?php

/**
 * Theme Settings Routes
 */

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // GET THEME SETTINGS (Public)
    // ============================================================
    case 'get':
    case '':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $themeSettings = $db->query(
                "SELECT * FROM theme_settings ORDER BY id DESC LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$themeSettings) {
                Response::notFound('Theme settings not found');
            }

            // Decode JSON settings
            $settings = json_decode($themeSettings['settings'], true);

            Response::success([
                'settings' => $settings,
                'updatedAt' => $themeSettings['updated_at']
            ]);

        } catch (Exception $e) {
            error_log("Get theme settings error: " . $e->getMessage());
            Response::serverError('Failed to retrieve theme settings');
        }
        break;

    // ============================================================
    // UPDATE THEME SETTINGS (Admin only)
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            if (!isset($data['settings'])) {
                Response::error('Settings object required');
            }

            // Get current theme settings
            $currentTheme = $db->query(
                "SELECT * FROM theme_settings ORDER BY id DESC LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$currentTheme) {
                Response::notFound('Theme settings not found');
            }

            // Encode settings as JSON
            $settingsJson = json_encode($data['settings']);

            // Update theme settings
            $db->execute(
                "UPDATE theme_settings SET settings = ?, updated_at = NOW() WHERE id = ?",
                [$settingsJson, $currentTheme['id']]
            );

            Response::success(['message' => 'Theme settings updated successfully']);

        } catch (Exception $e) {
            error_log("Update theme settings error: " . $e->getMessage());
            Response::serverError('Failed to update theme settings');
        }
        break;

    // ============================================================
    // RESET THEME SETTINGS (Admin only)
    // ============================================================
    case 'reset':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Get default theme from seeds
            $defaultTheme = [
                'colors' => [
                    'primary' => '#2563eb',
                    'secondary' => '#f59e0b',
                    'accent' => '#10b981',
                    'background' => '#ffffff',
                    'text' => '#1f2937'
                ],
                'fonts' => [
                    'heading' => 'Inter, system-ui, -apple-system, sans-serif',
                    'body' => 'Inter, system-ui, -apple-system, sans-serif'
                ],
                'spacing' => [
                    'xs' => '0.25rem',
                    'sm' => '0.5rem',
                    'md' => '1rem',
                    'lg' => '1.5rem',
                    'xl' => '2rem'
                ],
                'borderRadius' => [
                    'sm' => '0.25rem',
                    'md' => '0.5rem',
                    'lg' => '1rem',
                    'full' => '9999px'
                ]
            ];

            // Get current theme settings
            $currentTheme = $db->query(
                "SELECT * FROM theme_settings ORDER BY id DESC LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$currentTheme) {
                Response::notFound('Theme settings not found');
            }

            // Update with default theme
            $db->execute(
                "UPDATE theme_settings SET settings = ?, updated_at = NOW() WHERE id = ?",
                [json_encode($defaultTheme), $currentTheme['id']]
            );

            Response::success([
                'message' => 'Theme settings reset to default',
                'settings' => $defaultTheme
            ]);

        } catch (Exception $e) {
            error_log("Reset theme settings error: " . $e->getMessage());
            Response::serverError('Failed to reset theme settings');
        }
        break;

    default:
        Response::notFound('Theme endpoint not found');
}
