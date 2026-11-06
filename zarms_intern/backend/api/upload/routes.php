<?php

/**
 * File Upload Routes
 */

// Suppress any HTML output from errors
ini_set('display_errors', '0');

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Note: File uploads use $_FILES and $_POST, not JSON body
$data = $_POST ?? [];

switch ($action) {

    // ============================================================
    // UPLOAD SINGLE IMAGE (Admin only)
    // ============================================================
    case 'image':
    case '':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Check if file was uploaded
            if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
                error_log('Upload error: No image file provided. $_FILES: ' . json_encode($_FILES));
                Response::error('No image file provided');
            }

            $file = $_FILES['image'];

            // Determine destination based on type parameter
            $type = $data['type'] ?? 'general';
            $destinationPath = match($type) {
                'portfolio' => UPLOAD_DIR . 'portfolio/',
                'gallery' => UPLOAD_DIR . 'gallery/',
                'profile' => UPLOAD_DIR . 'profiles/',
                default => UPLOAD_DIR . 'general/'
            };

            error_log("Upload single image: type=$type, path=$destinationPath, file=" . $file['name']);

            // Upload with resize and optional thumbnail
            $createThumbnail = isset($data['thumbnail']) && $data['thumbnail'] === 'true';
            $result = FileUpload::uploadImage($file, $destinationPath, true, $createThumbnail);

            if (!$result['success']) {
                error_log('Upload failed: ' . json_encode($result));
                Response::validationError($result['errors']);
            }

            Response::success([
                'message' => 'Image uploaded successfully',
                'url' => $result['url'],
                'thumbnailUrl' => $result['thumbnailUrl'] ?? null,
                'filename' => $result['filename']
            ], 'Success', 201);

        } catch (Throwable $e) {
            error_log("Upload image error: " . $e->getMessage() . " | Line: " . $e->getLine());
            Response::serverError('Failed to upload image: ' . $e->getMessage());
        }
        break;

    // ============================================================
    // UPLOAD MULTIPLE IMAGES (Admin only)
    // ============================================================
    case 'images':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Check if files were uploaded
            if (!isset($_FILES['images'])) {
                error_log('Upload error: No files provided. $_FILES: ' . json_encode($_FILES));
                Response::error('No image files provided');
            }

            $files = $_FILES['images'];

            $hasNoFiles = is_array($files['name'])
                ? empty($files['name'][0])
                : empty($files['name']);
            if ($hasNoFiles) {
                error_log('Upload error: Empty images payload. $_FILES: ' . json_encode($_FILES));
                Response::error('No image files provided');
            }

            // Ensure files is an array (handle single file upload)
            if (!isset($files['name'])) {
                Response::error('Invalid file upload format');
            }

            // Determine destination based on type parameter
            $type = $data['type'] ?? 'general';
            $destinationPath = match($type) {
                'portfolio' => UPLOAD_DIR . 'portfolio/',
                'gallery' => UPLOAD_DIR . 'gallery/',
                'profile' => UPLOAD_DIR . 'profiles/',
                default => UPLOAD_DIR . 'general/'
            };

            $fileCount = is_array($files['name']) ? count($files['name']) : 1;
            error_log("Upload multiple images: type=$type, path=$destinationPath, files=$fileCount");

            // Get max files limit
            $maxFiles = isset($data['maxFiles']) ? (int)$data['maxFiles'] : 5;

            // Upload multiple images
            $result = FileUpload::uploadMultiple($files, $destinationPath, $maxFiles);

            error_log('Upload result: ' . json_encode($result));

            if (!$result['success']) {
                error_log('Upload failed: ' . json_encode($result));
                Response::error($result['errors'][0] ?? 'Upload failed');
            }

            Response::success([
                'message' => 'Images uploaded successfully',
                'files' => $result['files']
            ], 'Success', 201);

        } catch (Throwable $e) {
            error_log("Upload multiple images error: " . $e->getMessage() . " | Line: " . $e->getLine() . " | Trace: " . $e->getTraceAsString());
            Response::serverError('Failed to upload images: ' . $e->getMessage());
        }
        break;

    // ============================================================
    // DELETE IMAGE (Admin only)
    // ============================================================
    case 'delete':
        if ($requestMethod !== 'DELETE') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Get image URL from request body
            $deleteData = json_decode(file_get_contents('php://input'), true) ?? [];

            if (!isset($deleteData['url'])) {
                Response::error('Image URL required');
            }

            // Delete file
            $deleted = FileUpload::deleteFileByUrl($deleteData['url']);

            if (!$deleted) {
                Response::error('Failed to delete image or image not found');
            }

            Response::success(['message' => 'Image deleted successfully']);

        } catch (Throwable $e) {
            error_log("Delete image error: " . $e->getMessage());
            Response::serverError('Failed to delete image');
        }
        break;

    default:
        Response::notFound('Upload endpoint not found');
}
