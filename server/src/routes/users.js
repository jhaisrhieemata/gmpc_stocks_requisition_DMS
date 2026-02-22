/**
 * Users Routes
 * Handles user management
 */

import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, email, full_name, role, branch_id, is_active, last_login, created_at FROM users"
    );

    return res.json({
      success: true,
      users: result.rows || [],
      total: (result.rows || []).length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, email, full_name, role, branch_id, is_active, last_login, created_at FROM users WHERE id = ?",
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, branch_id, is_active } = req.body;

    const result = await query(
      "UPDATE users SET full_name = ?, role = ?, branch_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [full_name, role, branch_id, is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query("DELETE FROM users WHERE id = ?", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

export default router;
