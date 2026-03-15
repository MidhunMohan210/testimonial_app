import { Clock3, MessageCircle, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import StatusBadge from "./StatusBadge";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < rating ? "text-amber-500" : "text-slate-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialCard({ testimonial, onStatusChange, isUpdating }) {
  const collectedDate = new Date(testimonial.collectedAt).toLocaleDateString();

  return (
    <Card className="border-white/80 bg-white/95">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {testimonial.customerName || "Unnamed customer"}
                </h3>
                <StatusBadge status={testimonial.status} />
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                  {testimonial.source === "manual" ? "Manual" : "WhatsApp"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {testimonial.customerPhone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  {collectedDate}
                </span>
              </div>
            </div>

            <StarRating rating={testimonial.rating || 0} />

            <p className="max-w-2xl text-sm leading-7 text-slate-700">
              {testimonial.testimonialText || "No testimonial text provided."}
            </p>
          </div>

          <div className="flex min-w-[180px] flex-row gap-2 sm:flex-col">
            {testimonial.status !== "approved" && (
              <Button
                className="flex-1"
                onClick={() => onStatusChange(testimonial._id, "approved")}
                disabled={isUpdating}
              >
                Approve
              </Button>
            )}
            {testimonial.status !== "hidden" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onStatusChange(testimonial._id, "hidden")}
                disabled={isUpdating}
              >
                Hide
              </Button>
            )}
            {testimonial.status !== "pending" && (
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => onStatusChange(testimonial._id, "pending")}
                disabled={isUpdating}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
