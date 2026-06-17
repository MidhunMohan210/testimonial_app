import Business from "../models/Business.js";
import PrivateFeedback from "../models/PrivateFeedback.js";
import Testimonial from "../models/Testimonial.js";
import { getBusinessSettings } from "../utils/businessSettings.js";
import { createHttpError } from "../utils/httpError.js";

export const getBusinessBySlug = async (req, res) => {
  const business = await Business.findOne({ slug: req.params.slug }).select(
    "businessName settings",
  );

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json({
    businessId: String(business._id),
    businessName: business.businessName,
    googleReviewLink: getBusinessSettings(business).googleReviewLink,
    googleReviewEnabled: getBusinessSettings(business).googleReviewEnabled,
    settings: getBusinessSettings(business),
  });
};

export const submitPublicReview = async (req, res) => {
  const { customerName, rating, reviewText } = req.body;
  const numericRating = Number(rating);

  if (![4, 5].includes(numericRating)) {
    throw createHttpError(400, "Rating must be 4 or 5");
  }

  if (!reviewText?.trim()) {
    throw createHttpError(400, "Review text is required");
  }

  const business = await Business.findOne({ slug: req.params.slug });

  if (!business) {
    throw createHttpError(404, "Business not found");
  }


  await Testimonial.create({
    businessId: business._id,
    customerName: customerName?.trim(),
    customerPhone: `link-${Date.now()}`,
    ip: req.ip,
    rating: numericRating,
    testimonialText: reviewText.trim(),
    status: "pending",
    source: "link",
  });

  return res.json({ success: true });
};

export const submitPrivateFeedback = async (req, res) => {
  const { customerName, rating, feedbackText, contactEmail, contactPhone, allowFollowUp } = req.body;
  const numericRating = Number(rating);

  if (![1, 2, 3].includes(numericRating)) {
    throw createHttpError(400, "Rating must be 1, 2, or 3");
  }

  if (!feedbackText?.trim()) {
    throw createHttpError(400, "Feedback text is required");
  }

  const business = await Business.findOne({ slug: req.params.slug });

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  await PrivateFeedback.create({
    businessId: business._id,
    customerName: customerName?.trim(),
    rating: numericRating,
    feedbackText: feedbackText.trim(),
    contactEmail: contactEmail?.trim() || undefined,
    contactPhone: contactPhone?.trim() || undefined,
    allowFollowUp: Boolean(allowFollowUp),
  });

  return res.json({ success: true });
};
