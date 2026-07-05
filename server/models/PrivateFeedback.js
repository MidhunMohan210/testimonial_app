import mongoose from "mongoose";

const privateFeedbackSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 3,
      required: true,
    },
    feedbackText: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    allowFollowUp: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new",
    },
    businessResponse: {
      type: String,
      trim: true,
      default: "",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const PrivateFeedback = mongoose.model("PrivateFeedback", privateFeedbackSchema);

export default PrivateFeedback;
