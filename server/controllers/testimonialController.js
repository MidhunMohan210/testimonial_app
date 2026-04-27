import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import { createHttpError } from "../utils/httpError.js";

const getPaginationOptions = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const getDateFilter = (query) => {
  const dateFilter = {};
  const fromDate = query.fromDate ? new Date(query.fromDate) : null;
  const toDate = query.toDate ? new Date(query.toDate) : null;

  if (fromDate && !Number.isNaN(fromDate.getTime())) {
    dateFilter.$gte = fromDate;
  }

  if (toDate && !Number.isNaN(toDate.getTime())) {
    dateFilter.$lte = toDate;
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

const getWordFilterStages = (query, textField) => {
  const minWords = Number.parseInt(query.minWords, 10);
  const maxWords = Number.parseInt(query.maxWords, 10);
  const wordFilter = {};

  if (!Number.isNaN(minWords)) {
    wordFilter.$gte = minWords;
  }

  if (!Number.isNaN(maxWords)) {
    wordFilter.$lte = maxWords;
  }

  if (Object.keys(wordFilter).length === 0) {
    return [];
  }

  return [
    {
      $addFields: {
        __wordCount: {
          $size: {
            $filter: {
              input: {
                $split: [
                  { $trim: { input: { $ifNull: [`$${textField}`, ""] } } },
                  " ",
                ],
              },
              as: "word",
              cond: { $ne: ["$$word", ""] },
            },
          },
        },
      },
    },
    { $match: { __wordCount: wordFilter } },
  ];
};

export const getTestimonials = async (req, res) => {
  const { status } = req.query;
  const query = { businessId: req.user.businessId };
  const { page, limit, skip } = getPaginationOptions(req.query);
  const dateFilter = getDateFilter(req.query);
  const wordFilterStages = getWordFilterStages(req.query, "testimonialText");
  const sort =
    req.query.ratingSort === "high_to_low"
      ? { rating: -1, collectedAt: -1, _id: -1 }
      : req.query.ratingSort === "low_to_high"
        ? { rating: 1, collectedAt: -1, _id: -1 }
        : { collectedAt: -1, _id: -1 };

  if (status && ["pending", "approved", "hidden"].includes(status)) {
    query.status = status;
  }

  if (dateFilter) {
    query.collectedAt = dateFilter;
  }

  const [result, summary] = await Promise.all([
    Testimonial.aggregate([
      { $match: query },
      ...wordFilterStages,
      {
        $facet: {
          data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ]),
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
  const testimonials = result[0]?.data || [];
  const total = result[0]?.total[0]?.count || 0;

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

export const getUnreadTestimonialCount = async (req, res) => {
  const unreadCount = await Testimonial.countDocuments({
    businessId: req.user.businessId,
    isRead: { $ne: true },
  });

  return res.json({ unreadCount });
};

export const markAllTestimonialsAsRead = async (req, res) => {
  const result = await Testimonial.updateMany(
    {
      businessId: req.user.businessId,
      isRead: { $ne: true },
    },
    {
      $set: { isRead: true },
    }
  );

  return res.json({
    success: true,
    modifiedCount: result.modifiedCount || 0,
  });
};
