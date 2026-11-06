<?php

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $driver = getenv('DB_CONNECTION') ?: 'sqlite';

        try {
            if ($driver === 'sqlite') {
                $dbPath = getenv('DB_DATABASE') ?: dirname(__DIR__) . '/database/zarms_tec.sqlite';
                $directory = dirname($dbPath);
                if (!is_dir($directory)) {
                    mkdir($directory, 0777, true);
                }

                $this->connection = new PDO("sqlite:$dbPath");
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $this->initializeSchema();
            } else {
                $host = getenv('DB_HOST') ?: 'localhost';
                $port = getenv('DB_PORT') ?: '3306';
                $dbname = getenv('DB_NAME') ?: 'zarms_tec';
                $username = getenv('DB_USER') ?: 'root';
                $password = getenv('DB_PASSWORD') ?: '';

                $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ];

                $this->connection = new PDO($dsn, $username, $password, $options);
            }
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    private function initializeSchema() {
        $statements = [
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'admin',
                status TEXT NOT NULL DEFAULT 'active',
                is_primary_admin INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_login_at TEXT
            )",
            "CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                expires_at TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                otp TEXT NOT NULL,
                type TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                attempts INTEGER DEFAULT 0,
                resend_count INTEGER DEFAULT 0,
                verified_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS registration_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                processed_at TEXT
            )",
            "CREATE TABLE IF NOT EXISTS contact_settings (
                id INTEGER PRIMARY KEY,
                address TEXT NOT NULL,
                construction_phone TEXT NOT NULL,
                construction_email TEXT NOT NULL,
                software_phone TEXT NOT NULL,
                software_email TEXT NOT NULL,
                whatsapp_number TEXT NOT NULL,
                maps_url TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS social_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT UNIQUE NOT NULL,
                url TEXT NOT NULL,
                icon TEXT,
                is_active INTEGER DEFAULT 1,
                display_order INTEGER DEFAULT 0
            )",
            "CREATE TABLE IF NOT EXISTS business_hours (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day TEXT NOT NULL,
                hours TEXT NOT NULL,
                display_order INTEGER DEFAULT 0
            )",
            "CREATE TABLE IF NOT EXISTS enquiry_emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                is_active INTEGER DEFAULT 1
            )",
            "CREATE TABLE IF NOT EXISTS theme_settings (
                id INTEGER PRIMARY KEY,
                settings TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS login_audits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                email TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                success INTEGER NOT NULL,
                reason TEXT,
                attempted_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS enquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                company TEXT,
                service TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS gallery (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_url TEXT NOT NULL,
                thumbnail_url TEXT,
                service TEXT NOT NULL,
                title TEXT,
                description TEXT,
                featured INTEGER DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                created_by INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                client TEXT,
                technologies TEXT,
                project_url TEXT,
                completion_date TEXT,
                featured INTEGER DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'active',
                created_by INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS portfolio_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                portfolio_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                display_order INTEGER DEFAULT 0
            )"
        ];

        foreach ($statements as $statement) {
            $this->connection->exec($statement);
        }

        $contactSettingsCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM contact_settings")->fetchColumn();
        if ($contactSettingsCount === 0) {
            $this->connection->exec(
                "INSERT INTO contact_settings (id, address, construction_phone, construction_email, software_phone, software_email, whatsapp_number, maps_url) VALUES (1, '30/1, Medawalkkam 2nd Street, Kilpauk, Chennai-10', '9840344369', 'narbhavi555@gmail.com', '9994123797', 'rajesh.arms916@gmail.com', '919994123797', NULL)"
            );
        }

        $socialLinksCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM social_links")->fetchColumn();
        if ($socialLinksCount === 0) {
            $this->connection->exec("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES ('Facebook', 'https://facebook.com/zarmstec', 'Facebook', 1, 1)");
            $this->connection->exec("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES ('Instagram', 'https://instagram.com/zarmstec', 'Instagram', 1, 2)");
            $this->connection->exec("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES ('LinkedIn', 'https://linkedin.com/company/zarmstec', 'Linkedin', 1, 3)");
            $this->connection->exec("INSERT INTO social_links (platform, url, icon, is_active, display_order) VALUES ('YouTube', 'https://youtube.com/@zarmstec', 'Youtube', 1, 4)");
        }

        $businessHoursCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM business_hours")->fetchColumn();
        if ($businessHoursCount === 0) {
            $this->connection->exec("INSERT INTO business_hours (day, hours, display_order) VALUES ('Monday - Friday', '9:00 AM - 6:00 PM', 1)");
            $this->connection->exec("INSERT INTO business_hours (day, hours, display_order) VALUES ('Saturday', '9:00 AM - 2:00 PM', 2)");
            $this->connection->exec("INSERT INTO business_hours (day, hours, display_order) VALUES ('Sunday', 'Closed', 3)");
        }

        $enquiryEmailsCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM enquiry_emails")->fetchColumn();
        if ($enquiryEmailsCount === 0) {
            $this->connection->exec("INSERT INTO enquiry_emails (email, is_active) VALUES ('narbhavi555@gmail.com', 1)");
            $this->connection->exec("INSERT INTO enquiry_emails (email, is_active) VALUES ('rajesh.arms916@gmail.com', 1)");
        }

        $themeSettingsCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM theme_settings")->fetchColumn();
        if ($themeSettingsCount === 0) {
            $defaultTheme = json_encode([
                'brandPrimary' => '#1e3a8a',
                'brandSecondary' => '#d97706',
                'brandAccent' => '#d97706',
                'brandHighlight' => '#1e3a8a',
                'pageBackground' => '#ffffff',
                'textPrimary' => '#111827',
                'textSecondary' => '#4b5563'
            ]);
            $this->connection->exec("INSERT INTO theme_settings (id, settings) VALUES (1, '$defaultTheme')");
        }

        $userCount = (int)$this->connection->query("SELECT COUNT(*) as count FROM users")->fetchColumn();
        if ($userCount === 0) {
            $passwordHash = password_hash('admin123', PASSWORD_BCRYPT);
            $this->connection->exec("INSERT INTO users (name, email, phone, password, role, status, is_primary_admin) VALUES ('Admin User', 'admin@zarmstec.com', '9999999999', '$passwordHash', 'superadmin', 'active', 1)");
        }
    }

    private function normalizeSql($sql) {
        $sql = str_replace('NOW()', 'CURRENT_TIMESTAMP', $sql);
        $sql = preg_replace('/DATE_SUB\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/i', "datetime('now', '-$1 days')", $sql);
        $sql = preg_replace('/DATE_SUB\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\?)\s+SECOND\s*\)/i', "datetime('now', '-' || ? || ' seconds')", $sql);
        return $sql;
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        try {
            $normalizedSql = $this->normalizeSql($sql);
            $stmt = $this->connection->prepare($normalizedSql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query Error: " . $e->getMessage() . " | SQL: " . $sql);
            throw new Exception("Database query failed");
        }
    }

    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    public function execute($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    public function commit() {
        return $this->connection->commit();
    }

    public function rollback() {
        return $this->connection->rollBack();
    }
}
