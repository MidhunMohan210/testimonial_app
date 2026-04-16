import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
const transitionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function StarButton({ active, selected, onClick, value }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:h-14 sm:w-14"
      aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
      aria-pressed={selected}
    >
      <Star
        className={`h-7 w-7 sm:h-8 sm:w-8 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
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
  const [submittedReviewText, setSubmittedReviewText] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [submittedFollowUpAcknowledgement, setSubmittedFollowUpAcknowledgement] = useState(false);
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
      contactEmail: "",
      contactPhone: "",
      allowFollowUp: false,
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
    onSuccess: (_, variables) => {
      setSubmittedState("review");
      setSubmittedReviewText(variables?.reviewText || "");
      setCopyState("idle");
      setSubmittedFollowUpAcknowledgement(false);
      setStep("done");
      setFormAlert("");
    },
    onError: (error) => {
      mapBackendErrors(error, "reviewText");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload) => submitFeedback(slug, payload),
    onSuccess: (_, variables) => {
      setSubmittedState("feedback");
      setSubmittedReviewText("");
      setCopyState("idle");
      const hasContact = Boolean(variables?.contactEmail?.trim() || variables?.contactPhone?.trim());
      setSubmittedFollowUpAcknowledgement(Boolean(variables?.allowFollowUp) && hasContact);
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
  const allowFollowUpValue = watch("allowFollowUp");

  const selectedStarsLabel = useMemo(() => {
    if (!rating) {
      return "Select a rating to continue.";
    }

    if (rating >= 4) {
      return "Next, you can share a public testimonial.";
    }

    return "Next, you can send private feedback directly to the team.";
  }, [rating]);
  const submittedReviewPreview = useMemo(() => {
    const text = submittedReviewText?.trim() || "";
    if (!text) {
      return "Review text unavailable.";
    }
    return text.length > 100 ? `${text.slice(0, 100)}...` : text;
  }, [submittedReviewText]);

  const mapBackendErrors = (error, messageField) => {
    const details = error.response?.data?.details;

    if (!Array.isArray(details) || details.length === 0) {
      setFormAlert(error.response?.data?.message || "Something went wrong. Please try again.");
      return;
    }

    setFormAlert(details[0]?.message || "Please review the highlighted fields.");

    details.forEach(({ field, message }) => {
      const normalizedField = field === "name" ? "customerName" : field;

      if (
        ["customerName", "reviewText", "feedbackText", "contactEmail", "contactPhone", "allowFollowUp"].includes(
          normalizedField,
        )
      ) {
        setError(normalizedField, { type: "server", message });
        return;
      }

      if (normalizedField === messageField || (normalizedField === "message" && messageField)) {
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
    setSubmittedReviewText("");
    setCopyState("idle");
    setSubmittedFollowUpAcknowledgement(false);
    clearErrors();
    reset(undefined, { keepValues: true, keepErrors: false });
  };

  const handleInlineRatingChange = (selectedRating) => {
    setRating(selectedRating);
    setFormType(selectedRating >= 4 ? "review" : "feedback");
    setFormAlert("");
    clearErrors();
  };

  const handleFormSubmit = async ({
    customerName,
    reviewText,
    feedbackText,
    contactEmail,
    contactPhone,
    allowFollowUp,
  }) => {
    const trimmedName = customerName.trim();
    const trimmedReviewText = reviewText.trim();
    const trimmedFeedbackText = feedbackText.trim();
    const trimmedContactEmail = contactEmail.trim();
    const trimmedContactPhone = contactPhone.trim();
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
      contactEmail: trimmedContactEmail,
      contactPhone: trimmedContactPhone,
      allowFollowUp: Boolean(allowFollowUp),
    });
  };

  const handleCopyReviewText = async () => {
    if (!submittedReviewText?.trim()) {
      return;
    }

    const textToCopy = submittedReviewText.trim();

    const setTimedState = (state) => {
      setCopyState(state);
      window.setTimeout(() => setCopyState("idle"), 2200);
    };

    try {
      await navigator.clipboard.writeText(textToCopy);
      setTimedState("copied");
      return;
    } catch {
      // Fallback for browsers/environments where clipboard API is blocked.
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        setTimedState("copied");
      } else {
        setTimedState("error");
      }
    } catch {
      setTimedState("error");
    }
  };

  if (businessQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:py-10">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:py-10">
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 sm:py-10">
      <Card className="w-full max-w-[480px] border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
        <CardHeader className="space-y-3 pb-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
            {businessName}
          </p>
          {step === "rating" ? (
            <CardTitle className="text-2xl text-slate-950 sm:text-3xl">How was your experience?</CardTitle>
          ) : step === "form" && formType === "review" ? (
            <CardTitle className="text-2xl text-slate-950 sm:text-3xl">What did you love most?</CardTitle>
          ) : step === "form" ? (
            <CardTitle className="text-2xl text-slate-950 sm:text-3xl">We&apos;re sorry your experience wasn&apos;t great</CardTitle>
          ) : submittedState === "review" ? (
            <CardTitle className="text-2xl text-slate-950 sm:text-3xl">Awesome — thanks for your feedback!</CardTitle>
          ) : (
            <CardTitle className="text-2xl text-slate-950 sm:text-3xl">
              Thanks — we really appreciate your feedback
            </CardTitle>
          )}
          {step === "form" && formType === "feedback" ? (
            <p className="text-sm text-slate-500">Tell us what went wrong so the team can improve.</p>
          ) : null}
        </CardHeader>

        <CardContent className="p-5 pt-4 sm:p-8 sm:pt-4">
          <AnimatePresence mode="wait" initial={false}>
            {step === "rating" ? (
              <motion.div
                key="rating-step"
                className="space-y-6"
                variants={transitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <p className="text-center text-sm font-medium text-slate-600">
                  Rate your experience with {businessName}.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <StarButton
                        key={value}
                        value={value}
                        active={value <= rating}
                        selected={value === rating}
                        onClick={() => handleRatingSelect(value)}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-sm text-slate-500">{selectedStarsLabel}</p>
              </motion.div>
            ) : step === "form" ? (
              <motion.form
                key="form-step"
                className="space-y-5"
                onSubmit={handleSubmit(handleFormSubmit)}
                noValidate
                variants={transitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {formAlert ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formAlert}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Your rating
                  </p>
                  <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Edit rating">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <StarButton
                          key={value}
                          value={value}
                          active={value <= rating}
                          selected={value === rating}
                          onClick={() => handleInlineRatingChange(value)}
                        />
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {formType === "review" ? (
                    <motion.div
                      key="review-form"
                      className="space-y-5"
                      variants={transitionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Your name (optional)</Label>
                        <Input
                          id="customerName"
                          placeholder="Jane Doe"
                          aria-invalid={errors.customerName ? "true" : "false"}
                          className={errors.customerName ? "border-red-500 focus:ring-red-500" : ""}
                          {...register("customerName", {
                            validate: (value) => {
                              const trimmed = value.trim();

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

                      <div className="space-y-2">
                        <Label htmlFor="reviewText">Share your experience</Label>
                        <p className="text-sm text-slate-500">
                          This may be shown on the website after approval.
                        </p>
                        <Textarea
                          id="reviewText"
                          maxLength={MAX_MESSAGE_LENGTH}
                          placeholder="What stood out? Service, quality, staff, or overall experience..."
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <div className="min-h-[1.25rem]">
                            {errors.reviewText ? (
                              <p className="text-sm text-red-600">{errors.reviewText.message}</p>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-400">
                            {reviewTextValue.length} / {MAX_MESSAGE_LENGTH}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="feedback-form"
                      className="space-y-5"
                      variants={transitionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Your name (optional)</Label>
                        <Input
                          id="customerName"
                          placeholder="Jane Doe"
                          aria-invalid={errors.customerName ? "true" : "false"}
                          className={errors.customerName ? "border-red-500 focus:ring-red-500" : ""}
                          {...register("customerName", {
                            validate: (value) => {
                              const trimmed = value.trim();

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

                      <div className="space-y-2">
                        <Label htmlFor="feedbackText">What went wrong?</Label>
                        <p className="text-sm text-slate-500">
                          This feedback is private and goes directly to the team. It will not be
                          published.
                        </p>
                        <Textarea
                          id="feedbackText"
                          maxLength={MAX_MESSAGE_LENGTH}
                          placeholder="Share what could have been better about your experience..."
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <div className="min-h-[1.25rem]">
                            {errors.feedbackText ? (
                              <p className="text-sm text-red-600">{errors.feedbackText.message}</p>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-400">
                            {feedbackTextValue.length} / {MAX_MESSAGE_LENGTH}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">
                          Want the team to follow up and help?
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Email (optional)</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="you@example.com"
                            aria-invalid={errors.contactEmail ? "true" : "false"}
                            className={errors.contactEmail ? "border-red-500 focus:ring-red-500" : ""}
                            {...register("contactEmail", {
                              validate: (value) => {
                                const trimmed = value.trim();
                                if (!trimmed) {
                                  return true;
                                }
                                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
                                  ? true
                                  : "Enter a valid email address";
                              },
                            })}
                          />
                          {errors.contactEmail ? (
                            <p className="text-sm text-red-600">{errors.contactEmail.message}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Phone (optional)</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="+1 555 123 4567"
                            aria-invalid={errors.contactPhone ? "true" : "false"}
                            className={errors.contactPhone ? "border-red-500 focus:ring-red-500" : ""}
                            {...register("contactPhone", {
                              validate: (value) => {
                                const trimmed = value.trim();
                                if (!trimmed) {
                                  return true;
                                }
                                return trimmed.length <= 30
                                  ? true
                                  : "Phone number must be 30 characters or fewer";
                              },
                            })}
                          />
                          {errors.contactPhone ? (
                            <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
                          ) : null}
                        </div>
                        <label
                          htmlFor="allowFollowUp"
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-1 py-1 text-sm text-slate-600 transition hover:border-slate-200"
                        >
                          <input
                            id="allowFollowUp"
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-400"
                            {...register("allowFollowUp")}
                          />
                          <span>I&apos;m okay with being contacted about this feedback.</span>
                        </label>
                        {allowFollowUpValue ? (
                          <p className="text-xs text-slate-500">
                            If provided, your contact details help the team follow up faster.
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? formType === "review"
                      ? "Sharing..."
                      : "Sending..."
                    : formType === "review"
                      ? "Share Feedback"
                      : "Send Private Feedback"}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="done-step"
                className="space-y-5 text-center"
                variants={transitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {submittedState === "review" ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <p className="text-sm font-medium text-slate-700">You rated us {rating} stars</p>
                    <div className="flex items-center gap-1" aria-label={`You rated ${rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <Star
                            key={`submitted-rating-${value}`}
                            className={`h-4 w-4 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                            aria-hidden="true"
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                <p className="text-sm leading-7 text-slate-500">
                  {submittedState === "review"
                    ? "Your testimonial was submitted and may appear after approval."
                    : "Your message has been shared privately with the team and will help us improve."}
                </p>
                {submittedState === "review" ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {submittedReviewPreview}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCopyReviewText}
                      disabled={!submittedReviewText?.trim()}
                    >
                      {copyState === "copied"
                        ? "Copied to clipboard"
                        : copyState === "error"
                          ? "Copy failed, try again"
                          : "Copy review text"}
                    </Button>
                    {googleReviewUrl ? (
                      <>
                        <p className="text-sm text-slate-500">
                          If you have a moment, sharing it on Google really helps.
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => window.open(googleReviewUrl, "_blank", "noopener,noreferrer")}
                        >
                          Share on Google
                        </Button>
                        <p className="text-xs text-slate-400">Takes less than a minute</p>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">It will not be published.</p>
                    {submittedFollowUpAcknowledgement ? (
                      <p className="text-sm text-slate-500">
                        If needed, the team may follow up using the contact details you shared.
                      </p>
                    ) : null}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
