import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendRequest,
  getRequests,
  sendTestRequest,
} from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/send", authMiddleware, sendRequest);
router.post("/send-test", authMiddleware, sendTestRequest);
router.get("/requests", authMiddleware, getRequests);

export default router;
