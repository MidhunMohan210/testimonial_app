import express from "express";
import {
  getPrivateFeedback,
  getUnreadPrivateFeedbackCount,
  markAllPrivateFeedbackAsRead,
} from "../controllers/privateFeedbackController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getPrivateFeedback));
router.get("/unread-count", asyncHandler(getUnreadPrivateFeedbackCount));
router.post("/mark-read", asyncHandler(markAllPrivateFeedbackAsRead));

export default router;
