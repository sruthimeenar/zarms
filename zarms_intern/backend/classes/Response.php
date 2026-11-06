<?php

class Response {

    public static function json($data = null, $statusCode = 200, $message = null) {
        http_response_code($statusCode);
        header('Content-Type: application/json');

        $response = [];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            if (is_array($data) && isset($data['success'])) {
                $response = array_merge($response, $data);
            } else {
                $response['data'] = $data;
            }
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    public static function error($message = 'An error occurred', $statusCode = 400, $errors = null) {
        // Log detailed error in development mode
        if (getenv('APP_ENV') === 'development') {
            error_log("API Error [$statusCode]: $message");
            if ($errors !== null) {
                error_log("Validation Errors: " . json_encode($errors));
            }
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
            foreach ($backtrace as $trace) {
                if (isset($trace['file']) && isset($trace['line'])) {
                    error_log("  at {$trace['file']}:{$trace['line']}");
                }
            }
        }

        $response = [
            'success' => false,
            'message' => $message
        ];

        // Only include detailed errors in development
        if ($errors !== null && getenv('APP_ENV') === 'development') {
            $response['errors'] = $errors;
        }

        self::json($response, $statusCode);
    }

    public static function unauthorized($message = 'Unauthorized access') {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Access forbidden') {
        self::error($message, 403);
    }

    public static function notFound($message = 'Resource not found') {
        self::error($message, 404);
    }

    public static function validationError($errors, $message = 'Validation failed') {
        self::error($message, 422, $errors);
    }

    public static function serverError($message = 'Internal server error') {
        self::error($message, 500);
    }
}
