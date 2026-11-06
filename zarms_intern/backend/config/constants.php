<?php

// Application Constants
define('APP_NAME', getenv('APP_NAME') ?: 'ZARMS Tec');
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_URL', getenv('APP_URL') ?: 'http://127.0.0.1:8000');
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:5173');

// JWT Configuration
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change-this-secret-key');
define('JWT_EXPIRY', (int)(getenv('JWT_EXPIRY') ?: 604800)); // 7 days in seconds

if (APP_ENV === 'production' && JWT_SECRET === 'change-this-secret-key') {
    throw new Exception('Unsafe JWT_SECRET in production. Set a strong JWT_SECRET in backend/.env');
}

// OTP Configuration
define('OTP_EXPIRY_MINUTES', (int)(getenv('OTP_EXPIRY_MINUTES') ?: 5));
define('OTP_MAX_ATTEMPTS', (int)(getenv('OTP_MAX_ATTEMPTS') ?: 5));
define('OTP_MAX_RESENDS', (int)(getenv('OTP_MAX_RESENDS') ?: 3));

// File Upload Configuration
define('UPLOAD_MAX_SIZE', (int)(getenv('UPLOAD_MAX_SIZE') ?: 5242880)); // 5MB
define('UPLOAD_ALLOWED_TYPES', explode(',', getenv('UPLOAD_ALLOWED_TYPES') ?: 'jpg,jpeg,png,webp'));
define('IMAGE_MAX_WIDTH', (int)(getenv('IMAGE_MAX_WIDTH') ?: 1920));
define('IMAGE_MAX_HEIGHT', (int)(getenv('IMAGE_MAX_HEIGHT') ?: 1080));
define('THUMBNAIL_SIZE', (int)(getenv('THUMBNAIL_SIZE') ?: 300));

// Security Configuration
define('BCRYPT_COST', (int)(getenv('BCRYPT_COST') ?: 12));
define('SESSION_EXPIRY_DAYS', (int)(getenv('SESSION_EXPIRY_DAYS') ?: 7));
define('RATE_LIMIT_LOGIN', (int)(getenv('RATE_LIMIT_LOGIN') ?: 5));
define('RATE_LIMIT_WINDOW', (int)(getenv('RATE_LIMIT_WINDOW') ?: 900)); // 15 minutes

// Email Configuration
define('EMAIL_DRIVER', getenv('EMAIL_DRIVER') ?: 'smtp');
define('EMAIL_FROM_ADDRESS', getenv('EMAIL_FROM_ADDRESS') ?: 'noreply@zarmstec.com');
define('EMAIL_FROM_NAME', getenv('EMAIL_FROM_NAME') ?: 'ZARMS Tec');

// SMTP Configuration
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: '');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: '');
define('SMTP_ENCRYPTION', getenv('SMTP_ENCRYPTION') ?: 'tls');

// SendGrid Configuration
define('SENDGRID_API_KEY', getenv('SENDGRID_API_KEY') ?: '');

// Paths
$defaultUploadPath = dirname(__DIR__, 2) . '/public/uploads/';
define('UPLOAD_PATH', getenv('UPLOAD_PATH') ?: $defaultUploadPath);
define('UPLOAD_DIR', UPLOAD_PATH); // For backward compatibility
define('PORTFOLIO_UPLOAD_PATH', UPLOAD_PATH . 'portfolio/');
define('GALLERY_UPLOAD_PATH', UPLOAD_PATH . 'gallery/');

// Public URL base for uploaded files
$defaultUploadPublicUrl = rtrim(APP_URL, '/');
if (str_ends_with($defaultUploadPublicUrl, '/backend')) {
    $defaultUploadPublicUrl = substr($defaultUploadPublicUrl, 0, -8);
}
$defaultUploadPublicUrl .= '/public/uploads';
define('UPLOAD_PUBLIC_URL', getenv('UPLOAD_PUBLIC_URL') ?: $defaultUploadPublicUrl);

// User Roles
define('ROLE_ADMIN', 'admin');
define('ROLE_SUPERADMIN', 'superadmin');

// User Status
define('STATUS_ACTIVE', 'active');
define('STATUS_SUSPENDED', 'suspended');
define('STATUS_INACTIVE', 'inactive');
define('STATUS_PENDING', 'pending');
define('STATUS_APPROVED', 'approved');
define('STATUS_REJECTED', 'rejected');
define('STATUS_COMPLETED', 'completed');

// Service Types
define('SERVICE_CONSTRUCTION', 'Construction Services');
define('SERVICE_SOFTWARE', 'Software Solutions');

// Enquiry Status
define('ENQUIRY_NEW', 'new');
define('ENQUIRY_READ', 'read');
define('ENQUIRY_REPLIED', 'replied');
define('ENQUIRY_CLOSED', 'closed');

// OTP Types
define('OTP_TYPE_REGISTRATION', 'registration');
define('OTP_TYPE_PASSWORD_RESET', 'password_reset');
define('OTP_TYPE_EMAIL_VERIFICATION', 'email_verification');
