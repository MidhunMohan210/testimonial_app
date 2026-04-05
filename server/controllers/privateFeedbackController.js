import PrivateFeedback from "../models/PrivateFeedback.js";
import { createHttpError } from "../utils/httpError.js";

export const getPrivateFeedback = async (req, res) => {
  const feedback = await PrivateFeedback.find({
    businessId: req.user.businessId,
  }).sort({ createdAt: -1 });

  return res.json(feedback);
};
