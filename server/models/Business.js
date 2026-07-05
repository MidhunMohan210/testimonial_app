import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const businessSchema = new mongoose.Schema(
  {
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
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    isBeta: {
      type: Boolean,
      default: true,
    },
    betaExpiresAt: {
      type: Date,
      default: null,
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
      shareFeedback: {
        greetingMessage: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },
    },
    // Legacy fields. Do not use in new code. Use settings.* instead.
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
    testimonialsUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Business = mongoose.model("Business", businessSchema);

export default Business;
