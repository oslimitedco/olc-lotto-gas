<?php
/**
 * OLC Lotto Gas — Setup Script
 * Run this ONCE after uploading to cPanel to initialize the database.
 * DELETE THIS FILE AFTER SETUP.
 */

require_once __DIR__ . '/config/db.php';

echo "<h1>OLC Lotto Gas — Setup</h1>";
echo "<pre>";

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "`");
    echo "✅ Database created/verified\n";

    $pdo->exec("USE `" . DB_NAME . "`");

    // Create admin table
    $pdo->exec("CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✅ Admin table created\n";

    // Create tickets table
    $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(12) NOT NULL UNIQUE,
        tier VARCHAR(20) NOT NULL,
        ticket_count INT NOT NULL,
        status ENUM('active','used','expired') DEFAULT 'active',
        prize VARCHAR(100) DEFAULT NULL,
        redeemed_by VARCHAR(255) DEFAULT NULL,
        redeemed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_status (status)
    )");
    echo "✅ Tickets table created\n";

    // Create winners table
    $pdo->exec("CREATE TABLE IF NOT EXISTS winners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_code VARCHAR(12) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        ig_handle VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✅ Winners table created\n";

    // Insert admin with proper password hash
    $hash = password_hash(ADMIN_PASS, PASSWORD_DEFAULT);
    
    // Check if admin exists
    $stmt = $pdo->query("SELECT COUNT(*) FROM admin");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $stmt = $pdo->prepare("INSERT INTO admin (username, password_hash) VALUES (?, ?)");
        $stmt->execute([ADMIN_USER, $hash]);
        echo "✅ Admin account created (user: " . ADMIN_USER . ")\n";
    } else {
        // Update password hash
        $stmt = $pdo->prepare("UPDATE admin SET password_hash = ? WHERE username = ?");
        $stmt->execute([$hash, ADMIN_USER]);
        echo "✅ Admin password hash updated\n";
    }

    echo "\n🎉 Setup complete! Delete this file (setup.php) now.\n";
    echo "Visit https://oslimitedco.com/admin to login.\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nMake sure your DB credentials in config/db.php are correct.\n";
    echo "In cPanel, the database username usually has a prefix: cpaneluser_dbname\n";
}

echo "</pre>";
