import Business from "../models/Business.js";
import {
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
    settings,
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
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body, "googleReviewLink")) {
    updates["settings.googleReviewLink"] = req.body.googleReviewLink?.trim() || "";
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

    updates.slug = slug;
  }

  const business = await Business.findByIdAndUpdate(
    req.user.businessId,
    Object.keys(updates).length > 0 ? { $set: updates } : {},
    { new: true },
  );

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

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

  const updateFields = {
    businessName: name.trim(),
    ...(googleReviewLink !== undefined
      ? { "settings.googleReviewLink": String(googleReviewLink).trim() }
      : {}),
    ...(googleReviewEnabled !== undefined
      ? { "settings.googleReviewEnabled": Boolean(googleReviewEnabled) }
      : {}),
    ...(isPublicEnabled !== undefined
      ? { "settings.isPublicEnabled": Boolean(isPublicEnabled) }
      : {}),
    ...(notificationsEnabled !== undefined
      ? { "settings.notificationsEnabled": Boolean(notificationsEnabled) }
      : {}),
  };

  const updatedBusiness = await Business.findByIdAndUpdate(
    req.user.businessId,
    { $set: updateFields },
    { new: true },
  );

  if (!updatedBusiness) {
    throw createHttpError(404, "Business not found");
  }

  return res.json(formatSettingsResponse(updatedBusiness));
};

export const updateShareFeedbackSettings = async (req, res) => {
  const { greetingMessage } = req.body;

  if (typeof greetingMessage !== "string") {
    throw createHttpError(400, "Greeting message must be a string");
  }

  const trimmedGreetingMessage = greetingMessage.trim();

  if (trimmedGreetingMessage.length > 500) {
    throw createHttpError(400, "Greeting message must be 500 characters or less");
  }

  const update =
    trimmedGreetingMessage.length === 0
      ? {
          $unset: {
            "settings.shareFeedback.greetingMessage": "",
          },
        }
      : {
          $set: {
            "settings.shareFeedback.greetingMessage": trimmedGreetingMessage,
          },
        };

  const business = await Business.findByIdAndUpdate(req.user.businessId, update, {
    new: true,
  });

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json({
    message:
      trimmedGreetingMessage.length === 0
        ? "Greeting message reset to default"
        : "Greeting message saved successfully",
    business: toBusinessResponse(business),
    settings: formatSettingsResponse(business),
  });
};
