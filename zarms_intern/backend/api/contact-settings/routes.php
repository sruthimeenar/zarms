<?php

/**
 * Contact Settings Routes
 */

$db = Database::getInstance();
$authMiddleware = new AuthMiddleware();

// Get request data
$data = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ============================================================
    // GET CONTACT SETTINGS (Public)
    // ============================================================
    case 'get':
    case '':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            // Get main contact settings
            $contactSettings = $db->query(
                "SELECT * FROM contact_settings ORDER BY id DESC LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$contactSettings) {
                Response::notFound('Contact settings not found');
            }

            // Get social links
            $socialLinks = $db->query(
                "SELECT platform, url, display_order FROM social_links WHERE is_active = 1 ORDER BY display_order ASC"
            )->fetchAll(PDO::FETCH_ASSOC);

            // Get business hours
            $businessHours = $db->query(
                "SELECT day, hours FROM business_hours ORDER BY display_order ASC"
            )->fetchAll(PDO::FETCH_ASSOC);

            // Get enquiry emails
            $enquiryEmails = $db->query(
                "SELECT email FROM enquiry_emails WHERE is_active = 1 ORDER BY id ASC"
            )->fetchAll(PDO::FETCH_COLUMN);

            Response::success([
                'contactSettings' => [
                    'constructionPhone' => $contactSettings['construction_phone'],
                    'constructionEmail' => $contactSettings['construction_email'],
                    'softwarePhone' => $contactSettings['software_phone'],
                    'softwareEmail' => $contactSettings['software_email'],
                    'whatsappNumber' => $contactSettings['whatsapp_number'],
                    'address' => $contactSettings['address'],
                    'mapsUrl' => $contactSettings['maps_url']
                ],
                'socialLinks' => $socialLinks,
                'businessHours' => $businessHours,
                'enquiryEmails' => $enquiryEmails
            ]);

        } catch (Exception $e) {
            error_log("Get contact settings error: " . $e->getMessage());
            Response::serverError('Failed to retrieve contact settings');
        }
        break;

    // ============================================================
    // UPDATE CONTACT SETTINGS (Admin only)
    // ============================================================
    case 'update':
        if ($requestMethod !== 'PUT' && $requestMethod !== 'PATCH') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            // Get current settings
            $currentSettings = $db->query(
                "SELECT * FROM contact_settings ORDER BY id DESC LIMIT 1"
            )->fetch(PDO::FETCH_ASSOC);

            if (!$currentSettings) {
                Response::notFound('Contact settings not found');
            }

            // Build update query
            $updates = [];
            $params = [];

            if (isset($data['constructionPhone'])) {
                $updates[] = "construction_phone = ?";
                $params[] = $data['constructionPhone'];
            }

            if (isset($data['constructionEmail'])) {
                $updates[] = "construction_email = ?";
                $params[] = $data['constructionEmail'];
            }

            if (isset($data['softwarePhone'])) {
                $updates[] = "software_phone = ?";
                $params[] = $data['softwarePhone'];
            }

            if (isset($data['softwareEmail'])) {
                $updates[] = "software_email = ?";
                $params[] = $data['softwareEmail'];
            }

            if (isset($data['whatsappNumber'])) {
                $updates[] = "whatsapp_number = ?";
                $params[] = $data['whatsappNumber'];
            }

            if (isset($data['address'])) {
                $updates[] = "address = ?";
                $params[] = $data['address'];
            }

            if (isset($data['mapsUrl'])) {
                $updates[] = "maps_url = ?";
                $params[] = $data['mapsUrl'];
            }

            if (!empty($updates)) {
                $updates[] = "updated_at = NOW()";
                $params[] = $currentSettings['id'];

                $updateQuery = "UPDATE contact_settings SET " . implode(", ", $updates) . " WHERE id = ?";
                $db->execute($updateQuery, $params);
            }

            Response::success(['message' => 'Contact settings updated successfully']);

        } catch (Exception $e) {
            error_log("Update contact settings error: " . $e->getMessage());
            Response::serverError('Failed to update contact settings');
        }
        break;

    // ============================================================
    // GET SOCIAL LINKS (Public)
    // ============================================================
    case 'social-links':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $socialLinks = $db->query(
                "SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order ASC"
            )->fetchAll(PDO::FETCH_ASSOC);

            foreach ($socialLinks as &$link) {
                $link['isActive'] = (bool)$link['is_active'];
                unset($link['is_active']);
            }

            Response::success(['socialLinks' => $socialLinks]);

        } catch (Exception $e) {
            error_log("Get social links error: " . $e->getMessage());
            Response::serverError('Failed to retrieve social links');
        }
        break;

    // ============================================================
    // UPDATE SOCIAL LINKS (Admin only)
    // ============================================================
    case 'update-social-links':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            if (!isset($data['socialLinks']) || !is_array($data['socialLinks'])) {
                Response::error('Social links array required');
            }

            // Delete all existing social links
            $db->execute("DELETE FROM social_links");

            // Insert new social links
            foreach ($data['socialLinks'] as $index => $link) {
                $db->execute(
                    "INSERT INTO social_links (platform, url, is_active, display_order) VALUES (?, ?, ?, ?)",
                    [
                        $link['platform'],
                        $link['url'],
                        isset($link['isActive']) ? ($link['isActive'] ? 1 : 0) : 1,
                        $index
                    ]
                );
            }

            Response::success(['message' => 'Social links updated successfully']);

        } catch (Exception $e) {
            error_log("Update social links error: " . $e->getMessage());
            Response::serverError('Failed to update social links');
        }
        break;

    // ============================================================
    // GET BUSINESS HOURS (Public)
    // ============================================================
    case 'business-hours':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $businessHours = $db->query(
                "SELECT * FROM business_hours ORDER BY display_order ASC"
            )->fetchAll(PDO::FETCH_ASSOC);

            Response::success(['businessHours' => $businessHours]);

        } catch (Exception $e) {
            error_log("Get business hours error: " . $e->getMessage());
            Response::serverError('Failed to retrieve business hours');
        }
        break;

    // ============================================================
    // UPDATE BUSINESS HOURS (Admin only)
    // ============================================================
    case 'update-business-hours':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            if (!isset($data['businessHours']) || !is_array($data['businessHours'])) {
                Response::error('Business hours array required');
            }

            // Delete all existing business hours
            $db->execute("DELETE FROM business_hours");

            // Insert new business hours
            foreach ($data['businessHours'] as $index => $hours) {
                $db->execute(
                    "INSERT INTO business_hours (day, hours, display_order) VALUES (?, ?, ?)",
                    [
                        $hours['day'],
                        $hours['hours'],
                        $index
                    ]
                );
            }

            Response::success(['message' => 'Business hours updated successfully']);

        } catch (Exception $e) {
            error_log("Update business hours error: " . $e->getMessage());
            Response::serverError('Failed to update business hours');
        }
        break;

    // ============================================================
    // GET ENQUIRY EMAILS (Admin only)
    // ============================================================
    case 'enquiry-emails':
        if ($requestMethod !== 'GET') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            $enquiryEmails = $db->query(
                "SELECT * FROM enquiry_emails ORDER BY id ASC"
            )->fetchAll(PDO::FETCH_ASSOC);

            foreach ($enquiryEmails as &$emailRecord) {
                $emailRecord['isActive'] = (bool)$emailRecord['is_active'];
                unset($emailRecord['is_active']);
            }

            Response::success(['enquiryEmails' => $enquiryEmails]);

        } catch (Exception $e) {
            error_log("Get enquiry emails error: " . $e->getMessage());
            Response::serverError('Failed to retrieve enquiry emails');
        }
        break;

    // ============================================================
    // UPDATE ENQUIRY EMAILS (Admin only)
    // ============================================================
    case 'update-enquiry-emails':
        if ($requestMethod !== 'POST') {
            Response::error('Method not allowed', 405);
        }

        try {
            $currentUser = RoleMiddleware::requireAdmin();

            if (!isset($data['enquiryEmails']) || !is_array($data['enquiryEmails'])) {
                Response::error('Enquiry emails array required');
            }

            // Delete all existing enquiry emails
            $db->execute("DELETE FROM enquiry_emails");

            // Insert new enquiry emails
            foreach ($data['enquiryEmails'] as $emailRecord) {
                $db->execute(
                    "INSERT INTO enquiry_emails (email, is_active) VALUES (?, ?)",
                    [
                        $emailRecord['email'],
                        isset($emailRecord['isActive']) ? ($emailRecord['isActive'] ? 1 : 0) : 1
                    ]
                );
            }

            Response::success(['message' => 'Enquiry emails updated successfully']);

        } catch (Exception $e) {
            error_log("Update enquiry emails error: " . $e->getMessage());
            Response::serverError('Failed to update enquiry emails');
        }
        break;

    default:
        Response::notFound('Contact settings endpoint not found');
}
