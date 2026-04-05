import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  getBusinessBySlug,
  submitPrivateFeedback,
  submitPublicReview,
} from "../controllers/publicReviewController.js";
import { privateFeedbackSchema, submitReviewSchema } from "../schemas/reviewSchema.js";

const router = express.Router();

router.get("/:slug", asyncHandler(getBusinessBySlug));
router.post("/:slug/submit", validate(submitReviewSchema), asyncHandler(submitPublicReview));
router.post("/:slug/feedback", validate(privateFeedbackSchema), asyncHandler(submitPrivateFeedback));

export default router;
