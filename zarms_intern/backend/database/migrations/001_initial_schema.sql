-- ZARMS Tec Database Schema
-- Version: 1.0.0
-- Description: Initial database schema for ZARMS Tec backend

-- Drop tables if they exist (for fresh installation)
DROP TABLE IF EXISTS login_audits;
DROP TABLE IF EXISTS theme_settings;
DROP TABLE IF EXISTS enquiry_emails;
DROP TABLE IF EXISTS business_hours;
DROP TABLE IF EXISTS social_links;
DROP TABLE IF EXISTS contact_settings;
DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS portfolio_images;
DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS registration_requests;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for user',
    name VARCHAR(255) NOT NULL COMMENT 'Full name of user',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email address (unique)',
    mobile VARCHAR(15) UNIQUE NOT NULL COMMENT 'Mobile number (unique)',
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    role ENUM('admin', 'superadmin') NOT NULL DEFAULT 'admin' COMMENT 'User role',
    status ENUM('active', 'suspended', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Account status',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary admin receives registration OTPs',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin and superadmin users';

-- Sessions table
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Session ID',
    user_id VARCHAR(36) NOT NULL COMMENT 'Reference to users.id',
    token VARCHAR(512) UNIQUE NOT NULL COMMENT 'JWT or session token',
    expires_at TIMESTAMP NOT NULL COMMENT 'Session expiry timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Session creation timestamp',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User session tokens';

-- OTPs table
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'OTP record ID',
    email VARCHAR(255) NOT NULL COMMENT 'Email for OTP',
    otp VARCHAR(6) NOT NULL COMMENT '6-digit OTP code',
    type ENUM('registration', 'forgot-password') NOT NULL COMMENT 'OTP purpose',
    expires_at TIMESTAMP NOT NULL COMMENT 'OTP expiry (5 minutes)',
    attempts INT DEFAULT 0 COMMENT 'Failed verification attempts',
    resend_count INT DEFAULT 0 COMMENT 'Number of times OTP resent',
    verified BOOLEAN DEFAULT FALSE COMMENT 'OTP verification status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'OTP generation timestamp',
    INDEX idx_email_type (email, type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OTP records for registration and password reset';

-- Registration requests table
CREATE TABLE registration_requests (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for registration request',
    name VARCHAR(255) NOT NULL COMMENT 'Name of registering user',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email (must be unique)',
    mobile VARCHAR(15) UNIQUE NOT NULL COMMENT 'Mobile (must be unique)',
    otp_verified BOOLEAN DEFAULT FALSE COMMENT 'OTP verification status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Request creation timestamp',
    INDEX idx_email (email),
    INDEX idx_otp_verified (otp_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Intermediate table for user registration flow';

-- Portfolio table
CREATE TABLE portfolio (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for portfolio item',
    service_type ENUM('Construction Services', 'Software Solutions') NOT NULL COMMENT 'Service category',
    project_name VARCHAR(80) NOT NULL COMMENT 'Name of project (max 80 chars)',
    description TEXT NOT NULL COMMENT 'Project description (max 500 chars)',
    icon VARCHAR(50) NOT NULL COMMENT 'Lucide icon name',
    subtitle VARCHAR(100) COMMENT 'Optional subtitle (max 100 chars)',
    short_summary VARCHAR(140) COMMENT 'Optional short summary (max 140 chars)',
    project_location VARCHAR(255) COMMENT 'Optional project location',
    featured BOOLEAN DEFAULT FALSE COMMENT 'Featured project flag',
    tags TEXT COMMENT 'Comma-separated tags',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_service_type (service_type),
    INDEX idx_featured (featured),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (project_name, description, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Portfolio projects';

-- Portfolio images table (one-to-many relationship)
CREATE TABLE portfolio_images (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Image ID',
    portfolio_id VARCHAR(36) NOT NULL COMMENT 'Reference to portfolio.id',
    image_url VARCHAR(500) NOT NULL COMMENT 'URL to uploaded image',
    sort_order INT DEFAULT 0 COMMENT 'Display order (0-4)',
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE,
    INDEX idx_portfolio_id (portfolio_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Images for portfolio items (max 5 per project)';

-- Gallery table
CREATE TABLE gallery (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for gallery item',
    service_type ENUM('Construction Services', 'Software Solutions') NOT NULL COMMENT 'Service category',
    image_url VARCHAR(500) NOT NULL COMMENT 'URL to uploaded image',
    title VARCHAR(80) NOT NULL COMMENT 'Gallery item title (max 80 chars)',
    subtitle VARCHAR(120) COMMENT 'Optional subtitle (max 120 chars)',
    sort_order INT DEFAULT 0 COMMENT 'Display order',
    featured BOOLEAN DEFAULT FALSE COMMENT 'Featured item flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_service_type (service_type),
    INDEX idx_featured (featured),
    INDEX idx_sort_order (sort_order),
    FULLTEXT idx_search (title, subtitle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery images for construction and software services';

-- Enquiries table
CREATE TABLE enquiries (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for enquiry',
    name VARCHAR(255) NOT NULL COMMENT 'Customer name',
    phone VARCHAR(15) NOT NULL COMMENT 'Customer phone',
    email VARCHAR(255) NOT NULL COMMENT 'Customer email',
    service_type ENUM('construction', 'software') NOT NULL COMMENT 'Service requested',
    subject VARCHAR(255) NOT NULL COMMENT 'Enquiry subject',
    message TEXT NOT NULL COMMENT 'Enquiry message',
    status ENUM('new', 'read', 'replied', 'closed') NOT NULL DEFAULT 'new' COMMENT 'Enquiry status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission timestamp',
    INDEX idx_status (status),
    INDEX idx_service_type (service_type),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (name, email, subject, message)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contact form enquiries';

-- Contact settings table
CREATE TABLE contact_settings (
    id INT PRIMARY KEY DEFAULT 1 COMMENT 'Singleton record (only 1 row)',
    address TEXT NOT NULL COMMENT 'Business address',
    construction_phone VARCHAR(15) NOT NULL COMMENT 'Construction services phone',
    construction_email VARCHAR(255) NOT NULL COMMENT 'Construction services email',
    software_phone VARCHAR(15) NOT NULL COMMENT 'Software solutions phone',
    software_email VARCHAR(255) NOT NULL COMMENT 'Software solutions email',
    whatsapp_number VARCHAR(15) NOT NULL COMMENT 'WhatsApp number with country code',
    map_url TEXT COMMENT 'Google Maps embed URL',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    CONSTRAINT chk_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contact information settings';

-- Social links table
CREATE TABLE social_links (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Social link ID',
    platform VARCHAR(50) UNIQUE NOT NULL COMMENT 'Platform name (Facebook, Instagram, etc.)',
    url VARCHAR(500) NOT NULL COMMENT 'Social media profile URL',
    icon VARCHAR(50) NOT NULL COMMENT 'Lucide icon name',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether link is displayed',
    display_order INT DEFAULT 0 COMMENT 'Display order',
    INDEX idx_platform (platform),
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Social media links';

-- Business hours table
CREATE TABLE business_hours (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Business hours ID',
    days VARCHAR(100) NOT NULL COMMENT 'Days (e.g., Monday - Friday)',
    hours VARCHAR(100) NOT NULL COMMENT 'Hours (e.g., 9:00 AM - 6:00 PM)',
    sort_order INT DEFAULT 0 COMMENT 'Display order',
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Business operating hours';

-- Enquiry emails table
CREATE TABLE enquiry_emails (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Email ID',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email to notify on new enquiries',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether email is active',
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Email addresses for enquiry notifications';

-- Theme settings table
CREATE TABLE theme_settings (
    id INT PRIMARY KEY DEFAULT 1 COMMENT 'Singleton record (only 1 row)',
    theme_data JSON NOT NULL COMMENT 'Complete theme configuration as JSON',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    CONSTRAINT chk_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='UI theme settings';

-- Login audits table
CREATE TABLE login_audits (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Audit log ID',
    user_id VARCHAR(36) COMMENT 'Reference to users.id (NULL if login failed)',
    email VARCHAR(255) NOT NULL COMMENT 'Email used in login attempt',
    ip_address VARCHAR(45) COMMENT 'IP address of client',
    user_agent TEXT COMMENT 'Browser user agent string',
    success BOOLEAN NOT NULL COMMENT 'Login success status',
    failure_reason VARCHAR(255) COMMENT 'Reason for login failure',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Login attempt timestamp',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for login attempts';
