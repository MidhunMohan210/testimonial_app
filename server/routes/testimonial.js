import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  getTestimonials,
  updateStatus,
  deleteTestimonial,
  addManualTestimonial,
  getUnreadTestimonialCount,
  markAllTestimonialsAsRead,
} from "../controllers/testimonialController.js";
import { manualAddSchema } from "../schemas/reviewSchema.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getTestimonials));
router.get("/unread-count", authMiddleware, asyncHandler(getUnreadTestimonialCount));
router.post("/mark-read", authMiddleware, asyncHandler(markAllTestimonialsAsRead));
router.delete("/:id", authMiddleware, asyncHandler(deleteTestimonial));
router.patch("/:id/status", authMiddleware, asyncHandler(updateStatus));
router.post("/manual", authMiddleware, validate(manualAddSchema), asyncHandler(addManualTestimonial));

export default router;
