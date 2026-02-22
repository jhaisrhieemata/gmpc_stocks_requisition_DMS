/**
 * Database Migration Script
 * Creates all tables for GMPC Requisition System with MySQL
 */

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gmpc_requisition",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createTablesSQL = `
-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_number VARCHAR(20),
  email VARCHAR(255),
  classification VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  classification VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  branch_id INT,
  is_active BOOLEAN DEFAULT true,
  password_reset_requested BOOLEAN DEFAULT false,
  password_reset_date TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10, 2),
  measurement_unit VARCHAR(50),
  status VARCHAR(50),
  supplier_id INT,
  branch_id INT,
  quantity_on_hand INT DEFAULT 0,
  reorder_level INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Requisitions table
CREATE TABLE IF NOT EXISTS requisitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(255) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  branch_id INT,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12, 2),
  signature_data LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Requisition Items table
CREATE TABLE IF NOT EXISTS requisition_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requisition_id INT NOT NULL,
  inventory_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(12, 2),
  description VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_user_id ON requisitions(user_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
CREATE INDEX IF NOT EXISTS idx_requisition_items_requisition_id ON requisition_items(requisition_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON inventory(supplier_id);
`;

async function runMigration() {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("Starting database migration...");

    // First, try to drop existing tables to clear tablespace issues
    console.log("Clearing existing tables...");
    const dropStatements = [
      "SET FOREIGN_KEY_CHECKS = 0;",
      "DROP TABLE IF EXISTS requisition_items;",
      "DROP TABLE IF EXISTS requisitions;",
      "DROP TABLE IF EXISTS inventory;",
      "DROP TABLE IF EXISTS users;",
      "DROP TABLE IF EXISTS suppliers;",
      "DROP TABLE IF EXISTS branches;",
      "SET FOREIGN_KEY_CHECKS = 1;",
    ];

    for (const statement of dropStatements) {
      try {
        await connection.query(statement);
      } catch (err) {
        console.log(`  Warning: ${err.message}`);
      }
    }

    // Now create fresh tables
    // Split by semicolon to execute multiple statements
    const statements = createTablesSQL.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log("✓ Database migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

runMigration();
