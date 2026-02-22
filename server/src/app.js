/**
 * Express Server Configuration
 * GMPC Requisition System
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

// Import routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import branchesRoutes from "./routes/branches.js";
import suppliersRoutes from "./routes/suppliers.js";
import inventoryRoutes from "./routes/inventory.js";
import requisitionsRoutes from "./routes/requisitions.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/requisitions", requisitionsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
