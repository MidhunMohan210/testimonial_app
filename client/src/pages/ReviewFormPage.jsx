import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
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

const MAX_MESSAGE_LENGTH = 500;

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
  const [submittedState, setSubmittedState] = useState(null);
  const [formAlert, setFormAlert] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      customerName: "",
      reviewText: "",
      feedbackText: "",
    },
  });

  const businessQuery = useQuery({
    queryKey: ["public-review-business", slug],
    queryFn: () => getBusinessBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload) => submitReview(slug, payload),
    onSuccess: () => {
      setSubmittedState("review");
      setStep("done");
      setFormAlert("");
    },
    onError: (error) => {
      mapBackendErrors(error, "reviewText");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload) => submitFeedback(slug, payload),
    onSuccess: () => {
      setSubmittedState("feedback");
      setStep("done");
      setFormAlert("");
    },
    onError: (error) => {
      mapBackendErrors(error, "feedbackText");
    },
  });

  const isSubmitting = reviewMutation.isPending || feedbackMutation.isPending;
  const businessName = businessQuery.data?.businessName || "Business";
  const googleReviewUrl = businessQuery.data?.googleReviewLink || "";
  const reviewTextValue = watch("reviewText") || "";
  const feedbackTextValue = watch("feedbackText") || "";

  const selectedStarsLabel = useMemo(() => {
    if (!rating) {
      return "Select a rating to continue.";
    }

    if (rating >= 4) {
      return "Next, you can share a public testimonial.";
    }

    return "Next, you can send private feedback directly to the team.";
  }, [rating]);

  const mapBackendErrors = (error, messageField) => {
    const details = error.response?.data?.details;

    if (!Array.isArray(details) || details.length === 0) {
      setFormAlert(error.response?.data?.message || "Something went wrong. Please try again.");
      return;
    }

    setFormAlert(details[0]?.message || "Please review the highlighted fields.");

    details.forEach(({ field, message }) => {
      if (field === "customerName" || field === "name") {
        setError("customerName", { type: "server", message });
      }

      if (
        field === messageField ||
        (field === "message" && messageField) ||
        (field === "reviewText" && messageField === "reviewText") ||
        (field === "feedbackText" && messageField === "feedbackText")
      ) {
        setError(messageField, { type: "server", message });
      }
    });
  };

  const handleRatingSelect = (selectedRating) => {
    setRating(selectedRating);
    setFormType(selectedRating >= 4 ? "review" : "feedback");
    setStep("form");
    setFormAlert("");
    setSubmittedState(null);
    clearErrors();
    reset(
      {
        customerName: "",
        reviewText: "",
        feedbackText: "",
      },
      {
        keepErrors: false,
      },
    );
  };

  const handleFormSubmit = async ({
    customerName,
    reviewText,
    feedbackText,
  }) => {
    const trimmedName = customerName.trim();
    const trimmedReviewText = reviewText.trim();
    const trimmedFeedbackText = feedbackText.trim();
    setFormAlert("");
    clearErrors();

    if (formType === "review") {
      await reviewMutation.mutateAsync({
        customerName: trimmedName,
        rating,
        reviewText: trimmedReviewText,
      });
      return;
    }

    await feedbackMutation.mutateAsync({
      customerName: trimmedName,
      rating,
      feedbackText: trimmedFeedbackText,
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
            <CardTitle className="text-2xl text-slate-950 tracking-normal ">
              Tell others about your experience
            </CardTitle>
          ) : step === "form" ? (
            <CardTitle className="text-3xl text-slate-950">
              Help the team improve
            </CardTitle>
          ) : submittedState === "review" ? (
            <CardTitle className="text-3xl text-slate-950">Thanks for your review!</CardTitle>
          ) : (
            <CardTitle className="text-3xl text-slate-950">
              Thanks for your honest feedback
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-4 sm:p-8 sm:pt-4">
          {step === "rating" ? (
            <div className="space-y-6">
              <p className="text-center text-sm font-medium text-slate-600">
                Rate your experience with {businessName}.
              </p>
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
            <form className="space-y-5" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
              {formAlert ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formAlert}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="customerName">
                  {formType === "review" ? "Your name" : "Your name (optional)"}
                </Label>
                <Input
                  id="customerName"
                  placeholder="Jane Doe"
                  aria-invalid={errors.customerName ? "true" : "false"}
                  className={errors.customerName ? "border-red-500 focus:ring-red-500" : ""}
                  {...register("customerName", {
                    validate: (value) => {
                      const trimmed = value.trim();

                      if (formType === "review" && trimmed.length < 1) {
                        return "Name is required";
                      }

                      if (trimmed.length > 100) {
                        return "Name must be 100 characters or fewer";
                      }

                      return true;
                    },
                  })}
                />
                {errors.customerName ? (
                  <p className="text-sm text-red-600">{errors.customerName.message}</p>
                ) : null}
              </div>

              {formType === "review" ? (
                <div className="space-y-2">
                  <Label htmlFor="reviewText">Share what you liked most.</Label>
                  <p className="text-sm text-slate-500">
                    This is for a public testimonial and may appear after approval.
                  </p>
                  <Textarea
                    id="reviewText"
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="They loved the quick service and friendly staff..."
                    aria-invalid={errors.reviewText ? "true" : "false"}
                    className={errors.reviewText ? "border-red-500 focus:ring-red-500" : ""}
                    {...register("reviewText", {
                      validate: (value) => {
                        const trimmed = value.trim();

                        if (trimmed.length < 10) {
                          return "Review must be at least 10 characters";
                        }

                        if (trimmed.length > MAX_MESSAGE_LENGTH) {
                          return "Review must be 500 characters or fewer";
                        }

                        return true;
                      },
                    })}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      {errors.reviewText ? (
                        <p className="text-sm text-red-600">{errors.reviewText.message}</p>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400">
                      {reviewTextValue.length} / {MAX_MESSAGE_LENGTH}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="feedbackText">Tell us what could have been better</Label>
                  <p className="text-sm text-slate-500">
                    This feedback is private and goes directly to the team. It will not be published.
                  </p>
                  <Textarea
                    id="feedbackText"
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="Share what could have been improved about your experience..."
                    aria-invalid={errors.feedbackText ? "true" : "false"}
                    className={errors.feedbackText ? "border-red-500 focus:ring-red-500" : ""}
                    {...register("feedbackText", {
                      validate: (value) => {
                        const trimmed = value.trim();

                        if (trimmed.length < 10) {
                          return "Feedback must be at least 10 characters";
                        }

                        if (trimmed.length > MAX_MESSAGE_LENGTH) {
                          return "Feedback must be 500 characters or fewer";
                        }

                        return true;
                      },
                    })}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      {errors.feedbackText ? (
                        <p className="text-sm text-red-600">{errors.feedbackText.message}</p>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400">
                      {feedbackTextValue.length} / {MAX_MESSAGE_LENGTH}
                    </p>
                  </div>
                </div>
              )}

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
              <p className="text-sm leading-7 text-slate-500">
                {submittedState === "review"
                  ? "Your testimonial was submitted and may appear after approval."
                  : "Your feedback has been sent privately to the team."}
              </p>
              {submittedState === "review" && googleReviewUrl ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(googleReviewUrl, "_blank", "noopener,noreferrer")}
                >
                  Also review on Google
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
