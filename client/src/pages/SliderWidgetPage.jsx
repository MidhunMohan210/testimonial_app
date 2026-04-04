import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPublicTestimonials } from "../api/publicTestimonialsApi";
import { Skeleton } from "../components/ui/skeleton";

const DISPLAY_LIMIT = 12;

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="relative inline-flex h-4 w-4 items-center justify-center">
          <Star className="absolute h-4 w-4 text-slate-200" />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{
              width: `${Math.max(0, Math.min(1, rating - index)) * 100}%`,
            }}
          >
            <Star className="h-4 w-4 fill-[#f2b554] text-[#f2b554]" />
          </span>
        </span>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "A";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getInitialsTone(index) {
  const tones = [
    "from-[#7c8aa5] to-[#b5c0d4]",
    "from-[#1f2937] to-[#64748b]",
    "from-[#365b6d] to-[#7fb0c2]",
    "from-[#7a5c43] to-[#d1a774]",
    "from-[#475569] to-[#cbd5e1]",
  ];

  return tones[index % tones.length];
}

function ReviewCard({ testimonial, index }) {
  const text = testimonial.testimonialText || "";
  const secondaryText = formatDate(testimonial.collectedAt) || "Customer review";
  const isHighlighted = index % 5 === 2;
  const isCompactReview = text.trim().length > 0 && text.trim().length < 90;

  return (
    <article
      aria-label={`Testimonial from ${testimonial.customerName || "Anonymous"}`}
      className={`group relative flex h-full w-[calc(100vw-2.25rem)] max-w-[320px] shrink-0 cursor-pointer flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 sm:w-[calc(50vw-2.75rem)] hover:shadow-lg sm:max-w-[340px] lg:w-[300px] xl:w-[320px] ${
        isHighlighted
          ? "scale-[1.02] border-slate-300 shadow-xl hover:shadow-2xl"
          : "border-slate-200/70 shadow-[0_12px_34px_rgba(148,163,184,0.12)]"
      }`}
    >
      <Quote className="pointer-events-none absolute right-5 top-5 h-12 w-12 text-slate-100 transition-colors duration-300 group-hover:text-slate-200" strokeWidth={1.5} />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ${
            testimonial.avatarUrl
              ? "bg-slate-200 text-slate-600 ring-2 ring-white shadow-md"
              : `bg-gradient-to-br ${getInitialsTone(index)} text-white ring-2 ring-white shadow-md`
          }`}
        >
          {testimonial.avatarUrl ? (
            <img
              src={testimonial.avatarUrl}
              alt={testimonial.customerName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials(testimonial.customerName)}</span>
          )}
        </div>

          <div className="min-w-0 flex-1">
            <div>
              <p className="max-w-[140px] truncate text-base font-semibold text-slate-800 sm:max-w-[160px]">
                {testimonial.customerName || "Anonymous"}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified review
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">{secondaryText}</p>

            <div className="mt-3 flex items-center gap-2.5">
              <RatingStars rating={testimonial.rating || 0} />
              <span className="text-sm font-semibold text-slate-800">
                {Number(testimonial.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <blockquote
          className={`mt-6 flex-1 ${
            isCompactReview ? "flex items-center justify-center" : ""
          }`}
        >
          <p
            className={`text-sm italic leading-7 text-slate-600 ${
              isCompactReview
                ? "text-center"
                : "line-clamp-3 text-left"
            }`}
          >
            {text || "No written review provided."}
          </p>
        </blockquote>
      </div>
    </article>
  );
}

export default function SliderWidgetPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const embedMode = searchParams.get("embed") === "true";

  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials", slug],
    queryFn: () => getPublicTestimonials(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const testimonials = testimonialsQuery.data?.testimonials || [];
  const visibleTestimonials = useMemo(() => {
    const filteredTestimonials = testimonials.filter(
      (testimonial) => (testimonial.testimonialText || "").trim().length > 20
    );

    const preparedTestimonials =
      filteredTestimonials.length > 0 ? filteredTestimonials : testimonials;

    return [...preparedTestimonials]
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) {
          return ratingDiff;
        }

        const textA = (a.testimonialText || "").trim().length;
        const textB = (b.testimonialText || "").trim().length;
        return textB - textA;
      })
      .slice(0, DISPLAY_LIMIT);
  }, [testimonials]);

  const marqueeTestimonials = useMemo(() => {
    if (visibleTestimonials.length === 0) return [];

    const normalized = [];
    while (normalized.length < Math.max(visibleTestimonials.length, 8)) {
      normalized.push(...visibleTestimonials);
    }

    return normalized.slice(0, Math.max(visibleTestimonials.length, 8));
  }, [visibleTestimonials]);

  const duplicatedTestimonials = useMemo(
    () => [...marqueeTestimonials, ...marqueeTestimonials],
    [marqueeTestimonials],
  );

  if (testimonialsQuery.isLoading) {
    return (
      <main
        className={`min-h-screen bg-[#edf5ff] ${embedMode ? "px-3 py-4" : "px-4 py-6 sm:px-6 sm:py-8"}`}
      >
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white/50 p-6 shadow-[0_30px_90px_rgba(191,213,239,0.35)]">
          <Skeleton className="mx-auto h-[400px] w-full rounded-[28px] bg-white/70" />
        </div>
      </main>
    );
  }

  if (testimonialsQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edf5ff] px-4">
        <div className="rounded-[28px] bg-white px-8 py-14 text-center shadow-[0_30px_90px_rgba(191,213,239,0.35)]">
          <p className="text-lg font-semibold text-slate-900">
            Business not found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            We couldn&apos;t load this public review page.
          </p>
        </div>
      </main>
    );
  }

  const data = testimonialsQuery.data;

  return (
    <main
      className={`min-h-screen overflow-hidden bg-white ${embedMode ? "px-3 py-4" : "px-4 py-6 sm:px-6 sm:py-8"}`}
    >
      <div className={`mx-auto ${embedMode ? "max-w-5xl" : "max-w-6xl"}`}>
        <section className="relative overflow-hidden rounded-[28px] bg-white px-6 py-12 sm:px-10 sm:py-16">
      
       
          {/* ── Header ── */}
          <div className="relative mb-14 text-center">
            <span className="pointer-events-none absolute left-6 top-0 select-none font-serif text-[11rem] leading-none text-slate-100 sm:left-10 sm:text-[14rem]">
              &ldquo;
            </span>

            <div className="relative z-10 inline-block">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                What our Clients say!
              </h1>
              <div className="mx-auto mt-3 flex items-center justify-center gap-1">
                <div className="h-[5px] w-36 rounded-full bg-[#f4a59a]" />
                <div className="h-[5px] w-3 rounded-full bg-[#f4a59a] opacity-50" />
              </div>
            </div>

            <p className="mt-5 text-sm font-medium tracking-widest text-slate-400 uppercase">
              {data.businessName}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <RatingStars rating={data.averageRating} />
              <span className="font-semibold text-slate-800">
                {Number(data.averageRating || 0).toFixed(1)} / 5
              </span>
              {/* <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {data.totalCount} verified reviews
              </span> */}
            </div>
          </div>

          {testimonials.length === 0 ? (
            <div className="mx-auto max-w-md rounded-[24px] bg-slate-50 px-8 py-12 text-center">
              <p className="text-base font-semibold text-slate-700">
                No reviews yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Public testimonials will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/90 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white via-white/90 to-transparent" />

              <div className="overflow-hidden" aria-label="Customer testimonials" role="region">
                <div
                  className="public-review-marquee group flex w-max items-stretch gap-4 py-2 pr-4 will-change-transform sm:gap-6"
                >
                  {duplicatedTestimonials.map((testimonial, index) => (
                    <div key={`${testimonial.id ?? testimonial.customerName ?? "review"}-${index}`}>
                      <ReviewCard
                        testimonial={testimonial}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {testimonials.length > 0 ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-105 hover:bg-slate-900 active:scale-95 focus:outline-none ring-2 ring-slate-300 ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
                onClick={() =>
                  window.open(`/p/${slug}`, "_blank", "noopener,noreferrer")
                }
              >
                See all reviews
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
