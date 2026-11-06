<?php
require_once __DIR__ . '/config/database.php';

$pdo = Database::getInstance()->getConnection();

try {
    echo "Step 1: Dropping old tables...\n";
    $tables = ['login_audits', 'theme_settings', 'enquiry_emails', 'business_hours', 'social_links', 'contact_settings', 'enquiries', 'gallery', 'portfolio_images', 'portfolio', 'registration_requests', 'otps', 'sessions', 'users'];
    foreach ($tables as $table) {
        $pdo->exec("DROP TABLE IF EXISTS $table");
    }
    
    echo "Step 2: Creating users table...\n";
    $pdo->exec("CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, phone VARCHAR(15) UNIQUE, password VARCHAR(255), role VARCHAR(50) DEFAULT 'admin', status VARCHAR(50) DEFAULT 'active', is_primary_admin TINYINT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_login_at TIMESTAMP NULL)");
    
    echo "Step 3: Creating sessions table...\n";
    $pdo->exec("CREATE TABLE sessions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token VARCHAR(512) UNIQUE, expires_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)");
    
    echo "Step 4: Creating OTPs table...\n";
    $pdo->exec("CREATE TABLE otps (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), otp VARCHAR(6), type VARCHAR(50), expires_at TIMESTAMP, attempts INT DEFAULT 0, resend_count INT DEFAULT 0, verified TINYINT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    echo "Step 5: Creating registration_requests table...\n";
    $pdo->exec("CREATE TABLE registration_requests (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, phone VARCHAR(15) UNIQUE, otp_verified TINYINT DEFAULT 0, status VARCHAR(50) DEFAULT 'pending', processed_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    echo "Step 6: Creating portfolio table...\n";
    $pdo->exec("CREATE TABLE portfolio (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200), category VARCHAR(100), description LONGTEXT, client VARCHAR(255), technologies LONGTEXT, project_url VARCHAR(500), completion_date DATE, featured TINYINT DEFAULT 0, display_order INT DEFAULT 0, status VARCHAR(50) DEFAULT 'active', created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NULL)");
    
    echo "Step 7: Creating portfolio_images table...\n";
    $pdo->exec("CREATE TABLE portfolio_images (id INT AUTO_INCREMENT PRIMARY KEY, portfolio_id INT, image_url VARCHAR(500), display_order INT DEFAULT 0)");
    
    echo "Step 8: Creating gallery table...\n";
    $pdo->exec("CREATE TABLE gallery (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200), description LONGTEXT, image_url VARCHAR(500), category VARCHAR(100), display_order INT DEFAULT 0, featured TINYINT DEFAULT 0, status VARCHAR(50) DEFAULT 'active', created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NULL)");
    
    echo "Step 9: Creating enquiries table...\n";
    $pdo->exec("CREATE TABLE enquiries (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phone VARCHAR(15), category VARCHAR(100), subject VARCHAR(255), message LONGTEXT, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NULL)");
    
    echo "Step 10: Creating contact_settings table...\n";
    $pdo->exec("CREATE TABLE contact_settings (id INT PRIMARY KEY DEFAULT 1, address LONGTEXT, phone VARCHAR(15), email VARCHAR(255), whatsapp_number VARCHAR(15), map_url LONGTEXT, updated_at TIMESTAMP NULL)");
    
    echo "Step 11: Creating social_links table...\n";
    $pdo->exec("CREATE TABLE social_links (id INT AUTO_INCREMENT PRIMARY KEY, platform VARCHAR(50) UNIQUE, url VARCHAR(500), icon VARCHAR(50), is_active TINYINT DEFAULT 1, display_order INT DEFAULT 0)");
    
    echo "Step 12: Creating business_hours table...\n";
    $pdo->exec("CREATE TABLE business_hours (id INT AUTO_INCREMENT PRIMARY KEY, day VARCHAR(100), hours VARCHAR(100), display_order INT DEFAULT 0)");
    
    echo "Step 13: Creating enquiry_emails table...\n";
    $pdo->exec("CREATE TABLE enquiry_emails (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE, is_active TINYINT DEFAULT 1)");
    
    echo "Step 14: Creating theme_settings table...\n";
    $pdo->exec("CREATE TABLE theme_settings (id INT PRIMARY KEY DEFAULT 1, theme_data LONGTEXT, updated_at TIMESTAMP NULL)");
    
    echo "Step 15: Creating login_audits table...\n";
    $pdo->exec("CREATE TABLE login_audits (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, email VARCHAR(255), ip_address VARCHAR(45), user_agent TEXT, success TINYINT, failure_reason VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    
    echo "✓ All tables created!\n";
    
    echo "Step 16: Inserting seed data...\n";
    $pass = password_hash('Password@123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role, status, is_primary_admin) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Admin User', 'admin@zarms.com', '9876543210', $pass, 'superadmin', 'active', 1]);
    
    $stmt = $pdo->prepare("INSERT INTO contact_settings (id, address, phone, email, whatsapp_number) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([1, '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10', '9840344369', 'narbhavi555@gmail.com', '919994123797']);
    
    $stmt = $pdo->prepare("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['Facebook', 'https://facebook.com/zarmstec', 'Facebook', 1, 1]);
    $stmt->execute(['Instagram', 'https://instagram.com/zarmstec', 'Instagram', 1, 2]);
    $stmt->execute(['LinkedIn', 'https://linkedin.com/company/zarmstec', 'Linkedin', 1, 3]);
    $stmt->execute(['YouTube', 'https://youtube.com/@zarmstec', 'Youtube', 1, 4]);
    
    $stmt = $pdo->prepare("INSERT INTO business_hours (day, hours, display_order) VALUES (?, ?, ?)");
    $stmt->execute(['Monday - Friday', '9:00 AM - 6:00 PM', 1]);
    $stmt->execute(['Saturday', '9:00 AM - 2:00 PM', 2]);
    $stmt->execute(['Sunday', 'Closed', 3]);
    
    $stmt = $pdo->prepare("INSERT INTO enquiry_emails (email, is_active) VALUES (?, ?)");
    $stmt->execute(['narbhavi555@gmail.com', 1]);
    $stmt->execute(['rajesh.arms916@gmail.com', 1]);
    
    $theme = json_encode(['brandPrimary' => '#1e3a8a', 'brandSecondary' => '#d97706']);
    $stmt = $pdo->prepare("INSERT INTO theme_settings (id, theme_data) VALUES (?, ?)");
    $stmt->execute([1, $theme]);
    
    echo "✓ Seed data inserted!\n\n";
    echo "========================================\n";
    echo "BACKEND SETUP COMPLETE!\n";
    echo "========================================\n\n";
    echo "The backend is now fully functional!\n\n";
    echo "Admin Credentials:\n";
    echo "  Email: admin@zarms.com\n";
    echo "  Password: Password@123\n\n";
    echo "Test endpoints:\n";
    echo "  GET  http://127.0.0.1:8000/backend/index.php?request=api/portfolio/list\n";
    echo "  GET  http://127.0.0.1:8000/backend/index.php?request=api/gallery/list\n";
    echo "  GET  http://127.0.0.1:8000/backend/index.php?request=api/contact-settings/get\n";
    echo "  POST http://127.0.0.1:8000/backend/index.php?request=api/auth/login\n";
    echo "       JSON: {\"email\":\"admin@zarms.com\",\"password\":\"Password@123\"}\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
