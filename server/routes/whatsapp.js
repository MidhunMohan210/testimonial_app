import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  sendRequest,
  getRequests,
  saveEmbeddedSignupConnection,
  saveWhatsAppAccount,
} from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/connect", authMiddleware, asyncHandler(saveEmbeddedSignupConnection));
router.post("/send", authMiddleware, asyncHandler(sendRequest));
router.get("/requests", authMiddleware, asyncHandler(getRequests));
router.post("/save-account", asyncHandler(saveWhatsAppAccount));


export default router;
