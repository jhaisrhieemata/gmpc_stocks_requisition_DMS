/**
 * Complete Database Reset Script
 * Safely removes and recreates the entire database
 */

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetDatabase() {
  const dbName = process.env.DB_NAME || "gmpc_requisition";
  const dbPath = "C:\\xampp\\mysql\\data\\" + dbName;

  try {
    // Step 1: Connect to MySQL without database
    console.log("Connecting to MySQL...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // Step 2: Drop existing database
    console.log(`Dropping existing database '${dbName}'...`);
    try {
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      console.log("✓ Database dropped");
    } catch (err) {
      console.log("  (Database didn't exist or couldn't be dropped)");
    }

    // Step 3: Delete folder manually if it exists
    if (fs.existsSync(dbPath)) {
      console.log(`Deleting data folder: ${dbPath}`);
      fs.rmSync(dbPath, { recursive: true, force: true });
      console.log("✓ Folder deleted");
    }

    // Step 4: Create fresh database
    console.log(`Creating fresh database '${dbName}'...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✓ Database created successfully!");

    await connection.end();
    console.log("\n✓ Database reset complete! You can now run: npm run migrate");
  } catch (error) {
    console.error("✗ Reset failed:", error.message);
    process.exit(1);
  }
}

resetDatabase();
