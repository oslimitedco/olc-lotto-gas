<?php
// Database Configuration - UPDATE THESE WITH YOUR CPANEL MYSQL CREDENTIALS
define('DB_HOST', 'localhost');
define('DB_NAME', 'olc_lottery');
define('DB_USER', 'Oslimitedcollection');  // cPanel username (prefix may be added)
define('DB_PASS', 'LB19@ndPz38');

// Admin credentials
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'LB19@ndPz38');

// Site URL
define('SITE_URL', 'https://oslimitedco.com');

// Database connection
function getDB() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        die(json_encode(['error' => 'Database connection failed']));
    }
}

// Session start helper
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}
