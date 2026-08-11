import { Router } from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  createCustomer
);

router.get(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  getCustomers
);

router.get(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  getCustomerById
);

router.put(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  updateCustomer
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  deleteCustomer
);

export default router;