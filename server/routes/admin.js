import express from "express";
import {
  getAdminBusinessById,
  getAdminBusinesses,
  getAdminOverview,
  updateAdminBusinessBeta,
  updateAdminBusinessStatus,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/overview", asyncHandler(getAdminOverview));
router.get("/businesses", asyncHandler(getAdminBusinesses));
router.get("/businesses/:businessId", asyncHandler(getAdminBusinessById));
router.patch(
  "/businesses/:businessId/status",
  asyncHandler(updateAdminBusinessStatus),
);
router.patch(
  "/businesses/:businessId/beta",
  asyncHandler(updateAdminBusinessBeta),
);

export default router;
