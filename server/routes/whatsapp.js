import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendRequest, getRequests } from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/send", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, getRequests);

export default router;
