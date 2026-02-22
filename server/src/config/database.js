/**
 * MySQL Database Configuration
 * GMPC Requisition System - Node.js/Express Backend
 * Uses XAMPP local MySQL server
 */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "gmpc_requisition",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const connection = await pool.getConnection();
    const [res] = await connection.query(text, params);
    connection.release();
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.affectedRows || res.length });
    return { rows: res, rowCount: res.length };
  } catch (error) {
    console.error("Database query error", { text, error });
    throw error;
  }
};

export const getClient = async () => {
  const connection = await pool.getConnection();
  return connection;
};

export default pool;
