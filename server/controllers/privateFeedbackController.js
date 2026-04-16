import mongoose from "mongoose";
import PrivateFeedback from "../models/PrivateFeedback.js";
import { createHttpError } from "../utils/httpError.js";

export const getPrivateFeedback = async (req, res) => {
  const feedback = await PrivateFeedback.find({
    businessId: req.user.businessId,
  }).sort({ createdAt: -1 });

  return res.json(feedback);
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
