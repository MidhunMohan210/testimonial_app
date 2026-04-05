import { z } from "zod";

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  customerName: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  reviewText: z
    .string()
    .trim()
    .max(500, "Review must be 500 characters or less")  // ← tighter for public form
    .optional(),
});

export const manualAddSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  rating: z.number().int().min(1).max(5),
  testimonialText: z.string().trim().min(5, "Review is too short").max(1000, "Review is too long"),
  source: z.string().trim().max(100).optional(),
  date: z.string().datetime().optional(),
});


export const privateFeedbackSchema = z.object({
  customerName: z.string().trim().max(100, "Name is too long").optional(),
  rating: z.number().int().min(1).max(3),
  feedbackText: z.string().trim().min(3, "Feedback is too short").max(500, "Feedback is too long"),
});
