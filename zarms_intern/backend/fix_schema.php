<?php
/**
 * Database Migration Fixer
 * Creates the correct schema that matches the API routes
 */

require_once __DIR__ . '/config/database.php';

try {
    echo "[1/2] Connecting to database...\n";
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "[2/2] Fixing database schema to match API routes...\n";
    
    // Drop old tables
    try { $pdo->exec("DROP TABLE IF EXISTS login_audits"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS theme_settings"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS enquiry_emails"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS business_hours"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS social_links"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS contact_settings"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS enquiries"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS gallery"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS portfolio_images"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS portfolio"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS registration_requests"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS otps"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS sessions"); } catch (Exception $e) {}
    try { $pdo->exec("DROP TABLE IF EXISTS users"); } catch (Exception $e) {}
    
    // Users table
    echo "Creating users table...\n";
    try {
        $pdo->exec("CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin',
            status ENUM('active', 'suspended', 'inactive') NOT NULL DEFAULT 'active',
            is_primary_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP NULL,
            INDEX idx_email (email),
            INDEX idx_role (role),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Exception $e) {
        echo "Error creating users table: " . $e->getMessage() . "\n";
        throw $e;
    }
    
    // Sessions table
    $pdo->exec("CREATE TABLE sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(512) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // OTPs table
    $pdo->exec("CREATE TABLE otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        type ENUM('registration', 'forgot-password') NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INT DEFAULT 0,
        resend_count INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_type (email, type),
        INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Registration requests table
    $pdo->exec("CREATE TABLE registration_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        otp_verified BOOLEAN DEFAULT FALSE,
        status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Portfolio table
    $pdo->exec("CREATE TABLE portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description LONGTEXT NOT NULL,
        client VARCHAR(255),
        technologies JSON,
        project_url VARCHAR(500),
        completion_date DATE,
        featured BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        status ENUM('active', 'inactive', 'ongoing', 'completed') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_display_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Portfolio images table
    $pdo->exec("CREATE TABLE portfolio_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portfolio_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE,
        INDEX idx_portfolio_id (portfolio_id),
        INDEX idx_display_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Gallery table
    $pdo->exec("CREATE TABLE gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description LONGTEXT,
        image_url VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        display_order INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_display_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Enquiries table
    $pdo->exec("CREATE TABLE enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        category VARCHAR(100),
        subject VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Contact settings table
    $pdo->exec("CREATE TABLE contact_settings (
        id INT PRIMARY KEY DEFAULT 1,
        address LONGTEXT NOT NULL,
        phone VARCHAR(15),
        email VARCHAR(255),
        whatsapp_number VARCHAR(15),
        map_url LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_singleton CHECK (id = 1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Social links table
    $pdo->exec("CREATE TABLE social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) UNIQUE NOT NULL,
        url VARCHAR(500) NOT NULL,
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        INDEX idx_platform (platform),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Business hours table
    $pdo->exec("CREATE TABLE business_hours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        day VARCHAR(100) NOT NULL,
        hours VARCHAR(100) NOT NULL,
        display_order INT DEFAULT 0,
        INDEX idx_display_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Enquiry emails table
    $pdo->exec("CREATE TABLE enquiry_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        INDEX idx_email (email),
        INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Theme settings table
    $pdo->exec("CREATE TABLE theme_settings (
        id INT PRIMARY KEY DEFAULT 1,
        theme_data LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_singleton2 CHECK (id = 1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Login audits table
    $pdo->exec("CREATE TABLE login_audits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        failure_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "✓ Schema corrected successfully!\n";
    echo "\nNow seeding sample data...\n";
    
    // Insert admin user
    $hashedPassword = password_hash('Password@123', PASSWORD_DEFAULT);
    $pdo->exec("INSERT INTO users (name, email, phone, password, role, status, is_primary_admin, created_at) 
               VALUES ('Admin User', 'admin@zarms.com', '9876543210', " . $pdo->quote($hashedPassword) . ", 'superadmin', 'active', 1, NOW())");
    
    // Insert contact settings
    $pdo->exec("INSERT INTO contact_settings (id, address, phone, email, whatsapp_number, map_url) 
               VALUES (1, '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10', '9840344369', 'narbhavi555@gmail.com', '919994123797', NULL)");
    
    // Insert social links
    $pdo->exec("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES
               ('Facebook', 'https://facebook.com/zarmstec', 'Facebook', 1, 1),
               ('Instagram', 'https://instagram.com/zarmstec', 'Instagram', 1, 2),
               ('LinkedIn', 'https://linkedin.com/company/zarmstec', 'Linkedin', 1, 3),
               ('YouTube', 'https://youtube.com/@zarmstec', 'Youtube', 1, 4)");
    
    // Insert business hours
    $pdo->exec("INSERT INTO business_hours (day, hours, display_order) VALUES
               ('Monday - Friday', '9:00 AM - 6:00 PM', 1),
               ('Saturday', '9:00 AM - 2:00 PM', 2),
               ('Sunday', 'Closed', 3)");
    
    // Insert enquiry emails
    $pdo->exec("INSERT INTO enquiry_emails (email, is_active) VALUES
               ('narbhavi555@gmail.com', 1),
               ('rajesh.arms916@gmail.com', 1)");
    
    // Insert theme settings
    $themeData = json_encode([
        "brandPrimary" => "#1e3a8a",
        "brandSecondary" => "#d97706",
        "brandAccent" => "#d97706",
        "textPrimary" => "#111827",
        "textSecondary" => "#4b5563"
    ]);
    $pdo->exec("INSERT INTO theme_settings (id, theme_data) VALUES (1, " . $pdo->quote($themeData) . ")");
    
    echo "✓ Sample data inserted successfully!\n";
    echo "\nBackend is now fully functional!\n";
    echo "\nYou can test endpoints:\n";
    echo "- GET http://127.0.0.1:8000/backend/index.php?request=api/portfolio/list\n";
    echo "- GET http://127.0.0.1:8000/backend/index.php?request=api/gallery/list\n";
    echo "- GET http://127.0.0.1:8000/backend/index.php?request=api/contact-settings/get\n";
    echo "- POST http://127.0.0.1:8000/backend/index.php?request=api/auth/login\n";
    
} catch (Exception $e) {
    echo "✗ Schema fix failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
