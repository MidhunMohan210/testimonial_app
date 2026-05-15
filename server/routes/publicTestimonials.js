import express from "express";
import {
  getPublicTestimonials,
  getPublicTestimonialsVersion,
} from "../controllers/publicTestimonialsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get(
  "/business/:slug/testimonials-version",
  asyncHandler(getPublicTestimonialsVersion),
);
router.get("/:slug", asyncHandler(getPublicTestimonials));

export default router;
