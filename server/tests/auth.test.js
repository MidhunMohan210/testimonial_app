import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

const createToken = (userId) =>
  jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET);

const createBusinessUserWithBusiness = async ({
  accountStatus = "active",
} = {}) => {
  const user = await User.create({
    name: "Business Owner",
    email: `owner-${new mongoose.Types.ObjectId()}@example.com`,
    password: "hashed-password",
    role: "business",
  });

  const business = await Business.create({
    userId: user._id,
    businessName: `Test Business ${new mongoose.Types.ObjectId()}`,
    slug: `test-business-${new mongoose.Types.ObjectId()}`,
    accountStatus,
  });

  user.businessId = business._id;
  await user.save();

  return { user, business };
};

describe("Authentication protection", () => {
  it("rejects a request when no token is provided", async () => {
    const response = await request(app)
      .get("/api/testimonials");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Unauthorized",
    });
  });

  it("rejects a request when the token is invalid", async () => {
    const response = await request(app)
      .get("/api/testimonials")
      .set(
        "Authorization",
        "Bearer this-is-not-a-valid-token"
      );

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Invalid or expired token",
    });
  });

  it("allows an active business user to access testimonials", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();
    const { business: secondBusiness } =
      await createBusinessUserWithBusiness();

    const testimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Rahul",
      rating: 5,
      testimonialText: "Excellent service",
      status: "approved",
      source: "link",
    });

    const secondBusinessTestimonial =
      await Testimonial.create({
        businessId: secondBusiness._id,
        customerName: "Anjali",
        rating: 4,
        testimonialText: "Very good service",
        status: "approved",
        source: "link",
      });

    const response = await request(app)
      .get("/api/testimonials")
      .set(
        "Authorization",
        `Bearer ${createToken(user._id)}`
      );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(
      response.body.data.map((item) => item._id)
    ).not.toContain(String(secondBusinessTestimonial._id));
    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          _id: String(testimonial._id),
          businessId: String(business._id),
          customerName: "Rahul",
          rating: 5,
          testimonialText: "Excellent service",
          status: "approved",
          source: "link",
          isRead: false,
        }),
      ],
      page: 1,
      limit: 20,
      total: 1,
      summary: {
        total: 1,
        approved: 1,
        pending: 0,
        hidden: 0,
      },
    });
  });

  it("blocks a suspended business user from accessing testimonials", async () => {
    const { user } =
      await createBusinessUserWithBusiness({
        accountStatus: "suspended",
      });

    const response = await request(app)
      .get("/api/testimonials")
      .set(
        "Authorization",
        `Bearer ${createToken(user._id)}`
      );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      code: "ACCOUNT_SUSPENDED",
      message:
        "Your Woice account has been suspended. Please contact Woice support for assistance.",
    });
  });

  it("does not block an admin user without a business from testimonials", async () => {
    const user = await User.create({
      name: "Admin User",
      email: `admin-${new mongoose.Types.ObjectId()}@example.com`,
      password: "hashed-password",
      role: "admin",
    });

    const response = await request(app)
      .get("/api/testimonials")
      .set(
        "Authorization",
        `Bearer ${createToken(user._id)}`
      );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      summary: {
        total: 0,
        approved: 0,
        pending: 0,
        hidden: 0,
      },
    });
  });
});
