import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import whatsappRoutes from "./routes/whatsapp.js";
import testimonialRoutes from "./routes/testimonial.js";
import whatsappWebhookRoutes from "./webhook/whatsappWebhook.js";
import { startTelegramBot } from "./telegram/telegramBot.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

console.log("Twilio env loaded:", {
  accountSid: process.env.TWILIO_ACCOUNT_SID
    ? `${process.env.TWILIO_ACCOUNT_SID.slice(0, 2)}...${process.env.TWILIO_ACCOUNT_SID.slice(-4)}`
    : "missing",
  authTokenPresent: Boolean(process.env.TWILIO_AUTH_TOKEN),
  fromNumber: process.env.TWILIO_WHATSAPP_FROM_NUMBER || "missing",
});

app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/webhook", whatsappWebhookRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    if (process.env.TELEGRAM_BOT_TOKEN) {
      startTelegramBot();
      console.log("Telegram bot started ✅");
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
