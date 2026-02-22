/**
 * Database Setup Script
 * Creates the MySQL database for GMPC Requisition System
 * Run this before running the migrate.js script
 */

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function createDatabase() {
  const dbName = process.env.DB_NAME || "gmpc_requisition";
  
  // Connect without specifying database to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log(`Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✓ Database '${dbName}' is ready!`);
  } catch (error) {
    console.error("✗ Failed to create database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createDatabase();
