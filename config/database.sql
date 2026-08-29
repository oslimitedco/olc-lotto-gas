-- OLC Lotto Gas Lottery System Database Schema
-- Run this in cPanel MySQL Databases or phpMyAdmin

CREATE DATABASE IF NOT EXISTS olc_lottery;
USE olc_lottery;

-- Admin table (single admin)
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    tier VARCHAR(20) NOT NULL COMMENT 'spend_50, spend_150, spend_300, spend_500',
    ticket_count INT NOT NULL COMMENT 'How many tickets this code represents',
    status ENUM('active','used','expired') DEFAULT 'active',
    prize VARCHAR(100) DEFAULT NULL COMMENT 'Prize won if any',
    redeemed_by VARCHAR(255) DEFAULT NULL,
    redeemed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
);

-- Winners table (grand prize claims)
CREATE TABLE IF NOT EXISTS winners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(12) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    prize VARCHAR(100) NOT NULL,
    claim_method VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_code) REFERENCES tickets(code)
);

-- Insert default admin (password: LB19@ndPz38)
-- Hash generated with PHP password_hash()
INSERT INTO admin (username, password_hash) VALUES (
    'admin',
    '$2y$10$placeholder_will_be_replaced_with_real_hash'
);
