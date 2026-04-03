import express from "express";
import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const business = await Business.findOne({ slug: req.params.slug }).select(
      "businessName slug"
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(
      Math.max(Number.isNaN(requestedLimit) ? 20 : requestedLimit, 1),
      100
    );

    const query = {
      businessId: business._id,
      status: "approved",
    };

    const [testimonials, totals] = await Promise.all([
      Testimonial.find(query)
        .sort({ collectedAt: -1 })
        .limit(limit)
        .select("customerName rating testimonialText collectedAt"),
      Testimonial.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const totalCount = totals[0]?.totalCount || 0;
    const averageRating = totals[0]?.averageRating
      ? Number(totals[0].averageRating.toFixed(1))
      : 0;

    return res.json({
      businessName: business.businessName,
      slug: business.slug,
      averageRating,
      totalCount,
      testimonials: testimonials.map((testimonial) => ({
        id: testimonial._id,
        customerName: testimonial.customerName,
        rating: testimonial.rating,
        testimonialText: testimonial.testimonialText,
        collectedAt: testimonial.collectedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
