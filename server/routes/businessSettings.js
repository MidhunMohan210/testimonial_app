import express from "express";
import {
  getMyBusiness,
  updateMyBusiness,
} from "../controllers/businessSettingsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/me", asyncHandler(getMyBusiness));
router.patch("/me", asyncHandler(updateMyBusiness));

export default router;
