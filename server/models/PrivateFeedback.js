import mongoose from "mongoose";

const privateFeedbackSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PrivateFeedback = mongoose.model("PrivateFeedback", privateFeedbackSchema);

export default PrivateFeedback;
