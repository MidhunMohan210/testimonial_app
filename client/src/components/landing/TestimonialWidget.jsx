import { useEffect, useRef, useState } from "react";

export default function TestimonialWidget() {
  const containerRef = useRef(null);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ✅ Prevent duplicate iframe
    if (container.querySelector("iframe")) return;

    const iframe = document.createElement("iframe");
    iframe.src =
      // "https://www.woice.it.com/widget/slider/woice-pxiuk?";
      "http://localhost:5173/widget/slider/cliq-cmarq?";

    iframe.width = "100%";
    iframe.height = "700";
    iframe.style.backgroundColor = "white";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.opacity = "0";
    iframe.style.transition = "opacity 0.25s ease, height 0.3s ease";
    iframe.setAttribute("scrolling", "no");
    iframe.onload = () => {
      setIsFrameLoaded(true);
      iframe.style.opacity = "1";
    };

    container.appendChild(iframe);

    const handleMessage = (event) => {
      if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;
      if (!event.data || event.data.type !== "RESIZE_IFRAME") return;

      iframe.style.height = event.data.height + "px";
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (isFrameLoaded) {
      setShowSlowHint(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSlowHint(true);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isFrameLoaded]);

  return (
    <div className="relative" aria-busy={isFrameLoaded ? "false" : "true"}>
      {!isFrameLoaded ? (
        <div className="absolute inset-0 z-10 widget-fade-in rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 h-6 w-52 widget-skeleton-shimmer rounded-md" />
          <div className="space-y-3">
            <div className="h-28 rounded-xl widget-skeleton-shimmer" />
            <div className="h-28 rounded-xl widget-skeleton-shimmer" />
            <div className="h-28 rounded-xl widget-skeleton-shimmer" />
          </div>
          {showSlowHint ? (
            <p className="mt-4 text-sm text-slate-500">Still loading... please wait</p>
          ) : null}
        </div>
      ) : null}
      <div ref={containerRef}></div>
    </div>
  );
}
