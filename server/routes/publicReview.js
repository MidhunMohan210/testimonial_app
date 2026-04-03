import express from "express";
import Business from "../models/Business.js";
import PrivateFeedback from "../models/PrivateFeedback.js";
import Testimonial from "../models/Testimonial.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug }).select(
      "businessName googleReviewLink"
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.json({
      businessName: business.businessName,
      googleReviewLink: business.googleReviewLink || "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:slug/submit", async (req, res) => {
  try {
    const { customerName, rating, reviewText } = req.body;
    const numericRating = Number(rating);

    if (![4, 5].includes(numericRating)) {
      return res.status(400).json({ message: "Rating must be 4 or 5" });
    }

    if (!reviewText?.trim()) {
      return res.status(400).json({ message: "Review text is required" });
    }

    const business = await Business.findOne({ slug: req.params.slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await Testimonial.create({
      businessId: business._id,
      customerName: customerName?.trim(),
      customerPhone: `link-${Date.now()}`,
      rating: numericRating,
      testimonialText: reviewText.trim(),
      status: "pending",
      source: "link",
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:slug/feedback", async (req, res) => {
  try {
    const { customerName, rating, feedbackText } = req.body;
    const numericRating = Number(rating);

    if (![1, 2, 3].includes(numericRating)) {
      return res.status(400).json({ message: "Rating must be 1, 2, or 3" });
    }

    if (!feedbackText?.trim()) {
      return res.status(400).json({ message: "Feedback text is required" });
    }

    const business = await Business.findOne({ slug: req.params.slug });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await PrivateFeedback.create({
      businessId: business._id,
      customerName: customerName?.trim(),
      rating: numericRating,
      feedbackText: feedbackText.trim(),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
