<?php

/**
 * Portfolio Management Routes
 */

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // GET ALL PORTFOLIO PROJECTS (Public)
    // ============================================================
    case 'list':
    case '':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            // Optional auth (to show all for admins, only active for public)
            $currentUser = $authMiddleware->optionalAuth();
            $isAdmin = $currentUser && in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);

            // Filters
            $category = $_GET['category'] ?? null;
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;

            // Build query
            $whereConditions = [];
            $params = [];

            // Portfolio status enum is ongoing/completed in schema
            if ($status) {
                $whereConditions[] = "p.status = ?";
                $params[] = $status;
            }

            if ($category) {
                $whereConditions[] = "p.category = ?";
                $params[] = $category;
            }

            if ($search) {
                $whereConditions[] = "(p.title LIKE ? OR p.description LIKE ? OR p.client LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get projects
            $query = "SELECT p.*, GROUP_CONCAT(pi.image_url ORDER BY pi.display_order) as images
                      FROM portfolio p
                      LEFT JOIN portfolio_images pi ON p.id = pi.portfolio_id
                      {$whereClause}
                      GROUP BY p.id
                      ORDER BY p.display_order ASC, p.created_at DESC";

            $projects = $db->query($query, $params)->fetchAll(PDO::FETCH_ASSOC);

            // Process each project
            foreach ($projects as &$project) {
                // Convert images string to array
                $project['images'] = $project['images'] ? explode(',', $project['images']) : [];

                // Convert booleans
                $project['featured'] = (bool)$project['featured'];

                // Parse JSON fields
                $project['technologies'] = $project['technologies'] ? json_decode($project['technologies'], true) : [];
            }

            Response::success(['projects' => $projects]);

        } catch (Exception $e) {
            error_log("Get portfolio projects error: " . $e->getMessage());
            Response::serverError('Failed to retrieve portfolio projects');
        }
        break;

    // ============================================================
    // GET SINGLE PORTFOLIO PROJECT (Public)
    // ============================================================
    case 'get':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = $authMiddleware->optionalAuth();
            $isAdmin = $currentUser && in_array($currentUser['role'], [ROLE_ADMIN, ROLE_SUPERADMIN]);

            $projectId = $pathParts[3] ?? null;
            if (!$projectId) {
                Response::error('Project ID required');
            }

            // Get project
            $project = $db->query(
                "SELECT * FROM portfolio WHERE id = ?",
                [$projectId]
            )->fetch(PDO::FETCH_ASSOC);

            if (!$project) {
                Response::notFound('Project not found');
            }

            // Get images
            $images = $db->query(
                "SELECT image_url FROM portfolio_images WHERE portfolio_id = ? ORDER BY display_order ASC",
                [$projectId]
            )->fetchAll(PDO::FETCH_COLUMN);

            $project['images'] = $images;
            $project['featured'] = (bool)$project['featured'];
            $project['technologies'] = $project['technologies'] ? json_decode($project['technologies'], true) : [];

            Response::success(['project' => $project]);

        } catch (Exception $e) {
            error_log("Get portfolio project error: " . $e->getMessage());
            Response::serverError('Failed to retrieve project');
        }
        break;

    // ============================================================
    // CREATE PORTFOLIO PROJECT (Admin only)
    // ============================================================
    case 'create':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Validate input
            $validation = Validator::validate($data, [
                'title' => 'required|min:3|max:200',
                'category' => 'required',
                'description' => 'required|min:10'
            ]);

            if (!$validation['valid']) {
                Response::validationError($validation['errors']);
            }

            // Get max display order
            $maxOrder = $db->query("SELECT MAX(display_order) as max_order FROM portfolio")->fetch(PDO::FETCH_ASSOC);
            $displayOrder = ($maxOrder['max_order'] ?? 0) + 1;

            // Create project
            $db->execute(
                "INSERT INTO portfolio (title, category, description, client, technologies, project_url, completion_date, featured, display_order, status, created_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['title'],
                    $data['category'],
                    $data['description'],
                    $data['client'] ?? null,
                    isset($data['technologies']) ? json_encode($data['technologies']) : null,
                    $data['projectUrl'] ?? null,
                    $data['completionDate'] ?? null,
                    isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0,
                    $data['displayOrder'] ?? $displayOrder,
                    $data['status'] ?? STATUS_ACTIVE,
                    $currentUser['id']
                ]
            );
            $projectId = (int)$db->lastInsertId();

            // Add images if provided
            if (isset($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $index => $imageUrl) {
                    $db->execute(
                        "INSERT INTO portfolio_images (portfolio_id, image_url, display_order) VALUES (?, ?, ?)",
                        [$projectId, $imageUrl, $index]
                    );
                }
            }

            // Get created project
            $project = $db->query("SELECT * FROM portfolio WHERE id = ?", [$projectId])->fetch(PDO::FETCH_ASSOC);
            if (!$project) {
                Response::serverError('Portfolio project created but could not be retrieved');
            }
            $images = $db->query(
                "SELECT image_url FROM portfolio_images WHERE portfolio_id = ? ORDER BY display_order ASC",
                [$projectId]
            )->fetchAll(PDO::FETCH_COLUMN);

            $project['images'] = $images;
            $project['featured'] = (bool)$project['featured'];
            $project['technologies'] = $project['technologies'] ? json_decode($project['technologies'], true) : [];

            Response::success([
                'message' => 'Portfolio project created successfully',
                'project' => $project
            ], 'Success', 201);

        } catch (Throwable $e) {
            error_log("Create portfolio project error: " . $e->getMessage());
            Response::serverError('Failed to create project');
        }
        break;

    // ============================================================
    // UPDATE PORTFOLIO PROJECT (Admin only)
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $projectId = $pathParts[3] ?? null;
            if (!$projectId) {
                Response::error('Project ID required');
            }

            // Check if project exists
            $project = $db->query("SELECT * FROM portfolio WHERE id = ?", [$projectId])->fetch(PDO::FETCH_ASSOC);
            if (!$project) {
                Response::notFound('Project not found');
            }

            // Capture existing image URLs so removed/replaced files can be deleted from disk.
            $existingImages = $db->query(
                "SELECT image_url FROM portfolio_images WHERE portfolio_id = ? ORDER BY display_order ASC",
                [$projectId]
            )->fetchAll(PDO::FETCH_COLUMN);

            // Build update query
            $updates = [];
            $params = [];

            if (isset($data['title'])) {
                $updates[] = "title = ?";
                $params[] = $data['title'];
            }

            if (isset($data['category'])) {
                $updates[] = "category = ?";
                $params[] = $data['category'];
            }

            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }

            if (isset($data['client'])) {
                $updates[] = "client = ?";
                $params[] = $data['client'];
            }

            if (isset($data['technologies'])) {
                $updates[] = "technologies = ?";
                $params[] = json_encode($data['technologies']);
            }

            if (isset($data['projectUrl'])) {
                $updates[] = "project_url = ?";
                $params[] = $data['projectUrl'];
            }

            if (isset($data['completionDate'])) {
                $updates[] = "completion_date = ?";
                $params[] = $data['completionDate'];
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
                $params[] = $projectId;

                $updateQuery = "UPDATE portfolio SET " . implode(", ", $updates) . " WHERE id = ?";
                $db->execute($updateQuery, $params);
            }

            // Update images if provided
            if (isset($data['images']) && is_array($data['images'])) {
                $newImages = $data['images'];

                // Delete existing images
                $db->execute("DELETE FROM portfolio_images WHERE portfolio_id = ?", [$projectId]);

                // Add new images
                foreach ($newImages as $index => $imageUrl) {
                    $db->execute(
                        "INSERT INTO portfolio_images (portfolio_id, image_url, display_order) VALUES (?, ?, ?)",
                        [$projectId, $imageUrl, $index]
                    );
                }

                // Delete files removed in this update from storage.
                $removedImages = array_diff($existingImages ?: [], $newImages);
                foreach ($removedImages as $removedImageUrl) {
                    FileUpload::deleteFileByUrl($removedImageUrl);
                }
            }

            // Get updated project
            $updatedProject = $db->query("SELECT * FROM portfolio WHERE id = ?", [$projectId])->fetch(PDO::FETCH_ASSOC);
            $images = $db->query(
                "SELECT image_url FROM portfolio_images WHERE portfolio_id = ? ORDER BY display_order ASC",
                [$projectId]
            )->fetchAll(PDO::FETCH_COLUMN);

            $updatedProject['images'] = $images;
            $updatedProject['featured'] = (bool)$updatedProject['featured'];
            $updatedProject['technologies'] = $updatedProject['technologies'] ? json_decode($updatedProject['technologies'], true) : [];

            Response::success([
                'message' => 'Portfolio project updated successfully',
                'project' => $updatedProject
            ]);

        } catch (Throwable $e) {
            error_log("Update portfolio project error: " . $e->getMessage());
            Response::serverError('Failed to update project');
        }
        break;

    // ============================================================
    // DELETE PORTFOLIO PROJECT (Admin only)
    // ============================================================
    case 'delete':
        if ($requestMethod !== 'DELETE') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $projectId = $pathParts[3] ?? null;
            if (!$projectId) {
                Response::error('Project ID required');
            }

            // Check if project exists
            $project = $db->query("SELECT * FROM portfolio WHERE id = ?", [$projectId])->fetch(PDO::FETCH_ASSOC);
            if (!$project) {
                Response::notFound('Project not found');
            }

            // Get images to delete files
            $images = $db->query(
                "SELECT image_url FROM portfolio_images WHERE portfolio_id = ?",
                [$projectId]
            )->fetchAll(PDO::FETCH_COLUMN);

            // Delete project (cascade will delete images from DB)
            $db->execute("DELETE FROM portfolio WHERE id = ?", [$projectId]);

            // Delete image files
            foreach ($images as $imageUrl) {
                FileUpload::deleteFileByUrl($imageUrl);
            }

            Response::success(['message' => 'Portfolio project deleted successfully']);

        } catch (Exception $e) {
            error_log("Delete portfolio project error: " . $e->getMessage());
            Response::serverError('Failed to delete project');
        }
        break;

    default:
        Response::notFound('Portfolio endpoint not found');
}
