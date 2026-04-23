import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CloudAlert, Quote, Star } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPublicTestimonials } from "../api/publicTestimonialsApi";
import WidgetLoader from "../components/WidgetLoader";

const DISPLAY_LIMIT = 5;
const LOADING_HINT_DELAY_MS = 5000;

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
      className={`group relative flex h-full w-[75vw] max-w-[300px] shrink-0 cursor-pointer flex-col rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[300px] sm:max-w-none sm:p-6 xl:w-[320px] ${
        isHighlighted
          ? "scale-[1.02] border-slate-300 shadow-xl hover:shadow-2xl"
          : "border-slate-200/70 shadow-[0_12px_34px_rgba(148,163,184,0.12)]"
      }`}
    >
      <Quote className="pointer-events-none absolute right-4 top-4 h-9 w-9 text-slate-100 transition-colors duration-300 group-hover:text-slate-200 sm:right-5 sm:top-5 sm:h-12 sm:w-12" strokeWidth={1.5} />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold sm:h-14 sm:w-14 sm:text-sm ${
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
              <p className="max-w-[120px] truncate text-sm font-semibold text-slate-800 sm:max-w-[160px] sm:text-base">
                {testimonial.customerName || "Anonymous"}
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:mt-2 sm:text-[11px]">
                <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Verified review
              </span>
            </div>

            <p className="mt-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">{secondaryText}</p>

            <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-2.5">
              <RatingStars rating={testimonial.rating || 0} />
              <span className="text-xs font-semibold text-slate-800 sm:text-sm">
                {Number(testimonial.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <blockquote
          className={`mt-4 flex-1 sm:mt-6 ${
            isCompactReview ? "flex items-center justify-center" : ""
          }`}
        >
          <p
            className={`text-xs italic leading-6 text-slate-600 sm:text-sm sm:leading-7 ${
              isCompactReview ? "text-center" : "line-clamp-3 text-left"
            }`}
          >
            {text || "No written review provided."}
          </p>
        </blockquote>
      </div>
    </article>
  );
}

function SkeletonCard({ compact = false, keyId }) {
  return (
    <article
      key={keyId}
      className={`widget-fade-in flex h-full w-[75vw] max-w-[300px] shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_34px_rgba(148,163,184,0.12)] sm:w-[300px] sm:max-w-none sm:p-6 xl:w-[320px] ${compact ? "min-h-[220px]" : "min-h-[260px]"}`}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="widget-skeleton-shimmer h-11 w-11 rounded-full sm:h-14 sm:w-14" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="widget-skeleton-shimmer h-4 w-40 max-w-full rounded-md" />
          <div className="widget-skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="widget-skeleton-shimmer h-3 w-16 rounded-md" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="widget-skeleton-shimmer h-3.5 w-full rounded-md" />
        <div className="widget-skeleton-shimmer h-3.5 w-[92%] rounded-md" />
        <div className="widget-skeleton-shimmer h-3.5 w-[78%] rounded-md" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="widget-skeleton-shimmer h-3 w-full rounded-md" />
        <div className="widget-skeleton-shimmer h-3 w-[90%] rounded-md" />
        <div className="widget-skeleton-shimmer h-3 w-[86%] rounded-md" />
      </div>
    </article>
  );
}

function WidgetSkeleton({ showSlowHint }) {
  return (
    <div className="widget-fade-in">
      <div className="mb-10 px-4 text-center sm:mb-14 sm:px-0">
        <div className="mx-auto h-10 w-56 widget-skeleton-shimmer rounded-lg sm:h-12 sm:w-72" />
        <div className="mx-auto mt-4 h-4 w-32 widget-skeleton-shimmer rounded-md" />
      </div>
      <div className="overflow-hidden" role="status" aria-live="polite">
        <div className="flex items-stretch gap-3 py-3 pl-4 pr-4 sm:gap-6 sm:pl-0 sm:pr-4">
          <SkeletonCard keyId="s1" />
          <SkeletonCard keyId="s2" compact />
          <SkeletonCard keyId="s3" />
        </div>
      </div>
      {showSlowHint ? (
        <p className="mt-4 px-4 text-center text-sm text-slate-500">
          Still loading... please wait
        </p>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-10 text-center sm:px-8 sm:py-12 widget-fade-in">
      <p className="text-base font-semibold text-slate-700">
        No testimonials yet
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Public testimonials will appear here automatically.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="mx-auto  rounded-[24px] h-[420px] flex items-center justify-center flex-col px-6 py-10 text-center  sm:px-8 sm:py-12 widget-fade-in">
      <CloudAlert size={40} color="gray" />
      <p className="text-base font-semibold text-slate-800 mt-3">
        Unable to load testimonials
      </p>
      <p className="mt-2 text-sm text-slate-500">
       Please try again in a moment
      </p>
      <button
        type="button"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}

export default function SliderWidgetPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const embedMode = searchParams.get("embed") === "true";
  const widgetRootRef = useRef(null);
  const widgetContentRef = useRef(null);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);

  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials", slug],
    queryFn: () => getPublicTestimonials(slug, { limit: DISPLAY_LIMIT }),
    enabled: Boolean(slug),
    retry: 1,
  });

  const isLoading = testimonialsQuery.isLoading;
  const isError = testimonialsQuery.isError;
  // const isError = true;
  const data = testimonialsQuery.data;

  const testimonials = Array.isArray(data?.testimonials)
    ? data.testimonials
    : [];

  const isInvalidData = !isLoading && !isError && !data;

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
    [marqueeTestimonials]
  );

  useEffect(() => {
    if (!testimonialsQuery.isLoading) {
      setShowSlowLoadingHint(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSlowLoadingHint(true);
    }, LOADING_HINT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [testimonialsQuery.isLoading]);

  useEffect(() => {
    let timeoutId;

    const postHeight = () => {
      if (typeof window === "undefined" || window.parent === window) {
        return;
      }

      const contentEl = widgetContentRef.current;
      const rootEl = widgetRootRef.current;
      const measuredEl = contentEl || rootEl;
      const measuredHeight = measuredEl
        ? Math.max(
            measuredEl.scrollHeight,
            Math.ceil(measuredEl.getBoundingClientRect().height)
          )
        : 0;
      const fallbackHeight = Math.max(
        document.documentElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0
      );
      const height = measuredHeight || fallbackHeight || 400;

      window.parent.postMessage(
        {
          type: "RESIZE_IFRAME",
          height,
        },
        "*"
      );

      window.parent.postMessage(
        {
          type: "WOICE_WIDGET_HEIGHT",
          height,
          slug,
        },
        "*"
      );
    };

    const debouncedPostHeight = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(postHeight, 100);
    };

    debouncedPostHeight();
    window.addEventListener("resize", debouncedPostHeight);
    window.addEventListener("load", debouncedPostHeight);

    if (document.fonts?.ready) {
      document.fonts.ready.then(debouncedPostHeight).catch(() => {});
    }

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedPostHeight);
      window.removeEventListener("load", debouncedPostHeight);
    };
  }, [
    duplicatedTestimonials.length,
    embedMode,
    testimonialsQuery.isLoading,
    testimonialsQuery.isError,
    isInvalidData,
    slug,
  ]);

  if (!slug) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <main
      ref={widgetRootRef}
      className={`overflow-hidden bg-white ${
        embedMode ? "px-2 py-3" : "px-3 py-5 sm:px-6 sm:py-8"
      }`}
      aria-busy={isLoading ? "true" : "false"}
    >
      <div className={`mx-auto ${embedMode ? "max-w-5xl" : "max-w-6xl"}`}>
        <section
          ref={widgetContentRef}
          className="relative rounded-[20px] bg-white px-0 py-8 sm:rounded-[28px] sm:px-10 sm:py-16"
        >
          {!isLoading && !isError && !isInvalidData ? (
            <div className="relative mb-10 px-4 text-center sm:mb-14 sm:px-0 widget-fade-in">
              <span className="pointer-events-none absolute left-2 top-0 select-none font-serif text-[7rem] leading-none text-slate-100 sm:left-10 sm:text-[14rem]">
                &ldquo;
              </span>

              <div className="relative z-10 inline-block">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  What our Clients say!
                </h1>
                <div className="mx-auto mt-2 flex items-center justify-center gap-1 sm:mt-3">
                  <div className="h-[5px] w-28 rounded-full bg-[#f4a59a] sm:w-36" />
                  <div className="h-[5px] w-3 rounded-full bg-[#f4a59a] opacity-50" />
                </div>
              </div>

              <p className="mt-4 text-xs font-medium tracking-widest text-slate-400 uppercase sm:mt-5 sm:text-sm">
                {data?.businessName}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 sm:mt-3">
                <RatingStars rating={data?.averageRating || 0} />
                <span className="font-semibold text-slate-800">
                  {Number(data?.averageRating || 0).toFixed(1)} / 5
                </span>
              </div>
            </div>
          ) : null}

          <div className="transition-opacity duration-300">
            {isLoading ? <WidgetLoader /> : null}

            {isError || isInvalidData ? (
              <ErrorState onRetry={() => testimonialsQuery.refetch()} />
            ) : null}

            {!isLoading && !isError && !isInvalidData && testimonials.length === 0 ? (
              <EmptyState />
            ) : null}

            {!isLoading && !isError && !isInvalidData && testimonials.length > 0 ? (
              <div className="relative widget-fade-in">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white via-white/80 to-transparent sm:w-20" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-white via-white/80 to-transparent sm:w-20" />

                <div className="overflow-hidden" aria-label="Customer testimonials" role="region">
                  <div className="public-review-marquee group flex w-max items-stretch gap-3 py-3 pl-4 pr-4 will-change-transform sm:gap-6 sm:pl-0 sm:pr-4">
                    {duplicatedTestimonials.map((testimonial, index) => (
                      <div key={`${testimonial.id ?? testimonial.customerName ?? "review"}-${index}`}>
                        <ReviewCard testimonial={testimonial} index={index} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {!isLoading && !isError && !isInvalidData && testimonials.length > 0 ? (
            <div className="mt-8 px-4 text-center sm:mt-10 sm:px-0 widget-fade-in">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:scale-105 hover:bg-slate-900 active:scale-95 focus:outline-none ring-2 ring-slate-300 ring-offset-1 disabled:pointer-events-none disabled:opacity-50 sm:px-6 sm:py-3"
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