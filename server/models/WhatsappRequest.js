import mongoose from "mongoose";

const whatsappRequestSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "replied", "failed"],
      default: "sent",
    },
    step: {
      type: Number,
      default: 1,
    },
    tempRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const WhatsappRequest = mongoose.model("WhatsappRequest", whatsappRequestSchema);

export default WhatsappRequest;
