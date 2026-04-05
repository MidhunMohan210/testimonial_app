import express from "express";
import { getPrivateFeedback } from "../controllers/privateFeedbackController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getPrivateFeedback));

export default router;
