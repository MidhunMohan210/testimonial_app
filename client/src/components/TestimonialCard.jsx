import { Clock3, Phone, Quote, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import StatusBadge from "./StatusBadge";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

export default function TestimonialCard({
  testimonial,
  onStatusChange,
  isUpdating,
  onOpen,
}) {
  const collectedDate = new Date(testimonial.collectedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const customerName = testimonial.customerName || "Unnamed customer";
  const customerInitial = customerName.charAt(0).toUpperCase();
  const isReadOnly = typeof onStatusChange !== "function";
  const sourceLabel =
    testimonial.source === "manual"
      ? "Manual"
      : testimonial.source === "link"
        ? "Review Link"
        : "WhatsApp";

  return (
    <Card className="border-white/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-42px_rgba(15,23,42,0.5)]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  {customerInitial}
                </div>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{customerName}</h3>
                    <StatusBadge status={testimonial.status} />
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                      {sourceLabel}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {testimonial.source !== "link" ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {testimonial.customerPhone}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {collectedDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <StarRating rating={testimonial.rating || 0} />
                <span className="text-sm font-semibold text-slate-700">
                  {testimonial.rating || 0}/5
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-400">
                <Quote className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Customer feedback
                </span>
              </div>
              <p className="line-clamp-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-[15px]">
                {testimonial.testimonialText || "No testimonial text provided."}
              </p>
              {typeof onOpen === "function" ? (
                <Button
                  variant="outline"
                  className="mt-4 rounded-lg border-slate-200 bg-white hover:bg-slate-100"
                  onClick={() => onOpen(testimonial)}
                >
                  View full feedback
                </Button>
              ) : null}
            </div>
          </div>

          {!isReadOnly ? (
            <div className="flex min-w-[220px] flex-col gap-3 xl:pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Actions
              </p>
              {testimonial.status !== "approved" && (
                <Button
                  className="justify-center"
                  onClick={() => onStatusChange(testimonial._id, "approved")}
                  disabled={isUpdating}
                >
                  Approve testimonial
                </Button>
              )}
              {testimonial.status !== "hidden" && (
                <Button
                  variant="outline"
                  className="justify-center border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => onStatusChange(testimonial._id, "hidden")}
                  disabled={isUpdating}
                >
                  Move to hidden
                </Button>
              )}
              {testimonial.status !== "pending" && (
                <Button
                  variant="ghost"
                  className="justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  onClick={() => onStatusChange(testimonial._id, "pending")}
                  disabled={isUpdating}
                >
                  Return to pending
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
