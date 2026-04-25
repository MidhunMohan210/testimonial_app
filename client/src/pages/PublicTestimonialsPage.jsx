import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudAlert, Star } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPublicTestimonials } from "../api/publicTestimonialsApi";
import WidgetLoader from "../components/WidgetLoader";

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 12;
const MIN_LOADING_SCREEN_MS = 500;
const PUBLIC_TESTIMONIALS_STALE_TIME_MS = 5 * 60 * 1000;
const PUBLIC_TESTIMONIALS_GC_TIME_MS = 30 * 60 * 1000;

function StarRating({ rating, muted = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-3 w-3 ${
            index < Math.round(rating)
              ? muted
                ? "fill-white/85 text-white/85"
                : "fill-[#f2b554] text-[#f2b554]"
              : muted
                ? "text-white/25"
                : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
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

function getAvatarTone(index) {
  const tones = [
    "from-[#1f2937] to-[#7c3aed]",
    "from-[#4338ca] to-[#8b5cf6]",
    "from-[#0f766e] to-[#14b8a6]",
    "from-[#9a3412] to-[#f59e0b]",
    "from-[#334155] to-[#94a3b8]",
  ];
  return tones[index % tones.length];
}

const CARD_TONES = [
  {
    bg: "#7744d4",
    color: "white",
    shadow: "0 25px 60px rgba(119,68,212,0.18)",
    body: "rgba(255,255,255,0.88)",
    sub: "rgba(255,255,255,0.70)",
    showQuote: true,
    mutedStars: true,
  },
  {
    bg: "#ffffff",
    color: "#334155",
    shadow: "0 16px 38px rgba(148,163,184,0.14)",
    body: "#64748b",
    sub: "#94a3b8",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#fdf7f2",
    color: "#5b6474",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#6b7280",
    sub: "#a8b0bc",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#f3f8ff",
    color: "#42526b",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#64748b",
    sub: "#94a3b8",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#f6f4ff",
    color: "#554a7f",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#736b92",
    sub: "#aea7c5",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#f4fbf8",
    color: "#43635c",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#5f7a73",
    sub: "#99b3ac",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#fff8ef",
    color: "#6a5a46",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#7d6d59",
    sub: "#b9ab97",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#56647e",
    color: "white",
    shadow: "0 25px 60px rgba(86,100,126,0.16)",
    body: "rgba(255,255,255,0.82)",
    sub: "rgba(255,255,255,0.70)",
    showQuote: false,
    mutedStars: true,
  },
  {
    bg: "#f8fafc",
    color: "#475569",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#64748b",
    sub: "#94a3b8",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#f7f3ff",
    color: "#5b5f84",
    shadow: "0 16px 38px rgba(148,163,184,0.10)",
    body: "#787c9a",
    sub: "#acaecc",
    showQuote: false,
    mutedStars: false,
  },
  {
    bg: "#2d3a4f",
    color: "white",
    shadow: "0 25px 60px rgba(29,38,52,0.18)",
    body: "rgba(255,255,255,0.78)",
    sub: "rgba(255,255,255,0.65)",
    showQuote: false,
    mutedStars: true,
  },
];

const CARD_LAYOUTS = [
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
  "break-inside-avoid mb-5 w-full",
];

function getCardLayout(index) {
  return CARD_LAYOUTS[index % CARD_LAYOUTS.length];
}

function getCardSizing(reviewText, index) {
  const length = reviewText.trim().length;
  const featuredSlot = index % CARD_LAYOUTS.length === 2;

  if (length < 90) {
    return {
      cardClass: "min-h-[170px]",
      titleSize: "1rem",
      clamp: 3,
      featured: false,
    };
  }

  if (length < 180) {
    return {
      cardClass: "min-h-[210px]",
      titleSize: "1rem",
      clamp: 4,
      featured: false,
    };
  }

  if (featuredSlot || length > 320) {
    return {
      cardClass: "min-h-[280px] lg:min-h-[360px]",
      titleSize: "1.12rem",
      clamp: null,
      featured: true,
    };
  }

  return {
    cardClass: "min-h-[240px]",
    titleSize: "1rem",
    clamp: 6,
    featured: false,
  };
}

function ReviewBoardCard({ testimonial, index }) {
  const tone = CARD_TONES[index % CARD_TONES.length];
  const layout = getCardLayout(index);
  const reviewText = testimonial.testimonialText || "No written review provided.";
  const sizing = getCardSizing(reviewText, index);

  return (
    <article
      data-review-id={testimonial.id}
      className={`relative flex flex-col overflow-hidden rounded-[12px] p-5 sm:p-[22px] ${layout}  ${sizing.cardClass}`}
      style={{
        background: tone.bg,
        color: tone.color,
        boxShadow: tone.shadow,
        display: "inline-flex",
      }}
    >
      {tone.showQuote && (
        <div
          style={{
            position: "absolute",
            right: 24,
            top: -8,
            fontSize: 90,
            fontWeight: 700,
            lineHeight: 1,
            color: "rgba(255,255,255,0.16)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          &rdquo;
        </div>
      )}

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.35)",
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              background: testimonial.avatarUrl ? "#cbd5e1" : undefined,
            }}
            className={
              testimonial.avatarUrl
                ? ""
                : `bg-gradient-to-br ${getAvatarTone(index)} text-white`
            }
          >
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.customerName || "Reviewer"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{getInitials(testimonial.customerName)}</span>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: tone.color }}>
              {testimonial.customerName || "Anonymous"}
            </p>
            <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 500, color: tone.sub }}>
              Verified Graduate
            </p>
            <div style={{ marginTop: 3 }}>
              <StarRating rating={testimonial.rating || 0} muted={tone.mutedStars} />
            </div>
          </div>
        </div>

        <h2
          style={{
            marginTop: 20,
            marginBottom: 0,
            fontSize: sizing.titleSize,
            fontWeight: 600,
            lineHeight: 1.45,
            color: tone.color,
          }}
        >
          {reviewText.length > 80 ? `${reviewText.slice(0, 80)}...` : reviewText}
        </h2>

        <p
          style={{
            marginTop: 16,
            fontSize: "0.88rem",
            lineHeight: 1.65,
            color: tone.body,
            display: "-webkit-box",
            WebkitLineClamp: sizing.clamp === null ? "unset" : sizing.clamp,
            WebkitBoxOrient: "vertical",
            overflow: sizing.clamp === null ? "visible" : "hidden",
          }}
        >
          {reviewText}
        </p>
      </div>
    </article>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="min-h-screen w-full px-6 py-10 text-center widget-fade-in sm:px-8 sm:py-12 flex items-center justify-center flex-col">
      <CloudAlert size={40} color="gray" />
      <p className="mt-3 text-base font-semibold text-slate-800">
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

export default function PublicTestimonialsPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const embedMode = searchParams.get("embed") === "true";
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(Boolean(slug));
  const loadingStartedAtRef = useRef(null);
  const hideLoadingTimeoutRef = useRef(null);

  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials", "full", slug],
    queryFn: () => getPublicTestimonials(slug),
    enabled: Boolean(slug),
    retry: false,
    staleTime: PUBLIC_TESTIMONIALS_STALE_TIME_MS,
    gcTime: PUBLIC_TESTIMONIALS_GC_TIME_MS,
  });

  const data = testimonialsQuery.data;
  const reviewIdParam = searchParams.get("review");
  const cleanedTestimonials = useMemo(
    () =>
      (data?.testimonials || []).filter(
        (testimonial) =>
          (testimonial.rating || 0) > 0 &&
          (testimonial.testimonialText || "").trim().length > 10
      ),
    [data?.testimonials]
  );
  const boardTestimonials = useMemo(
    () => (cleanedTestimonials.length > 0 ? cleanedTestimonials : data?.testimonials || []),
    [cleanedTestimonials, data?.testimonials]
  );
  const visibleTestimonials = useMemo(
    () => boardTestimonials.slice(0, Math.min(visibleCount, boardTestimonials.length)),
    [boardTestimonials, visibleCount]
  );
  const hasMoreTestimonials = visibleCount < boardTestimonials.length;
  const averageRating = useMemo(
    () => Number(data?.averageRating || 0).toFixed(1),
    [data?.averageRating]
  );

  useEffect(() => {
    return () => {
      if (hideLoadingTimeoutRef.current) {
        window.clearTimeout(hideLoadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      if (hideLoadingTimeoutRef.current) {
        window.clearTimeout(hideLoadingTimeoutRef.current);
        hideLoadingTimeoutRef.current = null;
      }
      loadingStartedAtRef.current = null;
      setShowLoadingScreen(false);
      return;
    }

    if (testimonialsQuery.isLoading) {
      if (hideLoadingTimeoutRef.current) {
        window.clearTimeout(hideLoadingTimeoutRef.current);
        hideLoadingTimeoutRef.current = null;
      }
      if (loadingStartedAtRef.current === null) {
        loadingStartedAtRef.current = Date.now();
      }
      setShowLoadingScreen(true);
      return;
    }

    const loadingStartedAt = loadingStartedAtRef.current;
    if (loadingStartedAt === null) {
      setShowLoadingScreen(false);
      return;
    }

    const elapsedMs = Date.now() - loadingStartedAt;
    const remainingMs = Math.max(0, MIN_LOADING_SCREEN_MS - elapsedMs);

    if (remainingMs === 0) {
      setShowLoadingScreen(false);
      loadingStartedAtRef.current = null;
      return;
    }

    hideLoadingTimeoutRef.current = window.setTimeout(() => {
      setShowLoadingScreen(false);
      loadingStartedAtRef.current = null;
      hideLoadingTimeoutRef.current = null;
    }, remainingMs);
  }, [slug, testimonialsQuery.isLoading]);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
    setIsLoadingMore(false);
  }, [slug]);

  useEffect(() => {
    if (!data?.businessName) {
      return undefined;
    }

    const previousTitle = document.title;
    document.title = `${data.businessName} Reviews`;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    const createdMeta = !descriptionMeta;

    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }

    const previousDescription = descriptionMeta.getAttribute("content");
    descriptionMeta.setAttribute(
      "content",
      `Read verified customer reviews for ${data.businessName}`
    );

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.setAttribute("data-public-reviews-schema", slug);
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: data.businessName,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(data.averageRating || 0),
        reviewCount: Number(data.totalCount || 0),
      },
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.title = previousTitle;

      if (descriptionMeta) {
        if (previousDescription !== null) {
          descriptionMeta.setAttribute("content", previousDescription);
        } else if (createdMeta) {
          descriptionMeta.remove();
        } else {
          descriptionMeta.removeAttribute("content");
        }
      }

      schemaScript.remove();
    };
  }, [data?.averageRating, data?.businessName, data?.totalCount, slug]);

  useEffect(() => {
    if (!reviewIdParam || boardTestimonials.length === 0) {
      return;
    }

    const targetIndex = boardTestimonials.findIndex(
      (testimonial) => String(testimonial.id) === reviewIdParam
    );

    if (targetIndex === -1) {
      return;
    }

    if (targetIndex >= visibleCount) {
      setVisibleCount(
        Math.min(Math.max(INITIAL_COUNT, targetIndex + 1), boardTestimonials.length)
      );
      return;
    }

    const target = document.querySelector(`[data-review-id="${reviewIdParam}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [boardTestimonials, reviewIdParam, visibleCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    window.requestAnimationFrame(() => {
      setVisibleCount((current) =>
        Math.min(current + LOAD_MORE_COUNT, boardTestimonials.length)
      );
      setIsLoadingMore(false);
    });
  };

  if (!slug) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  if (showLoadingScreen) {
    return (
      <main
        className={`min-h-screen overflow-x-hidden bg-[#edf3fb] flex items-center justify-center ${
          embedMode ? "px-3 py-4" : "px-4 py-6 sm:px-6 sm:py-8"
        }`}
      >
        <div className="w-full">
          <WidgetLoader />
        </div>
      </main>
    );
  }

  if (testimonialsQuery.isError) {
    return (
      <main
        className={`h-screen overflow-hidden bg-[#edf3fb] ${
          embedMode ? "px-3 py-4" : "px-4 py-6 sm:px-6 sm:py-8"
        }`}
      >
        <ErrorState onRetry={() => testimonialsQuery.refetch()} />
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-x-hidden bg-[#edf3fb] ${
        embedMode ? "px-3 py-4" : "px-4 py-6 sm:px-6 sm:py-8"
      }`}
    >
      <div className={`mx-auto ${embedMode ? "max-w-5xl" : "max-w-6xl"}`}>
        {boardTestimonials.length === 0 ? (
          <section className="rounded-[20px] bg-white px-8 py-14 text-center shadow-[0_24px_60px_rgba(148,163,184,0.12)]">
            <p className="text-lg font-semibold text-slate-900">No reviews yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Public testimonials will appear here automatically.
            </p>
          </section>
        ) : (
          <section className="py-10 sm:py-16">
            <h1 className="mb-2 text-center text-xl font-semibold text-slate-600 sm:text-2xl tracking-wider">
              {data?.businessName} Reviews & Ratings
            </h1>
            <div className="mb-6 text-center text-sm font-medium text-slate-600">
              {averageRating} / 5 • {data?.totalCount || 0} reviews
            </div>

            <div className=". columns-1 gap-5 md:columns-2 lg:columns-3 xl:columns-3 margin mt-16 ">
              {visibleTestimonials.map((testimonial, index) => (
                <ReviewBoardCard
                  key={`${testimonial.id ?? testimonial.customerName ?? "review"}-${index}`}
                  testimonial={testimonial}
                  index={index}
                />
              ))}
            </div>

            {hasMoreTestimonials ? (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load more reviews"}
                </button>
              </div>
            ) : null}

            {!embedMode ? (
              <p className="mt-8 text-center text-xs text-slate-400">
                Powered by Woice
              </p>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
