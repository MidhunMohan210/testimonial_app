import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import { createHttpError } from "../utils/httpError.js";

export const getTestimonials = async (req, res) => {
  const { status } = req.query;
  const query = { businessId: req.user.businessId };
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  if (status && ["pending", "approved", "hidden"].includes(status)) {
    query.status = status;
  }

  const [testimonials, total, summary] = await Promise.all([
    Testimonial.find(query).sort({ collectedAt: -1 }).skip(skip).limit(limit),
    Testimonial.countDocuments(query),
    Testimonial.aggregate([
      { $match: { businessId: req.user.businessId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusSummary = summary.reduce(
    (accumulator, item) => {
      accumulator[item._id] = item.count;
      return accumulator;
    },
    { approved: 0, pending: 0, hidden: 0 }
  );

  return res.json({
    data: testimonials,
    page,
    limit,
    total,
    summary: {
      total,
      approved: statusSummary.approved,
      pending: statusSummary.pending,
      hidden: statusSummary.hidden,
    },
  });
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "hidden"].includes(status)) {
    throw createHttpError(400, "Invalid status value");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, "Invalid testimonial id");
  }

  const testimonial = await Testimonial.findOneAndUpdate(
    { _id: id, businessId: req.user.businessId },
    { status },
    { new: true }
  );

  if (!testimonial) {
    throw createHttpError(404, "Testimonial not found");
  }

  return res.json(testimonial);
};

export const addManualTestimonial = async (req, res) => {
  const { customerName, customerPhone, rating, testimonialText } = req.body;
  const numericRating = Number(rating);

  if (!rating || !testimonialText) {
    throw createHttpError(400, "Customer phone, rating, and testimonial text are required");
  }

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw createHttpError(400, "Rating must be a number between 1 and 5");
  }

  const testimonial = await Testimonial.create({
    businessId: req.user.businessId,
    customerName: customerName?.trim(),
    rating: numericRating,
    testimonialText: testimonialText.trim(),
    source: "manual",
    status: "approved",
  });

  return res.status(201).json(testimonial);
};
