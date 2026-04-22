import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const DEFAULT_THEME = "light";
const DEFAULT_LAYOUT = "grid";

function normalizeTheme(value) {
  return value === "dark" ? "dark" : DEFAULT_THEME;
}

function normalizeLayout(value) {
  return value === "slider" ? "slider" : DEFAULT_LAYOUT;
}

function normalizeTestimonials(payload) {
  const source = Array.isArray(payload)
    ? payload
    : payload?.testimonials || payload?.data?.testimonials || [];

  return source.map((item, index) => ({
    id: item.id || item._id || `testimonial-${index}`,
    customerName: String(item.customerName || item.name || "Anonymous"),
    testimonialText: String(
      item.testimonialText || item.message || item.text || "No written testimonial provided.",
    ),
    rating: Number(item.rating || 0),
    collectedAt: item.collectedAt || item.createdAt || null,
  }));
}

function formatDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function SkeletonCard() {
  return (
    <article className="woice-card woice-skeleton" aria-hidden="true">
      <div className="woice-row">
        <div className="woice-skeleton-circle" />
        <div className="woice-col" style={{ gap: 8 }}>
          <div className="woice-skeleton-line woice-w-60" />
          <div className="woice-skeleton-line woice-w-40" />
        </div>
      </div>
      <div className="woice-col" style={{ marginTop: 16, gap: 8 }}>
        <div className="woice-skeleton-line woice-w-100" />
        <div className="woice-skeleton-line woice-w-90" />
        <div className="woice-skeleton-line woice-w-70" />
      </div>
    </article>
  );
}

function Stars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, rating || 0));

  return (
    <div className="woice-stars" aria-label={`${safeRating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < safeRating ? "filled" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <article className="woice-card">
      <div className="woice-row woice-between">
        <div className="woice-col" style={{ gap: 2 }}>
          <h3 className="woice-name">{item.customerName}</h3>
          {item.collectedAt ? (
            <p className="woice-date">{formatDate(item.collectedAt)}</p>
          ) : null}
        </div>
        <Stars rating={item.rating} />
      </div>
      <p className="woice-text">"{item.testimonialText}"</p>
    </article>
  );
}

function getApiBase() {
  return (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
}

export default function WidgetPage() {
  const { businessSlug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const rootRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const theme = normalizeTheme(searchParams.get("theme"));
  const layout = normalizeLayout(searchParams.get("layout"));

  const themeClass = useMemo(() => {
    return theme === "dark" ? "woice-theme-dark" : "woice-theme-light";
  }, [theme]);

  useEffect(() => {
    if (!businessSlug) {
      setStatus("error");
      setErrorMessage("Business not found");
      return;
    }

    const controller = new AbortController();
    const base = getApiBase();
    const primaryUrl = `${base}/api/public/testimonials/${encodeURIComponent(
      businessSlug,
    )}`;
    const fallbackUrl = `${base}/api/p/${encodeURIComponent(businessSlug)}`;

    async function loadTestimonials() {
      setStatus("loading");
      setErrorMessage("");

      try {
        let response = await fetch(primaryUrl, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        // Backward compatibility for existing deployments.
        if (!response.ok && response.status === 404) {
          response = await fetch(fallbackUrl, {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          });
        }

        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }

        const payload = await response.json();
        const normalized = normalizeTestimonials(payload);
        setTestimonials(normalized);
        setBusinessName(String(payload?.businessName || payload?.business?.name || ""));
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") return;
        setStatus("error");
        setErrorMessage("Failed to load testimonials");
      }
    }

    loadTestimonials();

    return () => controller.abort();
  }, [businessSlug]);

  useEffect(() => {
    setActiveIndex(0);
  }, [layout, testimonials.length]);

  useEffect(() => {
    let frameId = null;
    let timeoutId = null;
    let resizeObserver = null;
    let mutationObserver = null;

    const postHeight = () => {
      if (window.parent === window) return;

      const doc = document.documentElement;
      const body = document.body;
      const rootHeight = rootRef.current ? rootRef.current.scrollHeight : 0;
      const height = Math.max(
        doc?.scrollHeight || 0,
        body?.scrollHeight || 0,
        rootHeight,
      );

      window.parent.postMessage(
        {
          type: "WOICE_WIDGET_HEIGHT",
          businessSlug,
          height,
        },
        "*",
      );

      // Compatibility with older listeners.
      window.parent.postMessage(
        {
          type: "RESIZE_IFRAME",
          height,
        },
        "*",
      );
    };

    const schedulePost = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(postHeight);
    };

    schedulePost();

    window.addEventListener("load", schedulePost);
    window.addEventListener("resize", schedulePost);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(schedulePost);
      if (document.body) resizeObserver.observe(document.body);
      if (rootRef.current) resizeObserver.observe(rootRef.current);
    } else if ("MutationObserver" in window && document.body) {
      mutationObserver = new MutationObserver(schedulePost);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(schedulePost).catch(() => {});
    }

    timeoutId = window.setTimeout(schedulePost, 250);

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener("load", schedulePost);
      window.removeEventListener("resize", schedulePost);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [businessSlug, layout, status, testimonials.length, activeIndex]);

  const hasTestimonials = testimonials.length > 0;
  const safeIndex = hasTestimonials
    ? Math.min(activeIndex, testimonials.length - 1)
    : 0;

  function goNext() {
    setActiveIndex((prev) => {
      if (!hasTestimonials) return prev;
      return (prev + 1) % testimonials.length;
    });
  }

  function goPrev() {
    setActiveIndex((prev) => {
      if (!hasTestimonials) return prev;
      return (prev - 1 + testimonials.length) % testimonials.length;
    });
  }

  return (
    <div ref={rootRef} className={`woice-widget ${themeClass}`}>
      <style>{`
        .woice-widget, .woice-widget * { box-sizing: border-box; }
        .woice-widget {
          width: 100%;
          margin: 0;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.4;
        }
        .woice-theme-light {
          --woice-bg: #f8fafc;
          --woice-surface: #ffffff;
          --woice-text: #0f172a;
          --woice-subtext: #64748b;
          --woice-border: #e2e8f0;
          --woice-accent: #0f172a;
          --woice-muted: #eef2f7;
        }
        .woice-theme-dark {
          --woice-bg: #0b1220;
          --woice-surface: #131c31;
          --woice-text: #e2e8f0;
          --woice-subtext: #94a3b8;
          --woice-border: #1f2a44;
          --woice-accent: #e2e8f0;
          --woice-muted: #1b263f;
        }
        .woice-shell {
          max-width: 920px;
          margin: 0 auto;
          background: var(--woice-bg);
          color: var(--woice-text);
          border: 1px solid var(--woice-border);
          border-radius: 14px;
          padding: 16px;
        }
        .woice-header {
          margin-bottom: 14px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .woice-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
        }
        .woice-subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--woice-subtext);
        }
        .woice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .woice-slider {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .woice-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .woice-btn {
          border: 1px solid var(--woice-border);
          background: var(--woice-surface);
          color: var(--woice-text);
          border-radius: 10px;
          font-size: 13px;
          padding: 8px 10px;
          cursor: pointer;
        }
        .woice-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .woice-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: none;
          background: var(--woice-border);
          padding: 0;
          cursor: pointer;
        }
        .woice-dot.active { background: var(--woice-accent); }
        .woice-card {
          background: var(--woice-surface);
          border: 1px solid var(--woice-border);
          border-radius: 12px;
          padding: 14px;
          min-height: 140px;
        }
        .woice-row { display: flex; align-items: center; gap: 12px; }
        .woice-col { display: flex; flex-direction: column; }
        .woice-between { justify-content: space-between; align-items: flex-start; }
        .woice-name {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: var(--woice-text);
          word-break: break-word;
        }
        .woice-date {
          margin: 0;
          font-size: 12px;
          color: var(--woice-subtext);
        }
        .woice-text {
          margin: 12px 0 0;
          font-size: 14px;
          color: var(--woice-text);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .woice-stars {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          color: #cbd5e1;
        }
        .woice-stars .filled { color: #f59e0b; }
        .woice-state {
          background: var(--woice-surface);
          border: 1px solid var(--woice-border);
          border-radius: 12px;
          padding: 24px 14px;
          text-align: center;
          font-size: 14px;
          color: var(--woice-subtext);
        }
        .woice-skeleton { pointer-events: none; }
        .woice-skeleton-circle {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: var(--woice-muted);
          animation: woicePulse 1.2s ease-in-out infinite;
        }
        .woice-skeleton-line {
          height: 10px;
          border-radius: 999px;
          background: var(--woice-muted);
          animation: woicePulse 1.2s ease-in-out infinite;
        }
        .woice-w-100 { width: 100%; }
        .woice-w-90 { width: 90%; }
        .woice-w-70 { width: 70%; }
        .woice-w-60 { width: 60%; }
        .woice-w-40 { width: 40%; }
        @keyframes woicePulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @media (max-width: 520px) {
          .woice-widget { padding: 10px; }
          .woice-shell { padding: 12px; }
        }
      `}</style>

      <section className="woice-shell" aria-busy={status === "loading"}>
        <header className="woice-header">
          <h1 className="woice-title">Testimonials</h1>
          {businessName ? <p className="woice-subtitle">{businessName}</p> : null}
        </header>

        {status === "loading" ? (
          <div className={layout === "slider" ? "woice-slider" : "woice-grid"}>
            <SkeletonCard />
            <SkeletonCard />
            {layout === "grid" ? <SkeletonCard /> : null}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="woice-state">{errorMessage || "Failed to load testimonials"}</div>
        ) : null}

        {status === "success" && !hasTestimonials ? (
          <div className="woice-state">No testimonials available yet.</div>
        ) : null}

        {status === "success" && hasTestimonials && layout === "grid" ? (
          <div className="woice-grid">
            {testimonials.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}

        {status === "success" && hasTestimonials && layout === "slider" ? (
          <div className="woice-slider">
            <TestimonialCard item={testimonials[safeIndex]} />
            {testimonials.length > 1 ? (
              <div className="woice-controls">
                <button
                  type="button"
                  className="woice-btn"
                  onClick={goPrev}
                  aria-label="Previous testimonial"
                >
                  Prev
                </button>
                <div className="woice-dots" aria-label="Choose testimonial">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`woice-dot ${index === safeIndex ? "active" : ""}`}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="woice-btn"
                  onClick={goNext}
                  aria-label="Next testimonial"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
