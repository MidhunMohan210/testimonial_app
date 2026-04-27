import Business from "../models/Business.js";
import {
  assignBusinessSettings,
  getBusinessSettings as readBusinessSettings,
  toBusinessResponse,
} from "../utils/businessSettings.js";
import { createHttpError } from "../utils/httpError.js";

const normalizeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const formatSettingsResponse = (business) => {
  const settings = readBusinessSettings(business);

  return {
    name: business.businessName || "",
    slug: business.slug || "",
    googleReviewLink: settings.googleReviewLink,
    googleReviewEnabled: settings.googleReviewEnabled,
    isPublicEnabled: settings.isPublicEnabled,
    notificationsEnabled: settings.notificationsEnabled,
  };
};

const validateUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const getMyBusiness = async (req, res) => {
  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json(toBusinessResponse(business));
};

export const updateMyBusiness = async (req, res) => {
  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "googleReviewLink")) {
    assignBusinessSettings(business, {
      googleReviewLink: req.body.googleReviewLink?.trim() || "",
    });
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
    const slug = normalizeSlug(String(req.body.slug || "").trim());

    if (!slug) {
      throw createHttpError(400, "Slug cannot be empty");
    }

    const existingBusiness = await Business.findOne({
      slug,
      _id: { $ne: req.user.businessId },
    });

    if (existingBusiness) {
      throw createHttpError(409, "Slug is already in use");
    }

    business.slug = slug;
  }

  await business.save();

  return res.json(toBusinessResponse(business));
};

export const getBusinessSettings = async (req, res) => {
  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json(formatSettingsResponse(business));
};

export const updateBusinessSettings = async (req, res) => {
  const {
    name,
    googleReviewLink,
    googleReviewEnabled,
    isPublicEnabled,
    notificationsEnabled,
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Business name is required");
  }

  if (
    googleReviewLink !== undefined &&
    String(googleReviewLink).trim() &&
    !validateUrl(String(googleReviewLink).trim())
  ) {
    throw createHttpError(400, "Google review link must be a valid URL");
  }

  const business = await Business.findById(req.user.businessId);

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  business.businessName = name.trim();
  assignBusinessSettings(business, {
    ...(googleReviewLink !== undefined
      ? { googleReviewLink: String(googleReviewLink).trim() }
      : {}),
    ...(googleReviewEnabled !== undefined
      ? { googleReviewEnabled: Boolean(googleReviewEnabled) }
      : {}),
    ...(isPublicEnabled !== undefined
      ? { isPublicEnabled: Boolean(isPublicEnabled) }
      : {}),
    ...(notificationsEnabled !== undefined
      ? { notificationsEnabled: Boolean(notificationsEnabled) }
      : {}),
  });
  await business.save();

  return res.json(formatSettingsResponse(business));
};
