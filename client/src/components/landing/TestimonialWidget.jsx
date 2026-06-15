import { useEffect } from "react";
import { PUBLIC_APP_BASE_URL } from "../../lib/publicUrl";

export default function TestimonialsWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `${PUBLIC_APP_BASE_URL}/embed.js`;
    script.defer = true;
    script.setAttribute("data-base-url", PUBLIC_APP_BASE_URL);
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
