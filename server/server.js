import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import whatsappRoutes from "./routes/whatsapp.js";
import testimonialRoutes from "./routes/testimonial.js";
import whatsappWebhookRoutes from "./webhook/whatsappWebhook.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const webhookJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
});

const allowedOrigins = [
  "https://woice.it.com",
  "https://www.woice.it.com",
  "https://testimonial-app-sable.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());

app.use("/webhook", webhookJsonParser, whatsappWebhookRoutes);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/testimonials", testimonialRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
