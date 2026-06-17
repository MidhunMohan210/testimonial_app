import mongoose from "mongoose";
import Business from "../models/Business.js";
import PrivateFeedback from "../models/PrivateFeedback.js";
import Testimonial from "../models/Testimonial.js";
import { createHttpError } from "../utils/httpError.js";

const MAX_LIMIT = 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 20, 1),
    MAX_LIMIT,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const getSort = (query) => {
  const sortMap = {
    businessName: "businessName",
    ownerName: "owner.name",
    registeredDate: "createdAt",
    accountStatus: "accountStatus",
    accountType: "isBeta",
    totalTestimonials: "usage.totalTestimonials",
    privateFeedbackCount: "usage.privateFeedbackCount",
    lastActivity: "lastActivity",
  };
  const sortBy = sortMap[query.sortBy] || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return {
    [sortBy]: sortOrder,
    _id: -1,
  };
};

const getStatsStages = () => [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "owner",
    },
  },
  {
    $unwind: {
      path: "$owner",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "testimonials",
      let: { businessId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$businessId", "$$businessId"] },
            status: { $ne: "deleted" },
          },
        },
        {
          $group: {
            _id: null,
            totalTestimonials: { $sum: 1 },
            approvedTestimonials: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pendingTestimonials: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            hiddenTestimonials: {
              $sum: { $cond: [{ $eq: ["$status", "hidden"] }, 1, 0] },
            },
            lastTestimonialAt: { $max: "$collectedAt" },
          },
        },
      ],
      as: "testimonialStats",
    },
  },
  {
    $lookup: {
      from: "privatefeedbacks",
      let: { businessId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$businessId", "$$businessId"] },
          },
        },
        {
          $group: {
            _id: null,
            privateFeedbackCount: { $sum: 1 },
            lastPrivateFeedbackAt: { $max: "$createdAt" },
          },
        },
      ],
      as: "privateFeedbackStats",
    },
  },
  {
    $addFields: {
      testimonialStats: {
        $ifNull: [{ $first: "$testimonialStats" }, {}],
      },
      privateFeedbackStats: {
        $ifNull: [{ $first: "$privateFeedbackStats" }, {}],
      },
    },
  },
  {
    $addFields: {
      accountStatus: { $ifNull: ["$accountStatus", "active"] },
      isBeta: { $ifNull: ["$isBeta", true] },
      usage: {
        totalTestimonials: {
          $ifNull: ["$testimonialStats.totalTestimonials", 0],
        },
        approvedTestimonials: {
          $ifNull: ["$testimonialStats.approvedTestimonials", 0],
        },
        pendingTestimonials: {
          $ifNull: ["$testimonialStats.pendingTestimonials", 0],
        },
        hiddenTestimonials: {
          $ifNull: ["$testimonialStats.hiddenTestimonials", 0],
        },
        privateFeedbackCount: {
          $ifNull: ["$privateFeedbackStats.privateFeedbackCount", 0],
        },
        lastTestimonialAt: "$testimonialStats.lastTestimonialAt",
        lastPrivateFeedbackAt: "$privateFeedbackStats.lastPrivateFeedbackAt",
      },
      lastActivity: {
        $max: [
          "$createdAt",
          { $ifNull: ["$testimonialsUpdatedAt", "$createdAt"] },
          { $ifNull: ["$testimonialStats.lastTestimonialAt", "$createdAt"] },
          { $ifNull: ["$privateFeedbackStats.lastPrivateFeedbackAt", "$createdAt"] },
        ],
      },
    },
  },
];

const getBusinessProjection = () => ({
  _id: 1,
  businessName: 1,
  slug: 1,
  createdAt: 1,
  accountStatus: { $ifNull: ["$accountStatus", "active"] },
  isBeta: { $ifNull: ["$isBeta", true] },
  betaExpiresAt: 1,
  lastActivity: 1,
  googleReviewEnabled: { $ifNull: ["$settings.googleReviewEnabled", false] },
  isPublicEnabled: { $ifNull: ["$settings.isPublicEnabled", true] },
  owner: {
    _id: "$owner._id",
    name: "$owner.name",
    email: "$owner.email",
    mobile: "$owner.mobile",
  },
  usage: 1,
});

const getBusinessListPipeline = (query) => {
  const pipeline = [...getStatsStages()];
  const match = {};

  if (query.status && ["active", "suspended"].includes(query.status)) {
    match.accountStatus = query.status;
  }

  if (query.accountType === "beta") {
    match.isBeta = true;
  } else if (query.accountType === "free") {
    match.isBeta = false;
  }

  const search = String(query.search || "").trim();
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    match.$or = [
      { businessName: regex },
      { "owner.name": regex },
      { "owner.email": regex },
      { "owner.mobile": regex },
    ];
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  return pipeline;
};

export const getAdminOverview = async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalBusinesses,
    activeBusinesses,
    suspendedBusinesses,
    betaBusinesses,
    businessesRegisteredThisMonth,
    testimonialSummary,
    totalPrivateFeedback,
    recentBusinesses,
  ] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ accountStatus: { $ne: "suspended" } }),
    Business.countDocuments({ accountStatus: "suspended" }),
    Business.countDocuments({
      $or: [{ isBeta: true }, { isBeta: { $exists: false } }],
    }),
    Business.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } }),
    Testimonial.aggregate([
      { $match: { status: { $ne: "deleted" } } },
      {
        $group: {
          _id: null,
          totalTestimonials: { $sum: 1 },
          approvedTestimonials: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pendingTestimonials: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]),
    PrivateFeedback.countDocuments(),
    Business.aggregate([
      ...getStatsStages(),
      { $sort: { createdAt: -1, _id: -1 } },
      { $limit: 6 },
      { $project: getBusinessProjection() },
    ]),
  ]);

  const testimonialTotals = testimonialSummary[0] || {};

  return res.json({
    summary: {
      totalBusinesses,
      activeBusinesses,
      suspendedBusinesses,
      betaBusinesses,
      businessesRegisteredThisMonth,
      totalTestimonials: testimonialTotals.totalTestimonials || 0,
      approvedTestimonials: testimonialTotals.approvedTestimonials || 0,
      pendingTestimonials: testimonialTotals.pendingTestimonials || 0,
      totalPrivateFeedback,
    },
    recentBusinesses,
  });
};

export const getAdminBusinesses = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const pipeline = getBusinessListPipeline(req.query);
  const sort = getSort(req.query);

  const result = await Business.aggregate([
    ...pipeline,
    {
      $facet: {
        businesses: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          { $project: getBusinessProjection() },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const businesses = result[0]?.businesses || [];
  const total = result[0]?.total[0]?.count || 0;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return res.json({
    businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};

export const getAdminBusinessById = async (req, res) => {
  const { businessId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw createHttpError(400, "Invalid business id");
  }

  const businesses = await Business.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(businessId) } },
    ...getStatsStages(),
    { $project: getBusinessProjection() },
  ]);

  const business = businesses[0];

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json({ business });
};

export const updateAdminBusinessStatus = async (req, res) => {
  const { businessId } = req.params;
  const { accountStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw createHttpError(400, "Invalid business id");
  }

  if (!["active", "suspended"].includes(accountStatus)) {
    throw createHttpError(400, "Invalid account status");
  }

  const business = await Business.findByIdAndUpdate(
    businessId,
    { $set: { accountStatus } },
    { new: true },
  )
    .select("_id accountStatus")
    .lean();

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json({
    businessId: business._id,
    accountStatus: business.accountStatus || "active",
  });
};

export const updateAdminBusinessBeta = async (req, res) => {
  const { businessId } = req.params;
  const { isBeta, betaExpiresAt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw createHttpError(400, "Invalid business id");
  }

  if (typeof isBeta !== "boolean") {
    throw createHttpError(400, "isBeta must be a boolean");
  }

  let nextBetaExpiresAt = null;

  if (betaExpiresAt !== null && betaExpiresAt !== undefined && betaExpiresAt !== "") {
    if (typeof betaExpiresAt !== "string") {
      throw createHttpError(400, "betaExpiresAt must be a date string or null");
    }

    nextBetaExpiresAt = new Date(betaExpiresAt);

    if (Number.isNaN(nextBetaExpiresAt.getTime())) {
      throw createHttpError(400, "Invalid beta expiry date");
    }
  }

  const business = await Business.findByIdAndUpdate(
    businessId,
    {
      $set: {
        isBeta,
        betaExpiresAt: nextBetaExpiresAt,
      },
    },
    { new: true },
  )
    .select("_id isBeta betaExpiresAt")
    .lean();

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  return res.json({
    businessId: business._id,
    isBeta: business.isBeta ?? true,
    betaExpiresAt: business.betaExpiresAt || null,
  });
};
