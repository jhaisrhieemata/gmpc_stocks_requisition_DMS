/**
 * Branches Routes
 * Handles branch management
 */

import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get all branches
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, address, contact_number, email, classification, is_active, created_at FROM branches WHERE is_active = true ORDER BY name"
    );

    return res.json({
      success: true,
      branches: result.rows || [],
      total: (result.rows || []).length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
      error: error.message,
    });
  }
});

// Get branch by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, name, address, contact_number, email, classification, is_active, created_at FROM branches WHERE id = ?",
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.json({
      success: true,
      branch: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch",
      error: error.message,
    });
  }
});

// Create branch
router.post("/", async (req, res) => {
  try {
    const { name, address, contact_number, email, classification } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Branch name is required",
      });
    }

    const result = await query(
      "INSERT INTO branches (name, address, contact_number, email, classification, is_active) VALUES (?, ?, ?, ?, ?, true)",
      [name, address, contact_number, email, classification]
    );

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      id: result.rows[0].insertId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create branch",
      error: error.message,
    });
  }
});

// Update branch
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contact_number, email, classification, is_active } =
      req.body;

    const result = await query(
      "UPDATE branches SET name = ?, address = ?, contact_number = ?, email = ?, classification = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, address, contact_number, email, classification, is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.json({
      success: true,
      message: "Branch updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update branch",
      error: error.message,
    });
  }
});

// Delete branch
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const result = await query(
      "UPDATE branches SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete branch",
      error: error.message,
    });
  }
});

export default router;
