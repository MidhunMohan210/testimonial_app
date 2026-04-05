import express from "express";
import { register, login } from "../controllers/authController.js";
import authRateLimit from "../middleware/authRateLimit.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/register", authRateLimit, validate(registerSchema), register);
router.post("/login", authRateLimit, login);

export default router;
