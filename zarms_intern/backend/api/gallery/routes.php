<?php

/**
 * Gallery Management Routes
 */

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // GET ALL GALLERY IMAGES (Public)
    // ============================================================
    case 'list':
    case '':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            // Optional auth
            $currentUser = $authMiddleware->optionalAuth();
            $isAdmin = $currentUser && in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);

            // Filters
            $service = $_GET['service'] ?? null;
            $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
            $status = $_GET['status'] ?? null;

            // Build query
            $whereConditions = [];
            $params = [];

            // Non-admins can only see active images
            if (!$isAdmin) {
                $whereConditions[] = "status = ?";
                $params[] = STATUS_ACTIVE;
            } elseif ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }

            if ($service) {
                $whereConditions[] = "service = ?";
                $params[] = $service;
            }

            if ($featured !== null) {
                $whereConditions[] = "featured = ?";
                $params[] = $featured ? 1 : 0;
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get images
            $query = "SELECT * FROM gallery {$whereClause} ORDER BY display_order ASC, created_at DESC";
            $images = $db->query($query, $params)->fetchAll(PDO::FETCH_ASSOC);

            // Convert booleans
            foreach ($images as &$image) {
                $image['featured'] = (bool)$image['featured'];
            }

            Response::success(['images' => $images]);

        } catch (Exception $e) {
            error_log("Get gallery images error: " . $e->getMessage());
            Response::serverError('Failed to retrieve gallery images');
        }
        break;

    // ============================================================
    // GET SINGLE GALLERY IMAGE (Public)
    // ============================================================
    case 'get':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = $authMiddleware->optionalAuth();
            $isAdmin = $currentUser && in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);

            $imageId = $pathParts[3] ?? null;
            if (!$imageId) {
                Response::error('Image ID required');
            }

            $image = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);

            if (!$image) {
                Response::notFound('Image not found');
            }

            // Non-admins can only see active images
            if (!$isAdmin && $image['status'] !== STATUS_ACTIVE) {
                Response::notFound('Image not found');
            }

            $image['featured'] = (bool)$image['featured'];

            Response::success(['image' => $image]);

        } catch (Exception $e) {
            error_log("Get gallery image error: " . $e->getMessage());
            Response::serverError('Failed to retrieve image');
        }
        break;

    // ============================================================
    // CREATE GALLERY IMAGE (Admin only)
    // ============================================================
    case 'create':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Validate input
            $validation = Validator::validate($data, [
                'imageUrl' => 'required|url',
                'service' => 'required'
            ]);

            if (!$validation['valid']) {
                Response::validationError($validation['errors']);
            }

            // Get max display order for the service
            $maxOrder = $db->query(
                "SELECT MAX(display_order) as max_order FROM gallery WHERE service = ?",
                [$data['service']]
            )->fetch(PDO::FETCH_ASSOC);
            $displayOrder = ($maxOrder['max_order'] ?? 0) + 1;

            // Create gallery image
            $db->execute(
                "INSERT INTO gallery (image_url, thumbnail_url, service, title, description, featured, display_order, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['imageUrl'],
                    $data['thumbnailUrl'] ?? null,
                    $data['service'],
                    $data['title'] ?? null,
                    $data['description'] ?? null,
                    isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0,
                    $data['displayOrder'] ?? $displayOrder,
                    $data['status'] ?? STATUS_ACTIVE,
                    $currentUser['id']
                ]
            );
            $imageId = (int)$db->lastInsertId();

            // Get created image
            $image = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);
            if (!$image) {
                Response::serverError('Gallery image created but could not be retrieved');
            }
            $image['featured'] = (bool)$image['featured'];

            Response::success([
                'message' => 'Gallery image created successfully',
                'image' => $image
            ], 'Success', 201);

        } catch (Throwable $e) {
            error_log("Create gallery image error: " . $e->getMessage());
            Response::serverError('Failed to create gallery image');
        }
        break;

    // ============================================================
    // UPDATE GALLERY IMAGE (Admin only)
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $imageId = $pathParts[3] ?? null;
            if (!$imageId) {
                Response::error('Image ID required');
            }

            // Check if image exists
            $image = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);
            if (!$image) {
                Response::notFound('Image not found');
            }
            $oldImageUrl = $image['image_url'] ?? null;
            $oldThumbnailUrl = $image['thumbnail_url'] ?? null;

            // Build update query
            $updates = [];
            $params = [];

            if (isset($data['imageUrl'])) {
                $updates[] = "image_url = ?";
                $params[] = $data['imageUrl'];
            }

            if (isset($data['thumbnailUrl'])) {
                $updates[] = "thumbnail_url = ?";
                $params[] = $data['thumbnailUrl'];
            }

            if (isset($data['service'])) {
                $updates[] = "service = ?";
                $params[] = $data['service'];
            }

            if (isset($data['title'])) {
                $updates[] = "title = ?";
                $params[] = $data['title'];
            }

            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }

            if (isset($data['featured'])) {
                $updates[] = "featured = ?";
                $params[] = $data['featured'] ? 1 : 0;
            }

            if (isset($data['displayOrder'])) {
                $updates[] = "display_order = ?";
                $params[] = $data['displayOrder'];
            }

            if (isset($data['status'])) {
                $updates[] = "status = ?";
                $params[] = $data['status'];
            }

            if (!empty($updates)) {
                $updates[] = "updated_at = NOW()";
                $params[] = $imageId;

                $updateQuery = "UPDATE gallery SET " . implode(", ", $updates) . " WHERE id = ?";
                $db->execute($updateQuery, $params);
            }

            // If image files were replaced, delete old files from storage.
            if (isset($data['imageUrl']) && $oldImageUrl && $data['imageUrl'] !== $oldImageUrl) {
                FileUpload::deleteFileByUrl($oldImageUrl);
            }
            if (isset($data['thumbnailUrl']) && $oldThumbnailUrl && $data['thumbnailUrl'] !== $oldThumbnailUrl) {
                FileUpload::deleteFileByUrl($oldThumbnailUrl);
            }

            // Get updated image
            $updatedImage = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);
            $updatedImage['featured'] = (bool)$updatedImage['featured'];

            Response::success([
                'message' => 'Gallery image updated successfully',
                'image' => $updatedImage
            ]);

        } catch (Throwable $e) {
            error_log("Update gallery image error: " . $e->getMessage());
            Response::serverError('Failed to update image');
        }
        break;

    // ============================================================
    // DELETE GALLERY IMAGE (Admin only)
    // ============================================================
    case 'delete':
        if ($requestMethod !== 'DELETE') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $imageId = $pathParts[3] ?? null;
            if (!$imageId) {
                Response::error('Image ID required');
            }

            // Get image to delete files
            $image = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);
            if (!$image) {
                Response::notFound('Image not found');
            }

            // Delete from database
            $db->execute("DELETE FROM gallery WHERE id = ?", [$imageId]);

            // Delete image files
            FileUpload::deleteFileByUrl($image['image_url']);
            if ($image['thumbnail_url']) {
                FileUpload::deleteFileByUrl($image['thumbnail_url']);
            }

            Response::success(['message' => 'Gallery image deleted successfully']);

        } catch (Exception $e) {
            error_log("Delete gallery image error: " . $e->getMessage());
            Response::serverError('Failed to delete image');
        }
        break;

    // ============================================================
    // BULK DELETE GALLERY IMAGES (Admin only)
    // ============================================================
    case 'bulk-delete':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Validate input
            if (!isset($data['ids']) || !is_array($data['ids']) || empty($data['ids'])) {
                Response::error('Image IDs array required');
            }

            $deletedCount = 0;
            foreach ($data['ids'] as $imageId) {
                // Get image
                $image = $db->query("SELECT * FROM gallery WHERE id = ?", [$imageId])->fetch(PDO::FETCH_ASSOC);
                if ($image) {
                    // Delete from database
                    $db->execute("DELETE FROM gallery WHERE id = ?", [$imageId]);

                    // Delete image files
                    FileUpload::deleteFileByUrl($image['image_url']);
                    if ($image['thumbnail_url']) {
                        FileUpload::deleteFileByUrl($image['thumbnail_url']);
                    }

                    $deletedCount++;
                }
            }

            Response::success([
                'message' => "{$deletedCount} gallery image(s) deleted successfully",
                'deletedCount' => $deletedCount
            ]);

        } catch (Exception $e) {
            error_log("Bulk delete gallery images error: " . $e->getMessage());
            Response::serverError('Failed to delete images');
        }
        break;

    default:
        Response::notFound('Gallery endpoint not found');
}
