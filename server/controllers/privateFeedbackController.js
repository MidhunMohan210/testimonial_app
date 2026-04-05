import PrivateFeedback from "../models/PrivateFeedback.js";
import { createHttpError } from "../utils/httpError.js";

export const getPrivateFeedback = async (req, res) => {
  try {
    const feedback = await PrivateFeedback.find({
      businessId: req.user.businessId,
    }).sort({ createdAt: -1 });

    return res.json(feedback);
  } catch (error) {
    throw createHttpError(500, "Internal server error");
  }
};
