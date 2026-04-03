import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendRequest,
  getRequests,
  saveEmbeddedSignupConnection,
  saveWhatsAppAccount,
} from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/connect", authMiddleware, saveEmbeddedSignupConnection);
router.post("/send", authMiddleware, sendRequest);
router.get("/requests", authMiddleware, getRequests);
router.post("/save-account", saveWhatsAppAccount);


export default router;
