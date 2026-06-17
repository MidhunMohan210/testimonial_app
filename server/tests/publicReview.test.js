import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";
import PrivateFeedback from "../models/PrivateFeedback.js";

describe("Public review submission", () => {
  /// creates a pending testimonial for a valid 5-star review

  it("creates a pending testimonial for a valid 5-star review", async () => {
    // 1. Create a fake business in the temporary test database
    const business = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    // 2. Send a request to the real backend endpoint
    const response = await request(app)
      .post("/api/r/test-business/submit")
      .send({
        customerName: "Rahul",
        rating: 5,
        reviewText: "Excellent service",
      });

    // 3. Check the API response
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
    });

    // 4. Check whether MongoDB saved the testimonial
    const testimonial = await Testimonial.findOne({
      businessId: business._id,
    }).lean();

    expect(testimonial).not.toBeNull();
    expect(testimonial.customerName).toBe("Rahul");
    expect(testimonial.rating).toBe(5);
    expect(testimonial.testimonialText).toBe("Excellent service");
    expect(testimonial.status).toBe("pending");
    expect(testimonial.source).toBe("link");

    /// 5. Check whether MongoDB saved the private feedback

    const privateFeedbackCount = await PrivateFeedback.countDocuments();
    expect(privateFeedbackCount).toBe(0);

    expect(String(testimonial.businessId)).toBe(String(business._id));
  });

  /// rejects a public review with a 3-star rating

  it("rejects a public review with a 3-star rating", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/submit")
      .send({
        customerName: "Rahul",
        rating: 3,
        reviewText: "Service was average",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid input");

    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "rating",
          message: "Rating must be 4 or 5",
        }),
      ]),
    );

    const testimonialCount = await Testimonial.countDocuments();

    expect(testimonialCount).toBe(0);
  });

  //// when the business slug does not exist.

  it("returns 404 when the business slug does not exist", async () => {
    const response = await request(app)
      .post("/api/r/unknown-business/submit")
      .send({
        customerName: "Rahul",
        rating: 5,
        reviewText: "Excellent service",
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe("Business not found");

    const testimonialCount = await Testimonial.countDocuments();

    expect(testimonialCount).toBe(0);
  });

  /// rejects a public review when review text is missing

  it("rejects a public review when review text is missing", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/submit")
      .send({
        customerName: "Rahul",
        rating: 5,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid input");

    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "reviewText",
        }),
      ]),
    );

    const testimonialCount = await Testimonial.countDocuments();

    expect(testimonialCount).toBe(0);
  });

  it("creates a testimonial for a valid 4-star review", async () => {
    const business = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/submit")
      .send({
        customerName: "Anjali",
        rating: 4,
        reviewText: "Very good service",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
    });

    const testimonial = await Testimonial.findOne({
      businessId: business._id,
    }).lean();

    expect(testimonial).not.toBeNull();
    expect(testimonial.rating).toBe(4);
    expect(testimonial.status).toBe("pending");
  });
});
