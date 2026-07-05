import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import User from "../models/User.js";

const createToken = (userId) =>
  jwt.sign({ userId: String(userId) }, process.env.JWT_SECRET);

const createAuthHeader = (userId) => ({
  Authorization: `Bearer ${createToken(userId)}`,
});

const createBusinessUserWithBusiness = async ({
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
    businessName: "Test Business",
    slug: `test-business-${new mongoose.Types.ObjectId()}`,
    ...businessOverrides,
  });

  user.businessId = business._id;
  await user.save();

  return { user, business };
};

describe("Business settings routes", () => {
  it("returns the authenticated business settings with defaults", async () => {
    const { user, business } = await createBusinessUserWithBusiness();

    const response = await request(app)
      .get("/api/business/settings")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: business.businessName,
      slug: business.slug,
      googleReviewLink: "",
      googleReviewEnabled: false,
      isPublicEnabled: true,
      notificationsEnabled: true,
      settings: {
        googleReviewLink: "",
        googleReviewEnabled: false,
        isPublicEnabled: true,
        notificationsEnabled: true,
        shareFeedback: {},
      },
    });
  });

  it("updates business settings and persists the new values", async () => {
    const { user, business } = await createBusinessUserWithBusiness();

    const response = await request(app)
      .put("/api/business/settings")
      .set(createAuthHeader(user._id))
      .send({
        name: "Updated Business",
        googleReviewLink: "https://reviews.example.com/test-business",
        googleReviewEnabled: true,
        isPublicEnabled: false,
        notificationsEnabled: false,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: "Updated Business",
      slug: business.slug,
      googleReviewLink: "https://reviews.example.com/test-business",
      googleReviewEnabled: true,
      isPublicEnabled: false,
      notificationsEnabled: false,
      settings: {
        googleReviewLink: "https://reviews.example.com/test-business",
        googleReviewEnabled: true,
        isPublicEnabled: false,
        notificationsEnabled: false,
        shareFeedback: {},
      },
    });

    const updatedBusiness = await Business.findById(business._id).lean();

    expect(updatedBusiness?.businessName).toBe("Updated Business");
    expect(updatedBusiness?.settings?.googleReviewLink).toBe(
      "https://reviews.example.com/test-business",
    );
    expect(updatedBusiness?.settings?.googleReviewEnabled).toBe(true);
    expect(updatedBusiness?.settings?.isPublicEnabled).toBe(false);
    expect(updatedBusiness?.settings?.notificationsEnabled).toBe(false);
  });

  it("rejects an invalid Google review link", async () => {
    const { user } = await createBusinessUserWithBusiness();

    const response = await request(app)
      .put("/api/business/settings")
      .set(createAuthHeader(user._id))
      .send({
        name: "Updated Business",
        googleReviewLink: "not-a-valid-url",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Google review link must be a valid URL",
    });
  });

  it("returns the authenticated business profile", async () => {
    const { user, business } = await createBusinessUserWithBusiness({
      businessOverrides: {
        settings: {
          googleReviewLink: "https://reviews.example.com/original",
          googleReviewEnabled: true,
          isPublicEnabled: false,
          notificationsEnabled: false,
        },
      },
    });

    const response = await request(app)
      .get("/api/business/me")
      .set(createAuthHeader(user._id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: String(business._id),
        businessName: "Test Business",
        slug: business.slug,
        accountStatus: "active",
        isBeta: true,
        googleReviewLink: "https://reviews.example.com/original",
        googleReviewEnabled: true,
        isPublicEnabled: false,
        notificationsEnabled: false,
      }),
    );
  });

  it("normalizes slug and trims google review link when updating the business profile", async () => {
    const { user, business } = await createBusinessUserWithBusiness();

    const response = await request(app)
      .patch("/api/business/me")
      .set(createAuthHeader(user._id))
      .send({
        slug: "  My Fancy Business!!  ",
        googleReviewLink: "  https://reviews.example.com/fancy  ",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: String(business._id),
        slug: "my-fancy-business",
        googleReviewLink: "https://reviews.example.com/fancy",
      }),
    );

    const updatedBusiness = await Business.findById(business._id).lean();

    expect(updatedBusiness?.slug).toBe("my-fancy-business");
    expect(updatedBusiness?.settings?.googleReviewLink).toBe(
      "https://reviews.example.com/fancy",
    );
  });

  it("rejects an update when the normalized slug is already in use", async () => {
    const { user } = await createBusinessUserWithBusiness();

    await createBusinessUserWithBusiness({
      businessOverrides: {
        slug: "existing-business",
      },
    });

    const response = await request(app)
      .patch("/api/business/me")
      .set(createAuthHeader(user._id))
      .send({
        slug: "Existing Business",
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "Slug is already in use",
    });
  });

  it("saves and resets the share-feedback greeting message", async () => {
    const { user, business } = await createBusinessUserWithBusiness();

    const saveResponse = await request(app)
      .patch("/api/business/settings/share-feedback")
      .set(createAuthHeader(user._id))
      .send({
        greetingMessage: "  Thanks for sharing your feedback with us!  ",
      });

    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body).toEqual(
      expect.objectContaining({
        message: "Greeting message saved successfully",
        business: expect.objectContaining({
          _id: String(business._id),
        }),
        settings: expect.objectContaining({
          settings: {
            googleReviewLink: "",
            googleReviewEnabled: false,
            isPublicEnabled: true,
            notificationsEnabled: true,
            shareFeedback: {
              greetingMessage: "Thanks for sharing your feedback with us!",
            },
          },
        }),
      }),
    );

    const resetResponse = await request(app)
      .patch("/api/business/settings/share-feedback")
      .set(createAuthHeader(user._id))
      .send({
        greetingMessage: "   ",
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body).toEqual(
      expect.objectContaining({
        message: "Greeting message reset to default",
        settings: expect.objectContaining({
          settings: {
            googleReviewLink: "",
            googleReviewEnabled: false,
            isPublicEnabled: true,
            notificationsEnabled: true,
            shareFeedback: {},
          },
        }),
      }),
    );
  });
});
