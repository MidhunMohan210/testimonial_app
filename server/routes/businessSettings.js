import express from "express";
import {
  getBusinessSettings,
  getMyBusiness,
  updateBusinessSettings,
  updateMyBusiness,
} from "../controllers/businessSettingsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/settings", asyncHandler(getBusinessSettings));
router.put("/settings", asyncHandler(updateBusinessSettings));
router.get("/me", asyncHandler(getMyBusiness));
router.patch("/me", asyncHandler(updateMyBusiness));

export default router;
