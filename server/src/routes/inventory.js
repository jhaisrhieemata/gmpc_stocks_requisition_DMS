/**
 * Inventory Routes
 * Handles inventory management
 */

import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        i.id, i.description, i.unit_price, i.measurement_unit, 
        i.status, i.quantity_on_hand, i.reorder_level, i.is_active,
        s.id as supplier_id, s.name as supplier_name,
        b.id as branch_id, b.name as branch_name,
        i.created_at
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.is_active = true
      ORDER BY i.description
    `);

    return res.json({
      success: true,
      inventory: result.rows || [],
      total: (result.rows || []).length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
});

// Get inventory item by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        i.id, i.description, i.unit_price, i.measurement_unit, 
        i.status, i.quantity_on_hand, i.reorder_level, i.is_active,
        s.id as supplier_id, s.name as supplier_name,
        b.id as branch_id, b.name as branch_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.id = ?`,
      [id]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      item: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
});

// Create inventory item
router.post("/", async (req, res) => {
  try {
    const {
      description,
      unit_price,
      measurement_unit,
      status,
      supplier_id,
      branch_id,
      quantity_on_hand,
      reorder_level,
    } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Item description is required",
      });
    }

    const result = await query(
      `INSERT INTO inventory 
      (description, unit_price, measurement_unit, status, supplier_id, branch_id, quantity_on_hand, reorder_level, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [
        description,
        unit_price,
        measurement_unit,
        status,
        supplier_id,
        branch_id,
        quantity_on_hand || 0,
        reorder_level,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      id: result.rows[0].insertId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
});

// Update inventory item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      unit_price,
      measurement_unit,
      status,
      supplier_id,
      branch_id,
      quantity_on_hand,
      reorder_level,
      is_active,
    } = req.body;

    const result = await query(
      `UPDATE inventory 
      SET description = ?, unit_price = ?, measurement_unit = ?, status = ?, 
          supplier_id = ?, branch_id = ?, quantity_on_hand = ?, reorder_level = ?, 
          is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [
        description,
        unit_price,
        measurement_unit,
        status,
        supplier_id,
        branch_id,
        quantity_on_hand,
        reorder_level,
        is_active,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      message: "Inventory item updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
      error: error.message,
    });
  }
});

// Delete inventory item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const result = await query(
      "UPDATE inventory SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      error: error.message,
    });
  }
});

export default router;
