import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import PrivateFeedback from "../models/PrivateFeedback.js";
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

describe("Private feedback dashboard", () => {
  it("retrieves private feedback owned by the authenticated business", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const feedback = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Rahul",
      rating: 2,
      feedbackText: "The service was delayed",
      contactEmail: "rahul@example.com",
      allowFollowUp: true,
      status: "new",
    });

    const response = await request(app)
      .get("/api/feedback")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          _id: String(feedback._id),
          businessId: String(business._id),
          customerName: "Rahul",
          rating: 2,
          feedbackText: "The service was delayed",
          contactEmail: "rahul@example.com",
          allowFollowUp: true,
          status: "new",
          businessResponse: "",
          isRead: false,
        }),
      ],
      page: 1,
      limit: 20,
      total: 1,
      summary: {
        total: 1,
        new: 1,
        in_progress: 0,
        resolved: 0,
        closed: 0,
      },
    });
  });

  it("only lists private feedback belonging to the authenticated business", async () => {
    const { user: businessAUser, business: businessA } =
      await createBusinessUserWithBusiness();
    const { business: businessB } =
      await createBusinessUserWithBusiness();

    const businessAFeedback = await PrivateFeedback.create({
      businessId: businessA._id,
      customerName: "Anjali",
      rating: 1,
      feedbackText: "The support response was too slow",
      status: "new",
    });

    const businessBFeedback = await PrivateFeedback.create({
      businessId: businessB._id,
      customerName: "Meera",
      rating: 3,
      feedbackText: "Billing issue was frustrating",
      status: "resolved",
    });

    const response = await request(app)
      .get("/api/feedback")
      .set(createAuthHeader(businessAUser._id));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(
      response.body.data.map((item) => item._id),
    ).toContain(String(businessAFeedback._id));
    expect(
      response.body.data.map((item) => item._id),
    ).not.toContain(String(businessBFeedback._id));
    expect(response.body.total).toBe(1);
    expect(response.body.summary).toEqual({
      total: 1,
      new: 1,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    });
  });

  it("updates private feedback owned by the authenticated business", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const feedback = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Priya",
      rating: 2,
      feedbackText: "We had trouble reaching support",
      status: "new",
    });

    const response = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set(createAuthHeader(user._id))
      .send({
        status: "resolved",
        businessResponse: "We followed up and fixed the issue.",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: String(feedback._id),
        businessId: String(business._id),
        status: "resolved",
        businessResponse: "We followed up and fixed the issue.",
      }),
    );
    expect(response.body.respondedAt).toEqual(expect.any(String));
    expect(response.body.resolvedAt).toEqual(expect.any(String));

    const updatedFeedback = await PrivateFeedback.findById(
      feedback._id,
    ).lean();

    expect(updatedFeedback?.status).toBe("resolved");
    expect(updatedFeedback?.businessResponse).toBe(
      "We followed up and fixed the issue.",
    );
    expect(updatedFeedback?.respondedAt).not.toBeNull();
    expect(updatedFeedback?.resolvedAt).not.toBeNull();
  });

  it("does not allow one business to update another business's private feedback", async () => {
    const { user: businessAUser } =
      await createBusinessUserWithBusiness();
    const { business: businessB } =
      await createBusinessUserWithBusiness();

    const feedback = await PrivateFeedback.create({
      businessId: businessB._id,
      customerName: "Kiran",
      rating: 1,
      feedbackText: "The issue is still unresolved",
      status: "new",
    });

    const response = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set(createAuthHeader(businessAUser._id))
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Private feedback not found",
    });

    const unchangedFeedback = await PrivateFeedback.findById(
      feedback._id,
    ).lean();

    expect(unchangedFeedback?.status).toBe("new");
    expect(unchangedFeedback?.businessResponse).toBe("");
    expect(unchangedFeedback?.respondedAt).toBeNull();
    expect(unchangedFeedback?.resolvedAt).toBeNull();
  });

  it("returns 404 when updating a valid but nonexistent private feedback id", async () => {
    const { user } =
      await createBusinessUserWithBusiness();
    const unknownFeedbackId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/feedback/${unknownFeedbackId}`)
      .set(createAuthHeader(user._id))
      .send({
        status: "in_progress",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Private feedback not found",
    });
  });

  it("never returns private feedback through the protected testimonial listing", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Rahul",
      rating: 2,
      feedbackText: "This should remain private",
      status: "new",
    });

    const response = await request(app)
      .get("/api/testimonials")
      .set(createAuthHeader(user._id));

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
