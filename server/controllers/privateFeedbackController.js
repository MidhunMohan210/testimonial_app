import mongoose from "mongoose";
import PrivateFeedback from "../models/PrivateFeedback.js";
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

const getWordFilterStages = (query) => {
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
                  { $trim: { input: { $ifNull: ["$feedbackText", ""] } } },
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

export const getPrivateFeedback = async (req, res) => {
  const query = {
    businessId: req.user.businessId,
  };
  const { page, limit, skip } = getPaginationOptions(req.query);
  const dateFilter = getDateFilter(req.query);
  const wordFilterStages = getWordFilterStages(req.query);
  const sort =
    req.query.ratingSort === "high_to_low"
      ? { rating: -1, createdAt: -1, _id: -1 }
      : req.query.ratingSort === "low_to_high"
        ? { rating: 1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

  if (req.query.status && ["new", "in_progress", "resolved", "closed"].includes(req.query.status)) {
    query.status = req.query.status;
  }

  if (dateFilter) {
    query.createdAt = dateFilter;
  }

  const [result, summary] = await Promise.all([
    PrivateFeedback.aggregate([
      { $match: query },
      ...wordFilterStages,
      {
        $facet: {
          data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ]),
    PrivateFeedback.aggregate([
      { $match: { businessId: req.user.businessId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusSummary = summary.reduce(
    (accumulator, item) => {
      accumulator[item._id] = item.count;
      return accumulator;
    },
    { new: 0, in_progress: 0, resolved: 0, closed: 0 },
  );
  const feedback = result[0]?.data || [];
  const total = result[0]?.total[0]?.count || 0;

  return res.json({
    data: feedback,
    page,
    limit,
    total,
    summary: {
      total: summary.reduce((sum, item) => sum + item.count, 0),
      new: statusSummary.new,
      in_progress: statusSummary.in_progress,
      resolved: statusSummary.resolved,
      closed: statusSummary.closed,
    },
  });
};

export const getUnreadPrivateFeedbackCount = async (req, res) => {
  const unreadCount = await PrivateFeedback.countDocuments({
    businessId: req.user.businessId,
    isRead: { $ne: true },
  });

  return res.json({ unreadCount });
};

export const markAllPrivateFeedbackAsRead = async (req, res) => {
  const result = await PrivateFeedback.updateMany(
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

export const updatePrivateFeedback = async (req, res) => {
  const { id } = req.params;
  const { status, businessResponse } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, "Invalid private feedback id");
  }

  const feedback = await PrivateFeedback.findOne({
    _id: id,
    businessId: req.user.businessId,
  });

  if (!feedback) {
    throw createHttpError(404, "Private feedback not found");
  }

  if (status !== undefined) {
    feedback.status = status;
  }

  if (businessResponse !== undefined) {
    feedback.businessResponse = businessResponse.trim();
  }

  const hasResponse = Boolean(feedback.businessResponse?.trim());
  const movedBeyondNew = feedback.status !== "new";
  if (!feedback.respondedAt && (hasResponse || movedBeyondNew)) {
    feedback.respondedAt = new Date();
  }

  if (feedback.status === "resolved") {
    feedback.resolvedAt = feedback.resolvedAt || new Date();
  } else {
    feedback.resolvedAt = null;
  }

  await feedback.save();
  return res.json(feedback);
};
