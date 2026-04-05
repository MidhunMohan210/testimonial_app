import Business from "../models/Business.js";
import { createHttpError } from "../utils/httpError.js";

const normalizeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);

    if (!business) {
      throw createHttpError(404, "Business not found");
    }

    return res.json(business);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createHttpError(500, "Internal server error");
  }
};

export const updateMyBusiness = async (req, res) => {
  try {
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "googleReviewLink")) {
      updates.googleReviewLink = req.body.googleReviewLink?.trim() || "";
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
      const slug = normalizeSlug(String(req.body.slug || "").trim());

      if (!slug) {
        return res.status(400).json({ message: "Slug cannot be empty" });
      }

      const existingBusiness = await Business.findOne({
        slug,
        _id: { $ne: req.user.businessId },
      });

      if (existingBusiness) {
        return res.status(409).json({ message: "Slug is already in use" });
      }

      updates.slug = slug;
    }

    const business = await Business.findByIdAndUpdate(req.user.businessId, updates, {
      new: true,
      runValidators: true,
    });

    if (!business) {
      throw createHttpError(404, "Business not found");
    }

    return res.json(business);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createHttpError(500, "Internal server error");
  }
};
