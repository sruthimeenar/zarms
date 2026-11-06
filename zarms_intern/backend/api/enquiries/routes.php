<?php

/**
 * Enquiry Management Routes
 */

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // GET ALL ENQUIRIES (Admin only)
    // ============================================================
    case 'list':
    case '':
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
            $service = $_GET['service'] ?? null;
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;

            // Build query
            $whereConditions = [];
            $params = [];

            if ($service) {
                $whereConditions[] = "service = ?";
                $params[] = $service;
            }

            if ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }

            if ($search) {
                $whereConditions[] = "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM enquiries {$whereClause}";
            $total = $db->query($countQuery, $params)->fetch(PDO::FETCH_ASSOC)['total'];

            // Get enquiries
            $query = "SELECT * FROM enquiries {$whereClause} ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}";
            $enquiries = $db->query($query, $params)->fetchAll(PDO::FETCH_ASSOC);

            Response::success([
                'enquiries' => $enquiries,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);

        } catch (Exception $e) {
            error_log("Get enquiries error: " . $e->getMessage());
            Response::serverError('Failed to retrieve enquiries');
        }
        break;

    // ============================================================
    // GET SINGLE ENQUIRY (Admin only)
    // ============================================================
    case 'get':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $enquiryId = $pathParts[3] ?? null;
            if (!$enquiryId) {
                Response::error('Enquiry ID required');
            }

            $enquiry = $db->query("SELECT * FROM enquiries WHERE id = ?", [$enquiryId])->fetch(PDO::FETCH_ASSOC);

            if (!$enquiry) {
                Response::notFound('Enquiry not found');
            }

            Response::success(['enquiry' => $enquiry]);

        } catch (Exception $e) {
            error_log("Get enquiry error: " . $e->getMessage());
            Response::serverError('Failed to retrieve enquiry');
        }
        break;

    // ============================================================
    // CREATE ENQUIRY (Public)
    // ============================================================
    case 'create':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            // Validate input
            $validation = Validator::validate($data, [
                'name' => 'required|min:2|max:100',
                'email' => 'required|email',
                'phone' => 'required|phone',
                'service' => 'required',
                'message' => 'required|min:10'
            ]);

            if (!$validation['valid']) {
                Response::validationError($validation['errors']);
            }

            // Create enquiry
            $db->execute(
                "INSERT INTO enquiries (name, email, phone, company, service, message, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $data['name'],
                    $data['email'],
                    $data['phone'],
                    $data['company'] ?? null,
                    $data['service'],
                    $data['message'],
                    STATUS_PENDING
                ]
            );
            $enquiryId = (int)$db->lastInsertId();

            // Get created enquiry
            $enquiry = $db->query("SELECT * FROM enquiries WHERE id = ?", [$enquiryId])->fetch(PDO::FETCH_ASSOC);
            if (!$enquiry) {
                Response::serverError('Enquiry submitted but could not be retrieved');
            }

            // Get enquiry notification emails
            $notificationEmails = $db->query(
                "SELECT email FROM enquiry_emails WHERE is_active = 1"
            )->fetchAll(PDO::FETCH_COLUMN);

            // Send notification emails
            if (!empty($notificationEmails)) {
                $notifyResults = Email::sendEnquiryNotification($notificationEmails, $enquiry);
                error_log('Enquiry notification results: ' . json_encode($notifyResults));
            } else {
                error_log('Enquiry notification skipped: no active enquiry_emails configured');
            }

            // Send thank-you email to enquiry submitter
            $thankYouResult = Email::sendEnquiryThankYou(
                $enquiry['email'],
                $enquiry['name'],
                $enquiry['service']
            );
            error_log('Enquiry thank-you result: ' . json_encode($thankYouResult));

            Response::success([
                'message' => 'Enquiry submitted successfully. We will contact you soon.',
                'enquiryId' => $enquiryId
            ], 'Success', 201);

        } catch (Throwable $e) {
            error_log("Create enquiry error: " . $e->getMessage());
            Response::serverError('Failed to submit enquiry');
        }
        break;

    // ============================================================
    // UPDATE ENQUIRY STATUS (Admin only)
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $enquiryId = $pathParts[3] ?? null;
            if (!$enquiryId) {
                Response::error('Enquiry ID required');
            }

            // Check if enquiry exists
            $enquiry = $db->query("SELECT * FROM enquiries WHERE id = ?", [$enquiryId])->fetch(PDO::FETCH_ASSOC);
            if (!$enquiry) {
                Response::notFound('Enquiry not found');
            }

            // Build update query
            $updates = [];
            $params = [];

            if (isset($data['status'])) {
                $updates[] = "status = ?";
                $params[] = $data['status'];
            }

            if (isset($data['notes'])) {
                $updates[] = "notes = ?";
                $params[] = $data['notes'];
            }

            if (!empty($updates)) {
                $updates[] = "updated_at = NOW()";
                $params[] = $enquiryId;

                $updateQuery = "UPDATE enquiries SET " . implode(", ", $updates) . " WHERE id = ?";
                $db->execute($updateQuery, $params);
            }

            // Get updated enquiry
            $updatedEnquiry = $db->query("SELECT * FROM enquiries WHERE id = ?", [$enquiryId])->fetch(PDO::FETCH_ASSOC);

            Response::success([
                'message' => 'Enquiry updated successfully',
                'enquiry' => $updatedEnquiry
            ]);

        } catch (Exception $e) {
            error_log("Update enquiry error: " . $e->getMessage());
            Response::serverError('Failed to update enquiry');
        }
        break;

    // ============================================================
    // DELETE ENQUIRY (Admin only)
    // ============================================================
    case 'delete':
        if ($requestMethod !== 'DELETE') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $enquiryId = $pathParts[3] ?? null;
            if (!$enquiryId) {
                Response::error('Enquiry ID required');
            }

            // Check if enquiry exists
            $enquiry = $db->query("SELECT * FROM enquiries WHERE id = ?", [$enquiryId])->fetch(PDO::FETCH_ASSOC);
            if (!$enquiry) {
                Response::notFound('Enquiry not found');
            }

            // Delete enquiry
            $db->execute("DELETE FROM enquiries WHERE id = ?", [$enquiryId]);

            Response::success(['message' => 'Enquiry deleted successfully']);

        } catch (Exception $e) {
            error_log("Delete enquiry error: " . $e->getMessage());
            Response::serverError('Failed to delete enquiry');
        }
        break;

    // ============================================================
    // GET ENQUIRY STATS (Admin only)
    // ============================================================
    case 'stats':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Get counts by status
            $statusStats = $db->query(
                "SELECT status, COUNT(*) as count FROM enquiries GROUP BY status"
            )->fetchAll(PDO::FETCH_ASSOC);

            // Get counts by service
            $serviceStats = $db->query(
                "SELECT service, COUNT(*) as count FROM enquiries GROUP BY service"
            )->fetchAll(PDO::FETCH_ASSOC);

            // Get recent enquiries count (last 7 days)
            $recentCount = $db->query(
                "SELECT COUNT(*) as count FROM enquiries WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
            )->fetch(PDO::FETCH_ASSOC)['count'];

            // Get total count
            $totalCount = $db->query("SELECT COUNT(*) as count FROM enquiries")->fetch(PDO::FETCH_ASSOC)['count'];

            Response::success([
                'total' => (int)$totalCount,
                'recent' => (int)$recentCount,
                'byStatus' => $statusStats,
                'byService' => $serviceStats
            ]);

        } catch (Exception $e) {
            error_log("Get enquiry stats error: " . $e->getMessage());
            Response::serverError('Failed to retrieve enquiry stats');
        }
        break;

    default:
        Response::notFound('Enquiry endpoint not found');
}
