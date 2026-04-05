import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  getTestimonials,
  updateStatus,
  addManualTestimonial,
} from "../controllers/testimonialController.js";
import { manualAddSchema } from "../schemas/reviewSchema.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getTestimonials));
router.patch("/:id/status", authMiddleware, asyncHandler(updateStatus));
router.post("/manual", authMiddleware, validate(manualAddSchema), asyncHandler(addManualTestimonial));

export default router;
