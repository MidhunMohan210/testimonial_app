import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappPhoneNumberId: {
    type: String,
    trim: true,
  },
  whatsappBusinessAccountId: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  settings: {
    googleReviewLink: {
      type: String,
      default: "",
      trim: true,
    },
    googleReviewEnabled: {
      type: Boolean,
      default: false,
    },
    isPublicEnabled: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  // Kept temporarily for backward compatibility with older documents.
  googleReviewLink: {
    type: String,
    default: "",
    trim: true,
  },
  googleReviewEnabled: {
    type: Boolean,
    default: false,
  },
  isPublicEnabled: {
    type: Boolean,
    default: true,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  apiKey: {
    type: String,
    default: uuidv4,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Business = mongoose.model("Business", businessSchema);

export default Business;
