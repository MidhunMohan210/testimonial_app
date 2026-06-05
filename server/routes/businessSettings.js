import express from "express";
import {
  getBusinessSettings,
  getMyBusiness,
  updateBusinessSettings,
  updateShareFeedbackSettings,
  updateMyBusiness,
} from "../controllers/businessSettingsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/settings", asyncHandler(getBusinessSettings));
router.put("/settings", asyncHandler(updateBusinessSettings));
router.patch("/settings/share-feedback", asyncHandler(updateShareFeedbackSettings));
router.get("/me", asyncHandler(getMyBusiness));
router.patch("/me", asyncHandler(updateMyBusiness));

export default router;
