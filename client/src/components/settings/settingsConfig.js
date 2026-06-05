import { Building2, Link2, Star } from "lucide-react";

export const SETTINGS_SECTIONS = [
  {
    id: "business-profile",
    label: "Business Profile",
    description: "Business details",
    detailDescription: "Manage your business name and slug.",
    icon: Building2,
    iconClassName: "border-blue-100 bg-blue-50 text-blue-700",
  },
  {
    id: "review-flow",
    label: "Review Flow",
    description: "Google review destination",
    detailDescription:
      "After a positive testimonial, customers can be guided to leave a Google review.",
    icon: Star,
    iconClassName: "border-amber-100 bg-amber-50 text-amber-700",
  },
  {
    id: "share-feedback",
    label: "Share Feedback",
    description: "Link, message, and QR code",
    detailDescription:
      "Share your feedback link with customers using a direct link, WhatsApp message, or QR code.",
    icon: Link2,
    iconClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
];

export const SETTINGS_SECTION_IDS = new Set(
  SETTINGS_SECTIONS.map((section) => section.id),
);
