<?php

class FileUpload {

    /**
     * Validate uploaded file
     */
    public static function validate($file) {
        $errors = [];

        // Check if file was uploaded
        if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            $errors[] = 'No file was uploaded';
            return ['valid' => false, 'errors' => $errors];
        }

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'File upload error: ' . self::getUploadErrorMessage($file['error']);
            return ['valid' => false, 'errors' => $errors];
        }

        // Check file size
        if ($file['size'] > UPLOAD_MAX_SIZE) {
            $maxSizeMB = UPLOAD_MAX_SIZE / 1024 / 1024;
            $errors[] = "File size exceeds maximum allowed size of {$maxSizeMB}MB";
        }

        // Check file type
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, UPLOAD_ALLOWED_TYPES)) {
            $allowedTypes = implode(', ', UPLOAD_ALLOWED_TYPES);
            $errors[] = "Invalid file type. Allowed types: {$allowedTypes}";
        }

        // Verify file is actually an image
        $imageInfo = @getimagesize($file['tmp_name']);
        if (!$imageInfo) {
            $errors[] = 'File is not a valid image';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'extension' => $extension,
            'imageInfo' => $imageInfo
        ];
    }

    /**
     * Upload single image
     */
    public static function uploadImage($file, $destinationPath, $resize = true, $thumbnail = false) {
        // Validate file
        $validation = self::validate($file);
        if (!$validation['valid']) {
            return ['success' => false, 'errors' => $validation['errors']];
        }

        // Generate unique filename
        $extension = $validation['extension'];
        $filename = self::generateFilename() . '.' . $extension;
        $filepath = $destinationPath . $filename;

        // Create directory if it doesn't exist
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        // Resize image if needed
        if ($resize) {
            $resized = self::resizeImage(
                $file['tmp_name'],
                $filepath,
                IMAGE_MAX_WIDTH,
                IMAGE_MAX_HEIGHT
            );

            if (!$resized) {
                return ['success' => false, 'errors' => ['Failed to resize image']];
            }
        } else {
            // Move uploaded file without resizing
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return ['success' => false, 'errors' => ['Failed to upload file']];
            }
        }

        // Create thumbnail if requested
        $thumbnailPath = null;
        if ($thumbnail) {
            $thumbnailFilename = 'thumb_' . $filename;
            $thumbnailPath = $destinationPath . $thumbnailFilename;

            self::resizeImage($filepath, $thumbnailPath, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
        }

        // Generate public URL relative to backend root
        $url = self::buildPublicUrl($filepath);

        $thumbnailUrl = null;
        if ($thumbnailPath) {
            $thumbnailUrl = self::buildPublicUrl($thumbnailPath);
        }

        return [
            'success' => true,
            'filename' => $filename,
            'filepath' => $filepath,
            'url' => $url,
            'thumbnailUrl' => $thumbnailUrl
        ];
    }

    /**
     * Upload multiple images
     */
    public static function uploadMultiple($files, $destinationPath, $maxFiles = 5) {
        // Normalize single-file payloads to array shape
        if (!is_array($files['name'])) {
            $files = [
                'name' => [$files['name']],
                'type' => [$files['type']],
                'tmp_name' => [$files['tmp_name']],
                'error' => [$files['error']],
                'size' => [$files['size']]
            ];
        }

        $results = [];
        $count = count($files['name']);

        if ($count > $maxFiles) {
            return [
                'success' => false,
                'errors' => ["Maximum {$maxFiles} files allowed"]
            ];
        }

        for ($i = 0; $i < $count; $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];

            $result = self::uploadImage($file, $destinationPath, true, false);
            $results[] = $result;

            if (!$result['success']) {
                // Roll back any files already uploaded in this batch
                foreach ($results as $uploaded) {
                    if (!empty($uploaded['success']) && !empty($uploaded['filepath'])) {
                        self::deleteFile($uploaded['filepath']);
                    }
                }

                return [
                    'success' => false,
                    'errors' => $result['errors'],
                    'uploaded' => []
                ];
            }
        }

        return [
            'success' => true,
            'files' => array_map(fn($r) => [
                'filename' => $r['filename'],
                'url' => $r['url']
            ], $results)
        ];
    }

    /**
     * Resize image maintaining aspect ratio
     */
    private static function resizeImage($source, $destination, $maxWidth, $maxHeight) {
        // Get original image info
        $imageInfo = getimagesize($source);
        if (!$imageInfo) {
            return false;
        }

        list($origWidth, $origHeight, $imageType) = $imageInfo;

        // Calculate new dimensions
        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);

        // Don't upscale images
        if ($ratio >= 1) {
            return copy($source, $destination);
        }

        $newWidth = (int)($origWidth * $ratio);
        $newHeight = (int)($origHeight * $ratio);

        // Guard against memory exhaustion when decoding large images.
        // If not enough headroom, skip resize and keep original upload.
        if (!self::canProcessImageWithMemory($origWidth, $origHeight, $imageType)) {
            error_log("Image resize skipped due to memory limit: {$origWidth}x{$origHeight}");
            return copy($source, $destination);
        }

        // Create source image
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $sourceImage = imagecreatefromjpeg($source);
                break;
            case IMAGETYPE_PNG:
                $sourceImage = imagecreatefrompng($source);
                break;
            case IMAGETYPE_WEBP:
                $sourceImage = imagecreatefromwebp($source);
                break;
            default:
                return false;
        }

        if (!$sourceImage) {
            return false;
        }

        // Create new image
        $newImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for PNG
        if ($imageType === IMAGETYPE_PNG) {
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);
            $transparent = imagecolorallocatealpha($newImage, 0, 0, 0, 127);
            imagefill($newImage, 0, 0, $transparent);
        }

        // Resize
        imagecopyresampled(
            $newImage,
            $sourceImage,
            0, 0, 0, 0,
            $newWidth,
            $newHeight,
            $origWidth,
            $origHeight
        );

        // Save resized image
        $success = false;
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $success = imagejpeg($newImage, $destination, 90);
                break;
            case IMAGETYPE_PNG:
                $success = imagepng($newImage, $destination, 9);
                break;
            case IMAGETYPE_WEBP:
                $success = imagewebp($newImage, $destination, 90);
                break;
        }

        // Free memory
        imagedestroy($sourceImage);
        imagedestroy($newImage);

        return $success;
    }

    /**
     * Check if GD image processing is likely to fit into current memory limit.
     */
    private static function canProcessImageWithMemory($width, $height, $imageType = IMAGETYPE_JPEG) {
        $memoryLimit = self::memoryLimitBytes();
        if ($memoryLimit <= 0) {
            // Unlimited memory
            return true;
        }

        $currentUsage = memory_get_usage(true);

        // PNG decode can be significantly heavier in GD than JPG.
        $bytesPerPixel = ($imageType === IMAGETYPE_PNG) ? 8 : 5;

        // Very large PNGs are high-risk for OOM; keep original without resize.
        if ($imageType === IMAGETYPE_PNG && ($width * $height) > 12000000) {
            return false;
        }

        // Conservative upper-bound: source + destination + working buffers.
        $sourceBytes = $width * $height * $bytesPerPixel;
        $destWidth = min($width, IMAGE_MAX_WIDTH);
        $destHeight = min($height, IMAGE_MAX_HEIGHT);
        $destBytes = $destWidth * $destHeight * $bytesPerPixel;
        $workingBuffers = ($sourceBytes + $destBytes) * 0.35;
        $overhead = 24 * 1024 * 1024; // 24MB safety cushion
        $required = $sourceBytes + $destBytes + $workingBuffers + $overhead;

        // Keep at least 24MB free after allocation to avoid edge OOM.
        return ($currentUsage + $required) < ($memoryLimit - (24 * 1024 * 1024));
    }

    /**
     * Convert php.ini memory_limit to bytes. Returns -1 for unlimited.
     */
    private static function memoryLimitBytes() {
        $limit = ini_get('memory_limit');
        if ($limit === false || $limit === '' || $limit === '-1') {
            return -1;
        }

        $value = (int)$limit;
        $unit = strtolower(substr(trim($limit), -1));
        switch ($unit) {
            case 'g':
                return $value * 1024 * 1024 * 1024;
            case 'm':
                return $value * 1024 * 1024;
            case 'k':
                return $value * 1024;
            default:
                return $value;
        }
    }

    /**
     * Build public URL from absolute file path.
     */
    private static function buildPublicUrl($absolutePath) {
        $uploadRoot = realpath(UPLOAD_PATH) ?: UPLOAD_PATH;
        $resolvedPath = realpath($absolutePath) ?: $absolutePath;

        $uploadRoot = str_replace('\\', '/', $uploadRoot);
        $resolvedPath = str_replace('\\', '/', $resolvedPath);

        $relativePath = ltrim(str_replace($uploadRoot, '', $resolvedPath), '/');
        return rtrim(UPLOAD_PUBLIC_URL, '/') . '/' . $relativePath;
    }

    /**
     * Delete file
     */
    public static function deleteFile($filepath) {
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }

    /**
     * Delete file by URL
     */
    public static function deleteFileByUrl($url) {
        $normalizedUrl = str_replace('\\', '/', $url);
        $baseUrl = rtrim(str_replace('\\', '/', UPLOAD_PUBLIC_URL), '/');

        if (str_starts_with($normalizedUrl, $baseUrl . '/')) {
            $relativePath = ltrim(substr($normalizedUrl, strlen($baseUrl)), '/');
            $filepath = rtrim(str_replace('\\', '/', UPLOAD_PATH), '/') . '/' . $relativePath;
            return self::deleteFile($filepath);
        }

        // Backward compatibility with legacy backend/uploads URLs
        $legacyBase = rtrim(str_replace('\\', '/', APP_URL), '/') . '/uploads/';
        if (str_starts_with($normalizedUrl, $legacyBase)) {
            $relativePath = substr($normalizedUrl, strlen($legacyBase));
            $legacyPath = __DIR__ . '/../uploads/' . $relativePath;
            return self::deleteFile($legacyPath);
        }

        return false;
    }

    /**
     * Generate unique filename
     */
    private static function generateFilename() {
        return uniqid() . '_' . time() . '_' . bin2hex(random_bytes(8));
    }

    /**
     * Get upload error message
     */
    private static function getUploadErrorMessage($errorCode) {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'File size exceeds maximum allowed size';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'Upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }

    /**
     * Get file size in human-readable format
     */
    public static function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
