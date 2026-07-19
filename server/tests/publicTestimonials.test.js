import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";

describe("Public testimonials routes", () => {
  it("returns only approved testimonials for the requested business with aggregate stats", async () => {
    const business = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Public Business",
      slug: "public-business",
    });
    const otherBusiness = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Other Business",
      slug: "other-business",
    });

    await Testimonial.create([
      {
        businessId: business._id,
        customerName: "Rahul",
        rating: 5,
        testimonialText: "Excellent service and care",
        status: "approved",
        source: "link",
        collectedAt: new Date("2026-07-03T10:00:00.000Z"),
      },
      {
        businessId: business._id,
        customerName: "Anjali",
        rating: 4,
        testimonialText: "Very helpful and friendly",
        status: "approved",
        source: "link",
        collectedAt: new Date("2026-07-04T10:00:00.000Z"),
      },
      {
        businessId: business._id,
        customerName: "Hidden User",
        rating: 5,
        testimonialText: "This should not be public",
        status: "hidden",
        source: "link",
      },
      {
        businessId: otherBusiness._id,
        customerName: "Other Customer",
        rating: 5,
        testimonialText: "Other business review",
        status: "approved",
        source: "link",
      },
    ]);

    const response = await request(app).get("/api/p/public-business");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      businessName: "Public Business",
      slug: "public-business",
      averageRating: 4.5,
      totalCount: 2,
      testimonials: [
        expect.objectContaining({
          customerName: "Anjali",
          rating: 4,
          testimonialText: "Very helpful and friendly",
        }),
        expect.objectContaining({
          customerName: "Rahul",
          rating: 5,
          testimonialText: "Excellent service and care",
        }),
      ],
    });
  });

  it("applies the limit query while keeping the full approved total count", async () => {
    const business = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Public Business",
      slug: "public-business",
    });

    await Testimonial.create([
      {
        businessId: business._id,
        customerName: "First",
        rating: 5,
        testimonialText: "Excellent service and support",
        status: "approved",
        source: "link",
        collectedAt: new Date("2026-07-01T10:00:00.000Z"),
      },
      {
        businessId: business._id,
        customerName: "Second",
        rating: 4,
        testimonialText: "Great staff and response",
        status: "approved",
        source: "link",
        collectedAt: new Date("2026-07-02T10:00:00.000Z"),
      },
    ]);

    const response = await request(app).get("/api/p/public-business?limit=1");

    expect(response.status).toBe(200);
    expect(response.body.totalCount).toBe(2);
    expect(response.body.testimonials).toHaveLength(1);
    expect(response.body.testimonials[0]).toEqual(
      expect.objectContaining({
        customerName: "Second",
      }),
    );
  });

  it("returns 404 for an unknown business slug", async () => {
    const response = await request(app).get("/api/p/unknown-business");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Business not found",
    });
  });

  it("returns 404 when the public testimonials page is disabled", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Private Business",
      slug: "private-business",
      settings: {
        isPublicEnabled: false,
      },
    });

    const response = await request(app).get("/api/p/private-business");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Public testimonials page is disabled",
    });
  });

  it("returns the public testimonials version as an ISO string when available", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Versioned Business",
      slug: "versioned-business",
      testimonialsUpdatedAt: new Date("2026-07-05T05:00:00.000Z"),
    });

    const response = await request(app).get(
      "/api/p/business/versioned-business/testimonials-version",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      version: "2026-07-05T05:00:00.000Z",
    });
  });

  it("returns a null version when testimonials have not been updated yet", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Fresh Business",
      slug: "fresh-business",
    });

    const response = await request(app).get(
      "/api/p/business/fresh-business/testimonials-version",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      version: null,
    });
  });
});
