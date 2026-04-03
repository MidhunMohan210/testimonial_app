import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { getPublicTestimonials } from "../api/publicTestimonialsApi";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SliderWidgetPage() {
  const { slug = "" } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials-widget", slug],
    queryFn: () => getPublicTestimonials(slug, { limit: 10 }),
    enabled: Boolean(slug),
    retry: false,
  });

  const testimonials = testimonialsQuery.data?.testimonials || [];

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((value) => (value + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, testimonials.length]);

  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, testimonials.length]);

  if (testimonialsQuery.isLoading) {
    return (
      <main className="bg-white p-3 text-slate-950 sm:p-4">
        <div className="mx-auto max-w-xl rounded-[1.5rem] border border-slate-200/80 bg-white/80 px-5 py-10 text-center text-sm text-slate-500 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
          Loading reviews...
        </div>
      </main>
    );
  }

  if (testimonialsQuery.isError || !testimonialsQuery.data) {
    return (
      <main className="bg-white p-3 text-slate-950 sm:p-4">
        <div className="mx-auto max-w-xl rounded-[1.5rem] border border-slate-200/80 bg-white/80 px-5 py-10 text-center text-sm text-slate-500 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18)]">
          We couldn&apos;t find this business.
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white p-3 text-slate-950 sm:p-4">
      <div
        className="mx-auto max-w-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <p className="text-center text-xs font-medium tracking-[0.02em] text-slate-500 sm:text-sm">
          Rated {Number(testimonialsQuery.data.averageRating || 0).toFixed(1)} / 5 from{" "}
          {testimonialsQuery.data.totalCount} reviews
        </p>

        <div className="relative mt-4 min-h-[185px] sm:min-h-[210px]">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => {
              const isActive = index === currentIndex;

              return (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isActive
                      ? "translate-x-0 opacity-100"
                      : index < currentIndex
                        ? "-translate-x-4 opacity-0"
                        : "translate-x-4 opacity-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <Card className="h-full rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28),0_10px_24px_-18px_rgba(15,23,42,0.12)]">
                    <CardContent className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                      <div className="absolute left-5 top-5 text-slate-200 sm:left-6 sm:top-6">
                        <Quote className="h-8 w-8" />
                      </div>

                      <div className="relative z-10 pt-8">
                        <StarRating rating={testimonial.rating || 0} />
                        <p className="mt-4 text-[15px] font-medium leading-7 text-slate-700 sm:text-base">
                          {testimonial.testimonialText || "No review text provided."}
                        </p>
                      </div>

                      <div className="relative z-10 mt-5">
                        <p className="text-sm font-semibold text-slate-950">
                          {testimonial.customerName || "Anonymous"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Verified customer • {formatDate(testimonial.collectedAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          ) : (
            <Card className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_24px_60px_-42px_rgba(15,23,42,0.2)]">
              <CardContent className="p-6 text-sm text-slate-500">
                No public reviews yet. Check back soon.
              </CardContent>
            </Card>
          )}
        </div>

        {testimonials.length > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 bg-slate-900"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            className="h-auto rounded-none px-0 py-0 text-sm font-medium text-slate-600 hover:bg-transparent hover:text-slate-950"
            onClick={() => window.open(`/p/${slug}`, "_blank", "noopener,noreferrer")}
          >
            View all reviews →
          </Button>
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-400">Powered by Woice</p>
      </div>
    </main>
  );
}
