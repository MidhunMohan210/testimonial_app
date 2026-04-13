import PrivateFeedback from "../models/PrivateFeedback.js";

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
