import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTestimonials,
  updateStatus,
  addManualTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", authMiddleware, getTestimonials);
router.patch("/:id/status", authMiddleware, updateStatus);
router.post("/manual", authMiddleware, addManualTestimonial);

export default router;
