-- ZARMS Tec Initial Seed Data
-- Description: Default data for fresh installation

-- Insert default contact settings
INSERT INTO contact_settings (
    id,
    address,
    construction_phone,
    construction_email,
    software_phone,
    software_email,
    whatsapp_number,
    map_url
) VALUES (
    1,
    '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10',
    '9840344369',
    'narbhavi555@gmail.com',
    '9994123797',
    'rajesh.arms916@gmail.com',
    '919994123797',
    NULL
);

-- Insert default social links
INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES
('Facebook', 'https://facebook.com/zarmstec', 'Facebook', TRUE, 1),
('Instagram', 'https://instagram.com/zarmstec', 'Instagram', TRUE, 2),
('LinkedIn', 'https://linkedin.com/company/zarmstec', 'Linkedin', TRUE, 3),
('YouTube', 'https://youtube.com/@zarmstec', 'Youtube', TRUE, 4);

-- Insert default business hours
INSERT INTO business_hours (days, hours, sort_order) VALUES
('Monday - Friday', '9:00 AM - 6:00 PM', 1),
('Saturday', '9:00 AM - 2:00 PM', 2),
('Sunday', 'Closed', 3);

-- Insert default enquiry notification emails
INSERT INTO enquiry_emails (email, is_active) VALUES
('narbhavi555@gmail.com', TRUE),
('rajesh.arms916@gmail.com', TRUE);

-- Insert default theme settings (complete theme from frontend)
INSERT INTO theme_settings (id, theme_data) VALUES (
    1,
    '{
        "brandPrimary": "#1e3a8a",
        "brandSecondary": "#d97706",
        "brandAccent": "#d97706",
        "brandHighlight": "#1e3a8a",
        "iconBgPrimary": "#1e3a8a",
        "iconBgSecondary": "#d97706",
        "pageBackground": "#ffffff",
        "sectionBgLight": "#f9fafb",
        "sectionBgDark": "#1f2937",
        "cardBackground": "#ffffff",
        "glassBg": "rgba(255, 255, 255, 0.8)",
        "footerBg": "#111827",
        "headerBg": "rgba(255, 255, 255, 0.95)",
        "textPrimary": "#111827",
        "textSecondary": "#4b5563",
        "textMuted": "#9ca3af",
        "textInverse": "#ffffff",
        "borderColor": "#e5e7eb",
        "dividerColor": "#d1d5db",
        "inputBg": "#f9fafb",
        "inputBorder": "#d1d5db",
        "hoverOverlay": "rgba(0, 0, 0, 0.05)",
        "iconColor": "#6b7280",
        "badgeBg": "#eff6ff",
        "badgeText": "#1e3a8a",
        "success": "#10b981",
        "warning": "#d97706",
        "error": "#ef4444",
        "info": "#1e3a8a",
        "heroGradientStart": "#1e3a8a",
        "heroGradientEnd": "#d97706",
        "btnGradientStart": "#1e3a8a",
        "btnGradientEnd": "#d97706",
        "accentGlow": "#d97706",
        "overlayTint": "rgba(30, 58, 138, 0.9)",
        "fontHeading": "Inter, system-ui, -apple-system, sans-serif",
        "fontBody": "Inter, system-ui, -apple-system, sans-serif",
        "fontSizeBase": "1rem",
        "headingScale": "1.25",
        "lineHeight": "1.6",
        "letterSpacing": "-0.01em",
        "headingWeight": "700",
        "bodyWeight": "400",
        "radiusSm": "0.375rem",
        "radiusMd": "0.5rem",
        "radiusLg": "0.75rem",
        "radiusXl": "1rem",
        "radiusButton": "0.5rem",
        "radiusCard": "0.75rem",
        "radiusInput": "0.5rem",
        "containerWidth": "1280px",
        "sectionPaddingY": "5rem",
        "sectionPaddingX": "1.5rem",
        "gridGap": "2rem",
        "cardSpacing": "1.5rem",
        "navbarHeight": "5rem",
        "heroHeight": "90vh",
        "shadowSm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "shadowMd": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "shadowLg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "shadowXl": "0 20px 25px -5px rgb(0 0 0 / 0.1)",
        "glowIntensity": "0.5",
        "blurStrength": "10px",
        "animationSpeed": "0.3s",
        "hoverIntensity": "1.05",
        "scrollIntensity": "0.5",
        "parallaxStrength": "0.3",
        "heroRotationInterval": "4000",
        "heroTransitionDuration": "1000",
        "heroAutoRotate": true,
        "heroManualControls": true,
        "heroOverlayOpacity": "0.85",
        "heroContentMaxWidth": "1200px",
        "heroMobileHeight": "600px",
        "heroEnableCategoryTransitions": true,
        "heroReducedMotion": false
    }'
);

-- Note: No initial superadmin user is inserted here
-- The first user must be created through the /auth/initialize-superadmin endpoint
-- This is a one-time operation that should be done during initial setup
