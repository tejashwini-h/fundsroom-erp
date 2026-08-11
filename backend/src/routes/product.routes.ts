import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  createProduct
);

router.get(
  "/",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  getProducts
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  getProductById
);

router.put(
  "/:id",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  updateProduct
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  deleteProduct
);

export default router;