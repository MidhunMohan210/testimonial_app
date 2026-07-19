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

  it("supports private feedback filters, sorting, and pagination", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const firstMatch = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Asha",
      rating: 1,
      feedbackText: "billing issue took too long",
      status: "resolved",
      isRead: false,
    });

    await PrivateFeedback.collection.updateOne(
      { _id: firstMatch._id },
      { $set: { createdAt: new Date("2026-07-03T10:00:00.000Z") } },
    );

    const secondMatch = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Meera",
      rating: 3,
      feedbackText: "support team solved this well",
      status: "resolved",
      isRead: false,
    });

    await PrivateFeedback.collection.updateOne(
      { _id: secondMatch._id },
      { $set: { createdAt: new Date("2026-07-04T10:00:00.000Z") } },
    );

    await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Closed",
      rating: 2,
      feedbackText: "closed feedback should not match",
      status: "closed",
      isRead: false,
    });

    const response = await request(app)
      .get("/api/feedback?status=resolved&minWords=4&limit=1&page=1&ratingSort=high_to_low")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        customerName: "Meera",
        rating: 3,
        status: "resolved",
      }),
    );
    expect(response.body.summary).toEqual({
      total: 3,
      new: 0,
      in_progress: 0,
      resolved: 2,
      closed: 1,
    });
  });

  it("returns the unread private feedback count", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    await PrivateFeedback.create([
      {
        businessId: business._id,
        customerName: "Unread One",
        rating: 1,
        feedbackText: "Unread feedback one",
        isRead: false,
      },
      {
        businessId: business._id,
        customerName: "Unread Two",
        rating: 2,
        feedbackText: "Unread feedback two",
        isRead: false,
      },
      {
        businessId: business._id,
        customerName: "Read",
        rating: 3,
        feedbackText: "Already read feedback",
        isRead: true,
      },
    ]);

    const response = await request(app)
      .get("/api/feedback/unread-count")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      unreadCount: 2,
    });
  });

  it("marks all unread private feedback as read for the authenticated business", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();
    const { business: otherBusiness } =
      await createBusinessUserWithBusiness();

    const unreadOne = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Unread One",
      rating: 1,
      feedbackText: "Unread feedback one",
      isRead: false,
    });
    const unreadTwo = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Unread Two",
      rating: 2,
      feedbackText: "Unread feedback two",
      isRead: false,
    });
    await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Already Read",
      rating: 3,
      feedbackText: "Already read feedback",
      isRead: true,
    });
    await PrivateFeedback.create({
      businessId: otherBusiness._id,
      customerName: "Other Business",
      rating: 2,
      feedbackText: "Other business unread feedback",
      isRead: false,
    });

    const response = await request(app)
      .post("/api/feedback/mark-read")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      modifiedCount: 2,
    });

    const updatedFeedback = await PrivateFeedback.find({
      _id: { $in: [unreadOne._id, unreadTwo._id] },
    }).lean();

    expect(updatedFeedback.every((item) => item.isRead === true)).toBe(true);
  });

  it("returns 400 when updating an invalid private feedback id", async () => {
    const { user } =
      await createBusinessUserWithBusiness();

    const response = await request(app)
      .patch("/api/feedback/not-a-valid-id")
      .set(createAuthHeader(user._id))
      .send({
        status: "resolved",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid private feedback id",
    });
  });

  it("clears resolvedAt when feedback moves out of resolved status", async () => {
    const { user, business } =
      await createBusinessUserWithBusiness();

    const feedback = await PrivateFeedback.create({
      businessId: business._id,
      customerName: "Resolved Customer",
      rating: 2,
      feedbackText: "This issue was already resolved",
      status: "resolved",
      businessResponse: "We fixed the issue.",
      respondedAt: new Date("2026-07-01T10:00:00.000Z"),
      resolvedAt: new Date("2026-07-02T10:00:00.000Z"),
    });

    const response = await request(app)
      .patch(`/api/feedback/${feedback._id}`)
      .set(createAuthHeader(user._id))
      .send({
        status: "closed",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: String(feedback._id),
        status: "closed",
      }),
    );
    expect(response.body.respondedAt).toEqual(expect.any(String));
    expect(response.body.resolvedAt).toBeNull();

    const updatedFeedback = await PrivateFeedback.findById(
      feedback._id,
    ).lean();

    expect(updatedFeedback?.resolvedAt).toBeNull();
    expect(updatedFeedback?.respondedAt).not.toBeNull();
  });
});
