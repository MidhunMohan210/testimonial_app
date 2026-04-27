import { useEffect } from "react";

export default function TestimonialsWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.woice.it.com/embed.js";
    script.defer = true;
    script.setAttribute("data-base-url", "https://www.woice.it.com");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="woice-testimonial-widget"
      data-business-slug="woice-pxiuk"
      data-theme="light"
      data-layout="slider"
      data-height="420"
    />
  );
}