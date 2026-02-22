/**
 * Authentication Routes
 * Handles user login, registration, and logout
 */

import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, role, branch_id } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    const checkResult = await query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (checkResult.rows && checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const result = await query(
      "INSERT INTO users (email, password, full_name, role, branch_id, is_active) VALUES (?, ?, ?, ?, ?, true)",
      [email, hashedPassword, full_name, role || "user", branch_id || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.rows[0].insertId, email, role: role || "user" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: result.rows[0].insertId,
        email,
        full_name,
        role: role || "user",
        branch_id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Email/Username and password are required",
      });
    }

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Email or username is required",
      });
    }

    // Find user by email or username
    let queryStr = "";
    let queryParams = [];
    
    if (email) {
      queryStr = "SELECT * FROM users WHERE email = ?";
      queryParams = [email];
    } else {
      queryStr = "SELECT * FROM users WHERE username = ?";
      queryParams = [username];
    }

    const result = await query(queryStr, queryParams);

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
      });
    }

    const user = result.rows[0];

    // Check password (use password_hash from database)
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login
    await query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [
      user.id,
    ]);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  try {
    // Token is deleted on client side
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await query("SELECT * FROM users WHERE id = ?", [
      decoded.userId,
    ]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
});

export default router;
