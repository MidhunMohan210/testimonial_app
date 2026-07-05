import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import PrivateFeedback from "../models/PrivateFeedback.js";
import Testimonial from "../models/Testimonial.js";

describe("Private feedback submission", () => {
  it("creates private feedback for a valid 2-star submission", async () => {
    const business = await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 2,
        feedbackText: "The service was delayed",
        contactEmail: "rahul@example.com",
        contactPhone: "9876543210",
        allowFollowUp: true,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
    });

    const feedback = await PrivateFeedback.findOne({
      businessId: business._id,
    }).lean();

    expect(feedback).not.toBeNull();
    expect(feedback.customerName).toBe("Rahul");
    expect(feedback.rating).toBe(2);
    expect(feedback.feedbackText).toBe("The service was delayed");
    expect(feedback.contactEmail).toBe("rahul@example.com");
    expect(feedback.contactPhone).toBe("9876543210");
    expect(feedback.allowFollowUp).toBe(true);
    expect(feedback.status).toBe("new");

    const testimonialCount = await Testimonial.countDocuments();

    expect(testimonialCount).toBe(0);
  });

  it("rejects a 4-star rating from the private feedback endpoint", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 4,
        feedbackText: "This should not enter private feedback",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid input");

    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "rating",
        }),
      ]),
    );

    const privateFeedbackCount = await PrivateFeedback.countDocuments();

    const testimonialCount = await Testimonial.countDocuments();

    expect(privateFeedbackCount).toBe(0);
    expect(testimonialCount).toBe(0);
  });

  it("rejects private feedback when feedback text is missing", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const response = await request(app)
      .post("/api/r/test-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 2,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid input");

    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "feedbackText",
        }),
      ]),
    );

    const privateFeedbackCount = await PrivateFeedback.countDocuments();

    expect(privateFeedbackCount).toBe(0);
  });

  it("returns 404 when the business slug does not exist", async () => {
    const response = await request(app)
      .post("/api/r/unknown-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 2,
        feedbackText: "The service was delayed",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Business not found");

    const privateFeedbackCount = await PrivateFeedback.countDocuments();

    expect(privateFeedbackCount).toBe(0);
  });

  it("returns duplicate true and does not create a second private feedback entry for the same submission within 30 seconds", async () => {
    await Business.create({
      userId: new mongoose.Types.ObjectId(),
      businessName: "Test Business",
      slug: "test-business",
    });

    const firstResponse = await request(app)
      .post("/api/r/test-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 2,
        feedbackText: "The service was delayed",
        contactEmail: "rahul@example.com",
        contactPhone: "9876543210",
        allowFollowUp: true,
      });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body).toEqual({
      success: true,
    });

    const duplicateResponse = await request(app)
      .post("/api/r/test-business/feedback")
      .send({
        customerName: "Rahul",
        rating: 2,
        feedbackText: "The service was delayed",
        contactEmail: "rahul@example.com",
        contactPhone: "9876543210",
        allowFollowUp: true,
      });

    expect(duplicateResponse.status).toBe(200);
    expect(duplicateResponse.body).toEqual({
      success: true,
      duplicate: true,
    });

    const privateFeedbackCount = await PrivateFeedback.countDocuments();

    expect(privateFeedbackCount).toBe(1);
  });
});
