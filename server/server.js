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
const isProduction = process.env.NODE_ENV === "production";

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.set("trust proxy", 1);

const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

// Public testimonials/widget API must be before restricted global CORS
app.use(
  "/api/p",
  publicReadLimiter,
  cors({
    origin: "*",
    credentials: false,
  }),
  publicTestimonialsRouter
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://www.woice.it.com",
  "https://woice.it.com",
  ...(isProduction
    ? []
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ]),
].filter(Boolean);

const appCors = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
});

app.use(appCors);
app.options("*", appCors);

const webhookJsonParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
});

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
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

function getBusinessKey(req) {
  return (
    req.body?.businessId ||
    req.params?.businessId ||
    req.query?.businessId ||
    "unknown-business"
  );
}

const publicReviewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${getBusinessKey(req)}`,
  message: {
    error: "Too many submissions in a short time. Please try again later.",
  },
});

if (process.env.WHATSAPP_ENABLED === "true") {
  app.use("/webhook", webhookJsonParser, whatsappWebhookRoutes);
}

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/whatsapp", whatsappCallbackRoutes);
app.use("/api/r", publicReviewLimiter, publicReviewRouter);

app.use("/api/auth", authRoutes);

app.use("/api/business", authMiddleware, businessSettingsRouter);
app.use("/api/feedback", authMiddleware, privateFeedbackRouter);
app.use("/api/whatsapp", authMiddleware, whatsappRoutes);
app.use("/api/testimonials", authMiddleware, testimonialRoutes);

app.use(errorHandler);

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