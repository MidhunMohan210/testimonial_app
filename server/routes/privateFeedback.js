import express from "express";
import { validate } from "../middleware/validate.js";
import {
  getPrivateFeedback,
  getUnreadPrivateFeedbackCount,
  markAllPrivateFeedbackAsRead,
  updatePrivateFeedback,
} from "../controllers/privateFeedbackController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { updatePrivateFeedbackSchema } from "../schemas/reviewSchema.js";

const router = express.Router();

router.get("/", asyncHandler(getPrivateFeedback));
router.get("/unread-count", asyncHandler(getUnreadPrivateFeedbackCount));
router.post("/mark-read", asyncHandler(markAllPrivateFeedbackAsRead));
router.patch("/:id", validate(updatePrivateFeedbackSchema), asyncHandler(updatePrivateFeedback));

export default router;
