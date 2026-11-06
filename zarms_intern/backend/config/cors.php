<?php

function setCorsHeaders() {
    $appEnv = getenv('APP_ENV') ?: 'development';
    $defaultOrigin = getenv('FRONTEND_URL') ?: 'http://localhost:5173';
    $allowedOrigins = array_map('trim', explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: $defaultOrigin));
    $allowedMethods = getenv('CORS_ALLOWED_METHODS') ?: 'GET,POST,PUT,DELETE,OPTIONS';
    $allowedHeaders = getenv('CORS_ALLOWED_HEADERS') ?: 'Content-Type,Authorization,X-Requested-With';

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $originAllowed = in_array($origin, $allowedOrigins, true);

    // Development fallback: allow localhost/127.0.0.1 with any port.
    // This avoids local breakage when Vite auto-switches port (e.g. 5174).
    if (!$originAllowed && $appEnv === 'development' && $origin !== '') {
        if (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin)) {
            $originAllowed = true;
        }
    }

    if ($originAllowed) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    } elseif ($appEnv === 'production' && $origin !== '') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => ['message' => 'CORS origin forbidden']
        ]);
        exit();
    }

    header("Access-Control-Allow-Methods: $allowedMethods");
    header("Access-Control-Allow-Headers: $allowedHeaders");
    header("Access-Control-Max-Age: 3600");

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code($originAllowed || $origin === '' ? 200 : 403);
        exit();
    }
}
