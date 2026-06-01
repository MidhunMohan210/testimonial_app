import { useEffect } from "react";
import { getPublicAppUrl } from "../../lib/publicUrl";

export default function TestimonialsWidget() {
  useEffect(() => {
    const publicAppUrl = getPublicAppUrl();
    const script = document.createElement("script");
    // script.src = `${publicAppUrl}/embed.js`;
    script.src = `https://app.woice.it.com/embed.js`;
    script.defer = true;
    script.setAttribute("data-base-url", "https://app.woice.it.com");
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
