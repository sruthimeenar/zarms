<?php

/**
 * ZARMS Tec Backend API
 * Entry Point & Router
 */

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;

        // Parse key=value handling quoted values
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);

            // Remove quotes from value if present
            $value = trim($value);
            if (strlen($value) >= 2) {
                $firstChar = $value[0];
                $lastChar = $value[strlen($value) - 1];
                if (($firstChar === '"' && $lastChar === '"') || ($firstChar === "'" && $lastChar === "'")) {
                    $value = substr($value, 1, -1);
                }
            }

            putenv("$key=$value");
            // Also set to $_ENV and $_SERVER for consistency
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Load configuration
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

// Composer autoload (PHPMailer, JWT, etc.)
$composerAutoload = __DIR__ . '/vendor/autoload.php';
if (file_exists($composerAutoload)) {
    require_once $composerAutoload;
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', APP_ENV === 'development' ? '1' : '0');
ini_set('log_errors', '1');

// Load classes
require_once __DIR__ . '/classes/Response.php';
require_once __DIR__ . '/classes/Validator.php';
require_once __DIR__ . '/classes/OTP.php';
require_once __DIR__ . '/classes/Email.php';
require_once __DIR__ . '/classes/Auth.php';
require_once __DIR__ . '/classes/FileUpload.php';

// Load middleware
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/RoleMiddleware.php';

// Set CORS headers
setCorsHeaders();

// Get request URI and method
$requestUri = $_GET['request'] ?? '';
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Parse request path
$path = trim($requestUri, '/');
$pathParts = explode('/', $path);

// Route the request
try {
    // Health check endpoint
    if ($path === '' || $path === 'health') {
        Response::success([
            'status' => 'ok',
            'message' => 'ZARMS Tec API is running',
            'version' => '1.0.0',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    // Diagnostic endpoint (API + DB status)
    if ($path === 'health/db') {
        try {
            $db = Database::getInstance();
            $db->query('SELECT 1');
            Response::success([
                'status' => 'ok',
                'api' => 'up',
                'database' => 'up',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } catch (Throwable $e) {
            Response::error('Database connection failed', 500, [
                'status' => 'error',
                'api' => 'up',
                'database' => 'down',
                'timestamp' => date('Y-m-d H:i:s'),
                'details' => APP_ENV === 'development' ? $e->getMessage() : 'hidden'
            ]);
        }
    }

    // API routes
    if ($pathParts[0] === 'api') {
        $endpoint = $pathParts[1] ?? '';
        $action = $pathParts[2] ?? '';

        switch ($endpoint) {
            case 'auth':
                require_once __DIR__ . '/api/auth/routes.php';
                break;

            case 'users':
                require_once __DIR__ . '/api/users/routes.php';
                break;

            case 'portfolio':
                require_once __DIR__ . '/api/portfolio/routes.php';
                break;

            case 'gallery':
                require_once __DIR__ . '/api/gallery/routes.php';
                break;

            case 'enquiries':
                require_once __DIR__ . '/api/enquiries/routes.php';
                break;

            case 'contact-settings':
                require_once __DIR__ . '/api/contact-settings/routes.php';
                break;

            case 'theme':
                require_once __DIR__ . '/api/theme/routes.php';
                break;

            case 'upload':
                require_once __DIR__ . '/api/upload/routes.php';
                break;

            default:
                Response::notFound('Endpoint not found');
        }
    }

    // If no route matched
    Response::notFound('Route not found');

} catch (Throwable $e) {
    // Log error
    error_log("API Error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());

    // Return error response
    if (APP_ENV === 'development') {
        Response::serverError($e->getMessage());
    } else {
        Response::serverError('An unexpected error occurred');
    }
}
