import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getBusinessBySlug,
  submitFeedback,
  submitReview,
} from "../api/publicReviewApi";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

function StarButton({ active, onClick, value }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
    >
      <Star
        className={`h-8 w-8 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
      />
    </button>
  );
}

export default function ReviewFormPage() {
  const { slug = "" } = useParams();
  const [step, setStep] = useState("rating");
  const [formType, setFormType] = useState("review");
  const [rating, setRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState("");

  const businessQuery = useQuery({
    queryKey: ["public-review-business", slug],
    queryFn: () => getBusinessBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => submitReview(slug, payload),
    onSuccess: () => {
      setStep("done");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload) => submitFeedback(slug, payload),
    onSuccess: () => {
      setStep("done");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send feedback");
    },
  });

  const isSubmitting = reviewMutation.isPending || feedbackMutation.isPending;
  const businessName = businessQuery.data?.businessName || "Business";
  const googleReviewLink = businessQuery.data?.googleReviewLink || "";

  const selectedStarsLabel = useMemo(() => {
    if (!rating) {
      return "Tap a star to continue";
    }

    return `${rating} out of 5 selected`;
  }, [rating]);

  const handleRatingSelect = (selectedRating) => {
    setRating(selectedRating);
    setFormType(selectedRating >= 4 ? "review" : "feedback");
    setStep("form");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formType === "review") {
      await reviewMutation.mutateAsync({
        customerName,
        rating,
        reviewText: message,
      });
      return;
    }

    await feedbackMutation.mutateAsync({
      customerName,
      rating,
      feedbackText: message,
    });
  };

  if (businessQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <Card className="w-full max-w-[480px] border-slate-200 bg-white">
          <CardContent className="p-8 text-center text-sm text-slate-500">
            Loading review form...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (businessQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <Card className="w-full max-w-[480px] border-slate-200 bg-white">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-950">Review link not found</h1>
            <p className="mt-2 text-sm text-slate-500">
              This business link is invalid or no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-[480px] border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
        <CardHeader className="space-y-3 pb-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
            {businessName}
          </p>
          {step === "rating" ? (
            <CardTitle className="text-3xl text-slate-950">How was your experience?</CardTitle>
          ) : step === "form" && formType === "review" ? (
            <CardTitle className="text-3xl text-slate-950">
              Tell others about your experience
            </CardTitle>
          ) : step === "form" ? (
            <CardTitle className="text-3xl text-slate-950">
              We&apos;re sorry to hear that. What went wrong?
            </CardTitle>
          ) : formType === "review" ? (
            <CardTitle className="text-3xl text-slate-950">Thank you! 🎉</CardTitle>
          ) : (
            <CardTitle className="text-3xl text-slate-950">
              Thanks for letting us know
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-4 sm:p-8 sm:pt-4">
          {step === "rating" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <StarButton
                      key={value}
                      value={value}
                      active={value <= rating}
                      onClick={() => handleRatingSelect(value)}
                    />
                  );
                })}
              </div>
              <p className="text-center text-sm text-slate-500">{selectedStarsLabel}</p>
            </div>
          ) : step === "form" ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {formType === "feedback" ? (
                <p className="text-sm text-slate-500">
                  Your feedback is private and only visible to the business owner.
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="customerName">Your name (optional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {formType === "review" ? "Your review" : "Tell us what went wrong"}
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={
                    formType === "review"
                      ? "Share a few words about your experience"
                      : "Help us understand what happened"
                  }
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : formType === "review"
                    ? "Submit Review"
                    : "Send Feedback"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <p className="text-sm text-slate-500">
                {formType === "review"
                  ? "Your review has been submitted."
                  : "We&apos;ll work on improving your experience."}
              </p>
              {formType === "review" && googleReviewLink ? (
                <Button
                  className="w-full"
                  onClick={() => window.open(googleReviewLink, "_blank", "noopener,noreferrer")}
                >
                  Also post on Google ↗
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
