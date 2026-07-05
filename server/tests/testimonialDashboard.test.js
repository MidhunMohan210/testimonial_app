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

const createAuthHeader = (userId) => ({
  Authorization: `Bearer ${createToken(userId)}`,
});

const createBusinessUserWithBusiness = async ({
  accountStatus = "active",
  businessOverrides = {},
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
    ...businessOverrides,
  });

  user.businessId = business._id;
  await user.save();

  return { user, business };
};

describe("Testimonial dashboard routes", () => {
  it("supports testimonial filters, sorting, and pagination", async () => {
    const { user, business } = await createBusinessUserWithBusiness();
    const { business: otherBusiness } = await createBusinessUserWithBusiness();

    await Testimonial.create([
      {
        businessId: business._id,
        customerName: "One",
        rating: 2,
        testimonialText: "short approved words",
        status: "approved",
        source: "manual",
        collectedAt: new Date("2026-07-03T10:00:00.000Z"),
      },
      {
        businessId: business._id,
        customerName: "Two",
        rating: 5,
        testimonialText: "another approved testimonial here",
        status: "approved",
        source: "link",
        collectedAt: new Date("2026-07-04T10:00:00.000Z"),
      },
      {
        businessId: business._id,
        customerName: "Hidden",
        rating: 4,
        testimonialText: "hidden testimonial example",
        status: "hidden",
        source: "link",
      },
      {
        businessId: otherBusiness._id,
        customerName: "Other",
        rating: 5,
        testimonialText: "other business approved testimonial",
        status: "approved",
        source: "link",
      },
    ]);

    const response = await request(app)
      .get(
        "/api/testimonials?status=approved&minWords=3&limit=1&page=2&ratingSort=low_to_high",
      )
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        customerName: "Two",
        rating: 5,
        status: "approved",
      }),
    );
    expect(response.body.summary).toEqual({
      total: 2,
      approved: 2,
      pending: 0,
      hidden: 1,
    });
  });

  it("returns the unread testimonial count excluding deleted and already read entries", async () => {
    const { user, business } = await createBusinessUserWithBusiness();

    const deletedTestimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Deleted",
      rating: 5,
      testimonialText: "Deleted testimonial",
      status: "approved",
      source: "link",
      isRead: false,
    });

    await Testimonial.create([
      {
        businessId: business._id,
        customerName: "Unread 1",
        rating: 4,
        testimonialText: "Unread testimonial one",
        status: "approved",
        source: "link",
        isRead: false,
      },
      {
        businessId: business._id,
        customerName: "Unread 2",
        rating: 5,
        testimonialText: "Unread testimonial two",
        status: "pending",
        source: "link",
        isRead: false,
      },
      {
        businessId: business._id,
        customerName: "Read",
        rating: 3,
        testimonialText: "Already read testimonial",
        status: "hidden",
        source: "manual",
        isRead: true,
      },
    ]);

    await Testimonial.findByIdAndUpdate(deletedTestimonial._id, {
      status: "deleted",
    });

    const response = await request(app)
      .get("/api/testimonials/unread-count")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      unreadCount: 2,
    });
  });

  it("marks all unread testimonials as read for the authenticated business", async () => {
    const { user, business } = await createBusinessUserWithBusiness();
    const { business: otherBusiness } = await createBusinessUserWithBusiness();

    const unreadOne = await Testimonial.create({
      businessId: business._id,
      customerName: "Unread One",
      rating: 5,
      testimonialText: "Unread one",
      status: "approved",
      source: "link",
      isRead: false,
    });
    const unreadTwo = await Testimonial.create({
      businessId: business._id,
      customerName: "Unread Two",
      rating: 4,
      testimonialText: "Unread two",
      status: "pending",
      source: "link",
      isRead: false,
    });
    await Testimonial.create({
      businessId: business._id,
      customerName: "Already Read",
      rating: 3,
      testimonialText: "Already read",
      status: "hidden",
      source: "manual",
      isRead: true,
    });
    await Testimonial.create({
      businessId: otherBusiness._id,
      customerName: "Other Business",
      rating: 5,
      testimonialText: "Other business unread",
      status: "approved",
      source: "link",
      isRead: false,
    });

    const response = await request(app)
      .post("/api/testimonials/mark-read")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      modifiedCount: 2,
    });

    const updatedTestimonials = await Testimonial.find({
      _id: { $in: [unreadOne._id, unreadTwo._id] },
    }).lean();

    expect(updatedTestimonials.every((item) => item.isRead === true)).toBe(true);
  });

  it("creates an approved manual testimonial and updates the public version timestamp", async () => {
    const { user, business } = await createBusinessUserWithBusiness({
      businessOverrides: {
        testimonialsUpdatedAt: null,
      },
    });

    const response = await request(app)
      .post("/api/testimonials/manual")
      .set(createAuthHeader(user._id))
      .send({
        customerName: "Rahul",
        rating: 5,
        testimonialText: "Excellent staff and support",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        businessId: String(business._id),
        customerName: "Rahul",
        rating: 5,
        testimonialText: "Excellent staff and support",
        source: "manual",
        status: "approved",
      }),
    );

    const updatedBusiness = await Business.findById(business._id).lean();

    expect(updatedBusiness?.testimonialsUpdatedAt).not.toBeNull();
  });

  it("soft deletes a testimonial and updates the public version timestamp", async () => {
    const { user, business } = await createBusinessUserWithBusiness({
      businessOverrides: {
        testimonialsUpdatedAt: null,
      },
    });

    const testimonial = await Testimonial.create({
      businessId: business._id,
      customerName: "Rahul",
      rating: 5,
      testimonialText: "Excellent staff and support",
      status: "approved",
      source: "link",
    });

    const response = await request(app)
      .delete(`/api/testimonials/${testimonial._id}`)
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Testimonial deleted",
      testimonial: expect.objectContaining({
        _id: String(testimonial._id),
        status: "deleted",
      }),
    });

    const deletedTestimonial = await Testimonial.findById(testimonial._id).lean();
    const updatedBusiness = await Business.findById(business._id).lean();

    expect(deletedTestimonial?.status).toBe("deleted");
    expect(updatedBusiness?.testimonialsUpdatedAt).not.toBeNull();
  });
});
