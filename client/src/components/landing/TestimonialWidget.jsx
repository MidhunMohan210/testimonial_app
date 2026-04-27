import { useEffect } from "react";

export default function TestimonialsWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "http://localhost:5173/embed.js";
    script.defer = true;
    script.setAttribute("data-base-url", "http://localhost:5173");
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