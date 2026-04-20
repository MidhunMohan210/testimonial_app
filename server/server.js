import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import whatsappRoutes from "./routes/whatsapp.js";
import whatsappCallbackRoutes from "./routes/whatsappCallback.js";
import testimonialRoutes from "./routes/testimonial.js";
import businessSettingsRouter from "./routes/businessSettings.js";
import privateFeedbackRouter from "./routes/privateFeedback.js";
import publicReviewRouter from "./routes/publicReview.js";
import publicTestimonialsRouter from "./routes/publicTestimonials.js";
import whatsappWebhookRoutes from "./webhook/whatsappWebhook.js";
import authMiddleware from "./middleware/authMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// Important for Railway / reverse proxies so req.ip works properly
app.set("trust proxy", 1);

// ─── Webhook JSON Parser ───────────────────────────────────────────────────────
const webhookJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options("*", cors());

// ─── Session Middleware ────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24,
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ─── Helpers For Rate Limiting ────────────────────────────────────────────────
function getBusinessKey(req) {
  return (
    req.body?.businessId ||
    req.params?.businessId ||
    req.query?.businessId ||
    "unknown-business"
  );
}

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Public review submission limiter
// Safer for shared Wi-Fi / classroom cases:
// - shorter window
// - higher limit
// - counts per IP + business instead of only IP
const publicReviewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}:${getBusinessKey(req)}`;
  },
  message: {
    error: "Too many submissions in a short time. Please try again later.",
  },
});

// Public testimonials read limiter
// Slightly more generous for embedded widgets
const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

// ─── WhatsApp Webhook (Feature Flagged) ───────────────────────────────────────
if (process.env.WHATSAPP_ENABLED === "true") {
  app.use("/webhook", webhookJsonParser, whatsappWebhookRoutes);
}

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public unauthenticated routes
app.use("/whatsapp", whatsappCallbackRoutes);
app.use("/api/r", publicReviewLimiter, publicReviewRouter);
app.use("/api/p", publicReadLimiter, publicTestimonialsRouter);

// Auth routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/business", authMiddleware, businessSettingsRouter);
app.use("/api/feedback", authMiddleware, privateFeedbackRouter);
app.use("/api/whatsapp", authMiddleware, whatsappRoutes);
app.use("/api/testimonials", authMiddleware, testimonialRoutes);

app.use(errorHandler);

// ─── Database + Server Start ──────────────────────────────────────────────────
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