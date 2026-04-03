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
