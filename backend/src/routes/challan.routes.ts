import { Router } from "express";

import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallanStatus,
} from "../controllers/challan.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

// Create challan
router.post(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  createChallan
);

// List challans
router.get(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  getChallans
);

// Get challan details
router.get(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  getChallanById
);

// Update challan status
router.patch(
  "/:id/status",
  authorizeRoles("ADMIN", "SALES"),
  updateChallanStatus
);

export default router;