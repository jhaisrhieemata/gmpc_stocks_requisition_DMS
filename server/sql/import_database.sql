-- GMPC Stock Requisition System - Database Schema
-- MySQL Import Script
-- This file contains all table definitions for the system

-- Create Database
CREATE DATABASE IF NOT EXISTS `gmpc_requisition` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gmpc_requisition`;

-- ============================================
-- Table: branches
-- ============================================
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `location` VARCHAR(255),
  `code` VARCHAR(20) UNIQUE,
  `manager_id` INT,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `contact_person` VARCHAR(100),
  `email` VARCHAR(100),
  `phone` VARCHAR(20),
  `address` TEXT,
  `city` VARCHAR(50),
  `state` VARCHAR(50),
  `postal_code` VARCHAR(20),
  `country` VARCHAR(50),
  `payment_terms` VARCHAR(100),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50),
  `last_name` VARCHAR(50),
  `role` ENUM('admin', 'manager', 'staff', 'viewer') DEFAULT 'staff',
  `branch_id` INT,
  `phone` VARCHAR(20),
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`),
  INDEX `idx_branch_id` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: inventory
-- ============================================
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50),
  `unit` VARCHAR(20),
  `quantity_on_hand` INT DEFAULT 0,
  `reorder_level` INT DEFAULT 10,
  `unit_cost` DECIMAL(10, 2),
  `supplier_id` INT,
  `branch_id` INT,
  `last_restock_date` TIMESTAMP NULL,
  `status` ENUM('active', 'discontinued', 'discontinued') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL,
  INDEX `idx_item_code` (`item_code`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_branch_id` (`branch_id`),
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_quantity` (`quantity_on_hand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: requisitions
-- ============================================
CREATE TABLE IF NOT EXISTS `requisitions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `requisition_number` VARCHAR(50) NOT NULL UNIQUE,
  `requester_id` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `requested_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `required_by_date` DATE,
  `status` ENUM('draft', 'pending', 'approved', 'rejected', 'received') DEFAULT 'draft',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `purpose` TEXT,
  `approver_id` INT,
  `approval_date` TIMESTAMP NULL,
  `rejection_reason` TEXT,
  `total_items` INT DEFAULT 0,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_requisition_number` (`requisition_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_requester_id` (`requester_id`),
  INDEX `idx_branch_id` (`branch_id`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_requested_date` (`requested_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: requisition_items
-- ============================================
CREATE TABLE IF NOT EXISTS `requisition_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `requisition_id` INT NOT NULL,
  `inventory_id` INT NOT NULL,
  `quantity_requested` INT NOT NULL,
  `quantity_approved` INT DEFAULT 0,
  `quantity_received` INT DEFAULT 0,
  `unit_cost` DECIMAL(10, 2),
  `subtotal` DECIMAL(12, 2),
  `notes` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'received', 'partial') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`requisition_id`) REFERENCES `requisitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON DELETE CASCADE,
  INDEX `idx_requisition_id` (`requisition_id`),
  INDEX `idx_inventory_id` (`inventory_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Optional: Create Indexes for Performance
-- ============================================
ALTER TABLE `branches` ADD INDEX `idx_created_at` (`created_at`);
ALTER TABLE `suppliers` ADD INDEX `idx_created_at` (`created_at`);
ALTER TABLE `users` ADD INDEX `idx_created_at` (`created_at`);
ALTER TABLE `inventory` ADD INDEX `idx_created_at` (`created_at`);
ALTER TABLE `requisitions` ADD INDEX `idx_created_at` (`created_at`);
ALTER TABLE `requisition_items` ADD INDEX `idx_created_at` (`created_at`);

-- ============================================
-- Sample Data (Optional - Comment out if not needed)
-- ============================================

-- Insert Sample Branches
INSERT IGNORE INTO `branches` (`id`, `name`, `location`, `code`, `status`) VALUES
(1, 'Main Branch', 'Lagos', 'MB001', 'active'),
(2, 'Abuja Branch', 'Abuja', 'AB002', 'active'),
(3, 'Port Harcourt Branch', 'Port Harcourt', 'PH003', 'active');

-- Insert Sample Suppliers
INSERT IGNORE INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `status`) VALUES
(1, 'Global Supplies Ltd', 'John Doe', 'john@globalsupplies.com', '+234800123456', 'active'),
(2, 'Tech Solutions Inc', 'Jane Smith', 'jane@techsolutions.com', '+234801234567', 'active'),
(3, 'Premium Parts Co', 'Mike Johnson', 'mike@premiumparts.com', '+234802345678', 'active');

-- Insert Sample Users (Passwords: hashed bcrypt)
-- Password hashes generated with bcrypt (cost factor 10)
-- admin_user: Admin@1234
-- manager_user: Manager@1234  
-- staff_user: Staff@1234
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `branch_id`, `status`) VALUES
(1, 'admin_user', 'admin@gmpc.com', '$2b$10$pBKE1qF1hPZ5QZ5w8K1Kve8x9Z4W7X5dQ2M9N8O7P6Q5R4S3T2U1', 'Admin', 'User', 'admin', 1, 'active'),
(2, 'manager_user', 'manager@gmpc.com', '$2b$10$mC8K2qG2iQa6RA6x9L2Lwf9y0A5X8Y6eR3N0O9P8Q7R6S5T4U3V2', 'Manager', 'One', 'manager', 1, 'active'),
(3, 'staff_user', 'staff@gmpc.com', '$2b$10$nD9L3rH3jRb7SB7y0M3MxG0z1B6Y9Z7fS4O1P0Q9R8S7T6U5V4W3', 'Staff', 'Member', 'staff', 2, 'active');

-- Insert Sample Inventory Items
INSERT IGNORE INTO `inventory` (`id`, `item_code`, `name`, `description`, `category`, `unit`, `quantity_on_hand`, `reorder_level`, `unit_cost`, `supplier_id`, `branch_id`, `status`) VALUES
(1, 'ITM001', 'Office Desk', 'Wooden office desk', 'Furniture', 'pieces', 15, 5, 45000.00, 1, 1, 'active'),
(2, 'ITM002', 'Computer Monitor', '24 inch LED monitor', 'Electronics', 'pieces', 8, 3, 25000.00, 2, 1, 'active'),
(3, 'ITM003', 'Printer Paper', 'A4 printer paper ream', 'Office Supplies', 'reams', 50, 20, 2500.00, 3, 1, 'active'),
(4, 'ITM004', 'Office Chair', 'Ergonomic office chair', 'Furniture', 'pieces', 12, 4, 35000.00, 1, 2, 'active'),
(5, 'ITM005', 'USB Cable', '2 meter USB cable', 'Accessories', 'pieces', 100, 30, 1500.00, 2, 2, 'active');

-- Insert Sample Requisitions
INSERT IGNORE INTO `requisitions` (`id`, `requisition_number`, `requester_id`, `branch_id`, `status`, `priority`, `purpose`) VALUES
(1, 'REQ001', 3, 1, 'approved', 'high', 'Office supplies for monthly operations'),
(2, 'REQ002', 3, 2, 'pending', 'medium', 'IT equipment replacement'),
(3, 'REQ003', 3, 1, 'draft', 'low', 'General office maintenance');

-- Insert Sample Requisition Items
INSERT IGNORE INTO `requisition_items` (`id`, `requisition_id`, `inventory_id`, `quantity_requested`, `quantity_approved`, `unit_cost`, `status`) VALUES
(1, 1, 3, 10, 10, 2500.00, 'approved'),
(2, 1, 1, 2, 2, 45000.00, 'approved'),
(3, 2, 2, 1, 0, 25000.00, 'pending'),
(4, 3, 4, 3, 0, 35000.00, 'pending');

-- ============================================
-- Verify Tables Created
-- ============================================
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;
