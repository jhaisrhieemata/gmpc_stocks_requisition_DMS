/**
 * Requisitions Routes
 * Handles requisition management
 */

import express from "express";
import { query } from "../config/database.js";

const router = express.Router();

// Get all requisitions
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.id, r.request_number, r.user_id, r.branch_id, r.type, r.status,
        r.total_amount, r.created_at, r.updated_at,
        u.full_name as user_name, u.email as user_email,
        b.name as branch_name
      FROM requisitions r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN branches b ON r.branch_id = b.id
      ORDER BY r.created_at DESC
    `);

    return res.json({
      success: true,
      requisitions: result.rows || [],
      total: (result.rows || []).length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requisitions",
      error: error.message,
    });
  }
});

// Get requisition by ID with items
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get requisition
    const reqResult = await query(
      `SELECT 
        r.id, r.request_number, r.user_id, r.branch_id, r.type, r.status,
        r.total_amount, r.signature_data, r.created_at, r.updated_at,
        u.full_name as user_name, u.email as user_email,
        b.name as branch_name
      FROM requisitions r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN branches b ON r.branch_id = b.id
      WHERE r.id = ?`,
      [id]
    );

    if (!reqResult.rows || reqResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Requisition not found",
      });
    }

    // Get requisition items
    const itemsResult = await query(
      `SELECT 
        ri.id, ri.quantity, ri.unit_price, ri.total_price, ri.status,
        ri.description,
        inv.id as inventory_id, inv.description as inventory_description
      FROM requisition_items ri
      LEFT JOIN inventory inv ON ri.inventory_id = inv.id
      WHERE ri.requisition_id = ?`,
      [id]
    );

    const requisition = reqResult.rows[0];
    requisition.items = itemsResult.rows || [];

    return res.json({
      success: true,
      requisition,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requisition",
      error: error.message,
    });
  }
});

// Create requisition
router.post("/", async (req, res) => {
  try {
    const { user_id, branch_id, type, items, signature_data } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Generate request number
    const timestamp = Date.now();
    const request_number = `REQ-${timestamp}`;

    // Calculate total amount
    let total_amount = 0;
    if (items && Array.isArray(items)) {
      total_amount = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }

    // Create requisition
    const result = await query(
      `INSERT INTO requisitions 
      (request_number, user_id, branch_id, type, status, total_amount, signature_data) 
      VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [request_number, user_id, branch_id, type, total_amount, signature_data]
    );

    const requisition_id = result.rows[0].insertId;

    // Create requisition items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO requisition_items 
          (requisition_id, inventory_id, quantity, unit_price, total_price, description, status) 
          VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [
            requisition_id,
            item.inventory_id,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.description,
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Requisition created successfully",
      id: requisition_id,
      request_number,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create requisition",
      error: error.message,
    });
  }
});

// Update requisition status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const result = await query(
      "UPDATE requisitions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Requisition not found",
      });
    }

    return res.json({
      success: true,
      message: "Requisition updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update requisition",
      error: error.message,
    });
  }
});

// Delete requisition
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete items first
    await query("DELETE FROM requisition_items WHERE requisition_id = ?", [id]);

    // Delete requisition
    const result = await query("DELETE FROM requisitions WHERE id = ?", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Requisition not found",
      });
    }

    return res.json({
      success: true,
      message: "Requisition deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete requisition",
      error: error.message,
    });
  }
});

export default router;
