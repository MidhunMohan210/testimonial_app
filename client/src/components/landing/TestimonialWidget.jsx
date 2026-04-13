import { useEffect, useRef } from "react";

export default function TestimonialWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ✅ Prevent duplicate iframe
    if (container.querySelector("iframe")) return;

    const iframe = document.createElement("iframe");
    iframe.src =
      "https://www.woice.it.com/widget/slider/woice-pxiuk?";
    iframe.width = "100%";
    iframe.height = "700";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.transition = "height 0.3s ease";
    iframe.setAttribute("scrolling", "no");

    container.appendChild(iframe);

    const handleMessage = (event) => {
      if (event.origin !== "https://www.woice.it.com") return;
      if (!event.data || event.data.type !== "RESIZE_IFRAME") return;

      iframe.style.height = event.data.height + "px";
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <div ref={containerRef}></div>;
}