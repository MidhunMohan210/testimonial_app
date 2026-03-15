import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";

export const getTestimonials = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { businessId: req.user.businessId };

    if (status && ["pending", "approved", "hidden"].includes(status)) {
      query.status = status;
    }

    const testimonials = await Testimonial.find(query).sort({ collectedAt: -1 });

    return res.json(testimonials);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch testimonials", error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "hidden"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid testimonial id" });
    }

    const testimonial = await Testimonial.findOneAndUpdate(
      { _id: id, businessId: req.user.businessId },
      { status },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    return res.json(testimonial);
  } catch (error) {
    return res.status(500).json({ message: "Unable to update testimonial", error: error.message });
  }
};

export const addManualTestimonial = async (req, res) => {
  try {
    const { customerName, customerPhone, rating, testimonialText } = req.body;
    const numericRating = Number(rating);

    if (!customerPhone || !rating || !testimonialText) {
      return res
        .status(400)
        .json({ message: "Customer phone, rating, and testimonial text are required" });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const testimonial = await Testimonial.create({
      businessId: req.user.businessId,
      customerName: customerName?.trim(),
      customerPhone: String(customerPhone).trim(),
      rating: numericRating,
      testimonialText: testimonialText.trim(),
      source: "manual",
      status: "approved",
    });

    return res.status(201).json(testimonial);
  } catch (error) {
    return res.status(500).json({ message: "Unable to add testimonial", error: error.message });
  }
};
