import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerPhone: {
    type: String,
    // required: true,
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  testimonialText: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "hidden"],
    default: "pending",
  },
  source: {
    type: String,
    enum: ["whatsapp", "manual", "link"],
    default: "whatsapp",
  },
  messageId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  ip: {
    type: String,
    trim: true,
  },
  collectedAt: {
    type: Date,
    default: Date.now,
  },
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
