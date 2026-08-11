import { Router } from "express";

import {
  stockIn,
  stockOut,
  getStockMovements,
} from "../controllers/inventory.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post(
  "/stock-in",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  stockIn
);

router.post(
  "/stock-out",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  stockOut
);

router.get(
  "/movements",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  getStockMovements
);

export default router;
