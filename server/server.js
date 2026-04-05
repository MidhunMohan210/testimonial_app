import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import session from "express-session";           // NEW: session support for OAuth callback
import MongoStore from "connect-mongo";          // NEW: stores sessions in MongoDB (survives server restarts)
import rateLimit from "express-rate-limit";      // NEW: protects public endpoints from abuse

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

// ─── Webhook JSON Parser ───────────────────────────────────────────────────────
// Separate parser ONLY for /webhook so rawBody is captured.
// WhatsApp requires rawBody for HMAC signature verification.
// Must be defined before express.json() — order is critical.
const webhookJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Whitelist of allowed origins. Requests from unlisted origins are blocked.
// credentials: true is required for cookies/session to work cross-origin.
const allowedOrigins = [
  "https://woice.it.com",
  "https://www.woice.it.com",
  "https://testimonial-app-sable.vercel.app",
  "http://localhost:5173",
  "http://192.168.20.5:5173",  // removed trailing slash — CORS matching is exact
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors()); // Handle preflight requests for all routes

// ─── Session Middleware ────────────────────────────────────────────────────────
// Required for whatsappCallback.js which uses req.session to temporarily
// store OAuth state (e.g. the business ID) between the redirect and callback.
// Sessions are persisted in MongoDB so they survive server restarts.
// SESSION_SECRET must be a long random string in your .env file.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,               // don't save session if it wasn't modified
    saveUninitialized: false,    // don't create session until something is stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24,        // sessions expire in 24 hours
      autoRemove: "native",      // MongoDB TTL index cleans up expired sessions
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod, HTTP allowed in dev
      httpOnly: true,            // JS cannot access the cookie (prevents XSS theft)
      sameSite: "lax",           // allows cookie on OAuth redirects
      maxAge: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    },
  })
);

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// For /api/r — the public review submission form.
// A customer submitting a review should never need more than a few attempts.
// 10 submissions per IP per 15 min prevents form spam and fake reviews.
const publicReviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,         // sends RateLimit headers in response
  legacyHeaders: false,
  message: {
    error: "Too many submissions from this IP. Please try again later.",
  },
});

// For /api/p — public testimonials read endpoint (used by embed widget).
// The slider widget may poll this on every page load of a business's site.
// 60 reads/min per IP is generous enough for real usage but blocks scrapers.
const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

// ─── WhatsApp Webhook (Feature Flagged) ───────────────────────────────────────
// Gated behind WHATSAPP_ENABLED=true in .env.
// Prevents the async bug in whatsappWebhook.js from being reachable
// until the WhatsApp integration is fully completed.
if (process.env.WHATSAPP_ENABLED === "true") {
  app.use("/webhook", webhookJsonParser, whatsappWebhookRoutes);
}

// ─── Body Parser ──────────────────────────────────────────────────────────────
// Global JSON parser for all non-webhook routes.
// Placed AFTER the webhook route intentionally — webhook needs its own parser
// with rawBody capture. Applying this globally first would consume the body
// before rawBody can be set.
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple liveness probe. Useful for Render/Railway/uptime monitors.
// No auth required — just confirms the server is running.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public unauthenticated routes — rate limiters applied here
app.use("/whatsapp", whatsappCallbackRoutes);
// app.use("/api/r", publicReviewLimiter, publicReviewRouter);     // review form submissions
// app.use("/api/p", publicReadLimiter, publicTestimonialsRouter); // embed widget reads

app.use("/api/r", publicReviewRouter);     // review form submissions
app.use("/api/p", publicTestimonialsRouter); // embed widget reads

// Auth routes — register/login, no middleware needed
app.use("/api/auth", authRoutes);

// Protected routes — authMiddleware validates JWT on every request
app.use("/api/business", authMiddleware, businessSettingsRouter);
app.use("/api/feedback", authMiddleware, privateFeedbackRouter);
app.use("/api/whatsapp", authMiddleware, whatsappRoutes);       // added authMiddleware — was missing
app.use("/api/testimonials", authMiddleware, testimonialRoutes); // added authMiddleware — was missing
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
