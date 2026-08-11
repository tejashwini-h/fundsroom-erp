import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import challanRoutes from "./routes/challan.routes.js";

import { authenticateToken } from "./middleware/auth.middleware.js";
import { authorizeRoles } from "./middleware/role.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Fundsroom ERP API is running",
  });
});

// Authentication
app.use("/api/auth", authRoutes);

// Authenticated user information
app.get(
  "/api/auth/me",
  authenticateToken,
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Authenticated user",
      data: res.locals.user,
    });
  }
);

// Temporary authorization test
app.get(
  "/api/auth/admin-test",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  }
);

// Customer CRM
app.use("/api/customers", customerRoutes);

// Product management
app.use("/api/products", productRoutes);

// Inventory management
app.use("/api/inventory", inventoryRoutes);

// Sales Challan
app.use("/api/challans", challanRoutes);

export default app;