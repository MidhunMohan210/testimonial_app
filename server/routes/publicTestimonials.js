import express from "express";
import { getPublicTestimonials } from "../controllers/publicTestimonialsController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/:slug", asyncHandler(getPublicTestimonials));

export default router;
