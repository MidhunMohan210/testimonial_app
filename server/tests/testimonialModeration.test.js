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

const createAuthHeader = (userId) => ({
  Authorization: `Bearer ${createToken(userId)}`,
});

describe("Testimonial moderation", () => {
  it("approves a pending testimonial owned by the authenticated business", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const testimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Rahul",
      rating: 5,
      testimonialText: "Excellent service",
      status: "pending",
      source: "link",
    });

    const response = await request(app)
      .patch(`/api/testimonials/${testimonial._id}/status`)
      .set(createAuthHeader(user._id))
      .send({
        status: "approved",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
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
    );

    const updatedTestimonial = await Testimonial.findById(
      testimonial._id,
    ).lean();

    expect(updatedTestimonial?.status).toBe("approved");
  });

  it("hides a testimonial owned by the authenticated business", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const testimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Anjali",
      rating: 4,
      testimonialText: "Very good service",
      status: "approved",
      source: "link",
    });

    const response = await request(app)
      .patch(`/api/testimonials/${testimonial._id}/status`)
      .set(createAuthHeader(user._id))
      .send({
        status: "hidden",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: String(testimonial._id),
        businessId: String(business._id),
        status: "hidden",
      }),
    );

    const updatedTestimonial = await Testimonial.findById(
      testimonial._id,
    ).lean();

    expect(updatedTestimonial?.status).toBe("hidden");
  });

  it("does not allow one business to moderate another business's testimonial", async () => {
    const { user: businessAUser } =
      await createBusinessUserWithBusiness();
    const { business: businessB } =
      await createBusinessUserWithBusiness();

    const testimonial = await Testimonial.create({
      businessId: businessB._id,
      customerName: "Priya",
      rating: 5,
      testimonialText: "Outstanding support",
      status: "pending",
      source: "link",
    });

    const response = await request(app)
      .patch(`/api/testimonials/${testimonial._id}/status`)
      .set(createAuthHeader(businessAUser._id))
      .send({
        status: "approved",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Testimonial not found",
    });

    const unchangedTestimonial = await Testimonial.findById(
      testimonial._id,
    ).lean();

    expect(unchangedTestimonial?.status).toBe("pending");
  });

  it("rejects an unsupported moderation status without changing the testimonial", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const testimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Meera",
      rating: 5,
      testimonialText: "Loved the experience",
      status: "pending",
      source: "link",
    });

    const response = await request(app)
      .patch(`/api/testimonials/${testimonial._id}/status`)
      .set(createAuthHeader(user._id))
      .send({
        status: "invalid",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid status value",
    });

    const unchangedTestimonial = await Testimonial.findById(
      testimonial._id,
    ).lean();

    expect(unchangedTestimonial?.status).toBe("pending");
  });

  it("returns 404 when moderating a valid but nonexistent testimonial id", async () => {
    const { user } =
      await createBusinessUserWithBusiness();
    const unknownTestimonialId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/testimonials/${unknownTestimonialId}/status`)
      .set(createAuthHeader(user._id))
      .send({
        status: "approved",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Testimonial not found",
    });
  });
});
