import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const getEmailArg = () => {
  const emailArg = process.argv.find((arg) => arg.startsWith("--email="));
  return emailArg?.slice("--email=".length) || process.env.FIRST_ADMIN_EMAIL || "";
};

const email = getEmailArg().trim().toLowerCase();

if (!email) {
  console.error(
    "Missing admin email. Use: npm run promote:admin -- --email=admin@example.com",
  );
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true },
  ).select("_id name email role");

  if (!user) {
    console.error(`No user found for ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`Promoted ${user.email} to ${user.role}`);
  }
} catch (error) {
  console.error("Failed to promote admin:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
