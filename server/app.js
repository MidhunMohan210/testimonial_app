import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import whatsappRoutes from "./routes/whatsapp.js";
import whatsappCallbackRoutes from "./routes/whatsappCallback.js";
import testimonialRoutes from "./routes/testimonial.js";
import businessSettingsRouter from "./routes/businessSettings.js";
import privateFeedbackRouter from "./routes/privateFeedback.js";
import publicReviewRouter from "./routes/publicReview.js";
import publicTestimonialsRouter from "./routes/publicTestimonials.js";
import whatsappWebhookRoutes from "./webhook/whatsappWebhook.js";

import authMiddleware from "./middleware/authMiddleware.js";
import adminOnlyMiddleware from "./middleware/adminOnlyMiddleware.js";
import businessStatusMiddleware from "./middleware/businessStatusMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

/*
|--------------------------------------------------------------------------
| Security headers
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Public testimonial API
|--------------------------------------------------------------------------
*/

const publicReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

// This must remain before the restricted global CORS configuration.
// Public widgets can be embedded on external websites.
app.use(
  "/api/p",
  publicReadLimiter,
  cors({
    origin: "*",
    credentials: false,
  }),
  publicTestimonialsRouter
);

/*
|--------------------------------------------------------------------------
| Application CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://app.woice.it.com",
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
    // Allows requests without an Origin header,
    // such as Postman, server-to-server requests and tests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`Not allowed by CORS: ${origin}`)
    );
  },
  credentials: true,
});

app.use(appCors);
app.options("*", appCors);

/*
|--------------------------------------------------------------------------
| Webhook JSON parser
|--------------------------------------------------------------------------
*/

const webhookJsonParser = express.json({
  verify: (req, res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
});

/*
|--------------------------------------------------------------------------
| Session configuration
|--------------------------------------------------------------------------
|
| During automated tests, MongoStore is not created.
| This prevents tests from connecting to the normal MongoDB database.
|
*/

const sessionConfig = {
  secret: isTest
    ? "woice-test-session-secret"
    : process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
};

if (!isTest) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24,
    autoRemove: "native",
  });
}

app.use(session(sessionConfig));

/*
|--------------------------------------------------------------------------
| Public review rate limiter
|--------------------------------------------------------------------------
*/

function getBusinessKey(req) {
  return (
    req.body?.businessId ||
    req.params?.businessId ||
    req.params?.slug ||
    req.query?.businessId ||
    "unknown-business"
  );
}

const publicReviewLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    `${req.ip}:${getBusinessKey(req)}`,
  message: {
    error:
      "Too many submissions in a short time. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| WhatsApp webhook
|--------------------------------------------------------------------------
|
| The webhook uses its own JSON parser because it needs the raw request body.
|
*/

if (process.env.WHATSAPP_ENABLED === "true") {
  app.use(
    "/webhook",
    webhookJsonParser,
    whatsappWebhookRoutes
  );
}

/*
|--------------------------------------------------------------------------
| Normal JSON parser
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health route
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
  });
});

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// app.use("/whatsapp", whatsappCallbackRoutes);

app.use(
  "/api/r",
  publicReviewLimiter,
  publicReviewRouter
);

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Protected routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  authMiddleware,
  adminOnlyMiddleware,
  adminRoutes
);

app.use(
  "/api/business",
  authMiddleware,
  businessStatusMiddleware,
  businessSettingsRouter
);

app.use(
  "/api/feedback",
  authMiddleware,
  businessStatusMiddleware,
  privateFeedbackRouter
);

app.use(
  "/api/whatsapp",
  authMiddleware,
  businessStatusMiddleware,
  whatsappRoutes
);

app.use(
  "/api/testimonials",
  authMiddleware,
  businessStatusMiddleware,
  testimonialRoutes
);

/*
|--------------------------------------------------------------------------
| Central error handler
|--------------------------------------------------------------------------
|
| Keep this after every route.
|
*/

app.use(errorHandler);

export default app;