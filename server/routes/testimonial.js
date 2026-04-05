import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  getTestimonials,
  updateStatus,
  addManualTestimonial,
} from "../controllers/testimonialController.js";
import { manualAddSchema } from "../schemas/reviewSchema.js";

const router = express.Router();

router.get("/", authMiddleware, getTestimonials);
router.patch("/:id/status", authMiddleware, updateStatus);
router.post("/manual", authMiddleware, validate(manualAddSchema), addManualTestimonial);

export default router;
