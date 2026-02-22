/**
 * Suppliers Routes
 * Handles supplier management
 */

import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, contact_person, phone, email, classification, is_active, created_at FROM suppliers WHERE is_active = true ORDER BY name"
    );

    return res.json({
      success: true,
      suppliers: result.rows || [],
      total: (result.rows || []).length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
      error: error.message,
    });
  }
});

// Get supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, name, contact_person, phone, email, classification, is_active FROM suppliers WHERE id = ?",
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.json({
      success: true,
      supplier: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier",
      error: error.message,
    });
  }
});

// Create supplier
router.post("/", async (req, res) => {
  try {
    const { name, contact_person, phone, email, classification } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    const result = await query(
      "INSERT INTO suppliers (name, contact_person, phone, email, classification, is_active) VALUES (?, ?, ?, ?, ?, true)",
      [name, contact_person, phone, email, classification]
    );

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      id: result.rows[0].insertId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create supplier",
      error: error.message,
    });
  }
});

// Update supplier
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      phone,
      email,
      classification,
      is_active,
    } = req.body;

    const result = await query(
      "UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, classification = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, contact_person, phone, email, classification, is_active, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.json({
      success: true,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update supplier",
      error: error.message,
    });
  }
});

// Delete supplier
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const result = await query(
      "UPDATE suppliers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
});

export default router;
