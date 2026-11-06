<?php
/**
 * Database Migration Runner
 * Executes the initial schema and seed data
 */

require_once __DIR__ . '/config/database.php';

try {
    echo "[1/3] Connecting to database...\n";
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "[2/3] Running initial schema migration...\n";
    $schemaSQL = file_get_contents(__DIR__ . '/database/migrations/001_initial_schema.sql');
    
    // Split SQL statements by semicolon (accounting for SQL comments)
    $statements = array_filter(array_map('trim', preg_split('/;(?=(?:[^\']*\'[^\']*\')*[^\']*$)/', $schemaSQL)));
    
    foreach ($statements as $statement) {
        if (!empty($statement) && strpos($statement, '--') !== 0) {
            try {
                $pdo->exec($statement);
            } catch (PDOException $e) {
                // Some statements may fail if tables already exist, that's OK
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "[3/3] Seeding initial data...\n";
    $seedSQL = file_get_contents(__DIR__ . '/database/seeds/initial_data.sql');
    
    // Split SQL statements
    $seedStatements = array_filter(array_map('trim', preg_split('/;(?=(?:[^\']*\'[^\']*\')*[^\']*$)/', $seedSQL)));
    
    foreach ($seedStatements as $statement) {
        if (!empty($statement) && strpos($statement, '--') !== 0) {
            try {
                $pdo->exec($statement);
            } catch (PDOException $e) {
                // Ignore duplicate key errors for seed data
                if (strpos($e->getMessage(), 'Duplicate') === false) {
                    echo "Seed Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "✓ Database migrations completed successfully!\n";
    echo "\nYou can now initialize a superadmin user by making a POST request to:\n";
    echo "POST http://127.0.0.1:8000/backend/index.php?request=api/auth/initialize-superadmin\n";
    echo "\nWith JSON body:\n";
    echo json_encode([
        "name" => "Admin User",
        "email" => "admin@zarms.com",
        "phone" => "9876543210",
        "password" => "Password@123"
    ], JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
