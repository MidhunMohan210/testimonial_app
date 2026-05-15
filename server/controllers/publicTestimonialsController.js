import Business from "../models/Business.js";
import Testimonial from "../models/Testimonial.js";
import { getBusinessSettings } from "../utils/businessSettings.js";
import { createHttpError } from "../utils/httpError.js";

export const getPublicTestimonials = async (req, res) => {
  const business = await Business.findOne({ slug: req.params.slug }).select(
    "businessName slug settings isPublicEnabled",
  );

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  if (getBusinessSettings(business).isPublicEnabled === false) {
    throw createHttpError(404, "Public testimonials page is disabled");
  }

  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Math.min(
    Math.max(Number.isNaN(requestedLimit) ? 20 : requestedLimit, 1),
    100,
  );

  const query = {
    businessId: business._id,
    status: "approved",
  };

  const [testimonials, totals] = await Promise.all([
    Testimonial.find(query)
      .sort({ collectedAt: -1, _id: -1 })
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
};

export const getPublicTestimonialsVersion = async (req, res) => {
  const business = await Business.findOne({ slug: req.params.slug }).select(
    "slug settings isPublicEnabled testimonialsUpdatedAt",
  );

  if (!business) {
    throw createHttpError(404, "Business not found");
  }

  if (getBusinessSettings(business).isPublicEnabled === false) {
    throw createHttpError(404, "Public testimonials page is disabled");
  }

  return res.json({
    version: business.testimonialsUpdatedAt
      ? business.testimonialsUpdatedAt.toISOString()
      : null,
  });
};
