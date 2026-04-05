import express from "express";
import { register, login } from "../controllers/authController.js";
import authRateLimit from "../middleware/authRateLimit.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/register", authRateLimit, validate(registerSchema), asyncHandler(register));
router.post("/login", authRateLimit, asyncHandler(login));

export default router;
