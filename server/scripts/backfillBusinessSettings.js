import dotenv from "dotenv";
import mongoose from "mongoose";
import Business from "../models/Business.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const result = await Business.updateMany(
  { settings: { $exists: false } },
  {
    $set: {
      settings: {
        googleReviewLink: "",
        isPublicEnabled: true,
        notificationsEnabled: true,
      },
    },
  },
);

console.log("Business settings backfill complete", {
  matchedCount: result.matchedCount,
  modifiedCount: result.modifiedCount,
});

await mongoose.disconnect();
