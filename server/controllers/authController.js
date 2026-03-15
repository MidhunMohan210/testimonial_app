import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Business from "../models/Business.js";

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
const normalizeEmail = (value) => value?.trim().toLowerCase();
const normalizeMobile = (value) => value?.trim();

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  businessId: user.businessId,
  createdAt: user.createdAt,
});

const sanitizeBusiness = (business) => ({
  _id: business._id,
  userId: business.userId,
  businessName: business.businessName,
  whatsappPhoneNumberId: business.whatsappPhoneNumberId,
  apiKey: business.apiKey,
  createdAt: business.createdAt,
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  try {
    const { name, email, mobile, password, businessName } = req.body;

    if (!name || !email || !mobile || !password || !businessName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(mobile);

    if (!isEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(normalizedMobile)) {
      return res.status(400).json({ message: "Please enter a valid mobile number" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User with this email or mobile already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
    });

    const business = await Business.create({
      userId: user._id,
      businessName: businessName.trim(),
      whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    });

    user.businessId = business._id;
    await user.save();

    return res.status(201).json({
      token: signToken(user._id),
      user: sanitizeUser(user),
      business: sanitizeBusiness(business),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: "Email/mobile and password are required" });
    }

    const identifier = emailOrMobile.trim();
    const user = await User.findOne({
      $or: [{ email: normalizeEmail(identifier) }, { mobile: normalizeMobile(identifier) }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const business = await Business.findById(user.businessId);

    return res.json({
      token: signToken(user._id),
      user: sanitizeUser(user),
      business: business ? sanitizeBusiness(business) : null,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};
