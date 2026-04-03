import mongoose from "mongoose";

const whatsAppAccountSchema = new mongoose.Schema(
  {
    waba_id: { type: String, required: true, unique: true },
    phone_number_id: { type: String, required: true },
    business_id: { type: String, required: true, ref: "Business" },
    access_token: { type: String, required: true },
    all_phone_numbers: [
      {
        id: String,
        display_phone_number: String,
        verified_name: String,
      },
    ],

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    connected_at: { type: Date, default: Date.now },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("WhatsAppAccount", whatsAppAccountSchema);
