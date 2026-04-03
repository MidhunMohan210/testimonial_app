import express from "express";
import PrivateFeedback from "../models/PrivateFeedback.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const feedback = await PrivateFeedback.find({
      businessId: req.user.businessId,
    }).sort({ createdAt: -1 });

    return res.json(feedback);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
