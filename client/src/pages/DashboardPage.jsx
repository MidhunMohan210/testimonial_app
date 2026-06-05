import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CircleCheckBig,
  CheckCircle2,
  Copy,
  ArrowUpRight,
  ExternalLink,
  TrendingUp,
  Star,
  MessageCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import {
  getMyBusiness,
  getPrivateFeedback,
  updateBusiness,
} from "../api/businessApi";
import { getTestimonials } from "../api/testimonialApi";
import DashboardOnboarding from "../components/DashboardOnboarding";
import ManualAddModal from "../components/ManualAddModal";
import { ErrorStateCard } from "../components/StateCard";
import TestimonialCard from "../components/TestimonialCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { getPublicAppUrl } from "../lib/publicUrl";

function WavesDecoration() {
  return (
    <svg
      width="64"
      height="40"
      viewBox="0 0 64 40"
      fill="none"
      className="opacity-75"
    >
      <path
        d="M0 10 Q 8 0, 16 10 T 32 10 T 48 10 T 64 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 22 Q 8 12, 16 22 T 32 22 T 48 22 T 64 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 34 Q 8 24, 16 34 T 32 34 T 48 34 T 64 34"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function CurveDecoration() {
  return (
    <svg
      className="absolute bottom-0 left-0 h-20 w-full opacity-60" // reduced height
      viewBox="0 0 400 100"
      preserveAspectRatio="xMidYMax slice"
    >
      <path
        d="M0 91 C 170 60, 246 112, 400 25 L 400 100 L 0 100 Z" // curve starts lower
        fill="rgba(255,255,255,0.14)"
      />
      <path
        d="M0 91 C 178 60, 246 112, 400 25" // matching dashed line
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BarsDecoration() {
  const heights = [24, 40, 56, 64, 48, 32, 20];

  return (
    <div className="flex h-16 shrink-0 items-end gap-1.5 opacity-80">
      {heights.map((height, index) => (
        <div
          key={index}
          className="w-1.5 rounded-t-sm bg-white"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

function GridDecoration() {
  const rows = [
    [false, true, false, false],
    [false, true, true, false],
    [true, true, true, false],
    [true, true, true, true],
  ];

  return (
    <div className="flex shrink-0 flex-col gap-1.5 opacity-80">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((filled, colIndex) => (
            <div
              key={colIndex}
              className={`h-1.5 w-3 rounded-sm ${
                filled ? "bg-white" : "bg-white/35"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="min-h-screen pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-5">
        <div className="space-y-5">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[170px] w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-[360px] w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildShareMessage(name, link) {
  if (!link) {
    return "";
  }

  const safeName = name?.trim() || "our business";

  return `Hi, thank you for choosing ${safeName}.

We’d love to hear about your experience. Please share your feedback here:
${link}

Your feedback helps us improve and also helps other customers trust us.`;
}

async function copyText(value) {
  if (!value) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to execCommand below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [manualOpen, setManualOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [shareName, setShareName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareMessageCopied, setShareMessageCopied] = useState(false);

  const allTestimonialsQuery = useQuery({
    queryKey: ["testimonials", "dashboard"],
    queryFn: () => getTestimonials("all", { limit: 20 }),
  });

  // console.log(business);

  const businessQuery = useQuery({
    queryKey: ["business", "me"],
    queryFn: getMyBusiness,
  });
  const privateFeedbackQuery = useQuery({
    queryKey: ["private-feedback", "dashboard"],
    queryFn: () => getPrivateFeedback({ limit: 1 }),
  });

  useEffect(() => {
    setGoogleReviewLink(businessQuery.data?.googleReviewLink || "");
  }, [businessQuery.data?.googleReviewLink]);

  const businessMutation = useMutation({
    mutationFn: updateBusiness,
    onSuccess: async () => {
      toast.success("Business settings updated");
      setSettingsOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["business", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["auth"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update business");
    },
  });

  const summary = allTestimonialsQuery.data?.summary || {
    total: 0,
    approved: 0,
    pending: 0,
    hidden: 0,
  };

  const businessName = businessQuery.data?.businessName || "Business";
  const businessSlug = businessQuery.data?.slug || "";
  const privateFeedbackCount = privateFeedbackQuery.data?.summary?.total || 0;
  const publicAppUrl = getPublicAppUrl();

  const reviewLink = businessSlug
    ? `${publicAppUrl}/r/${businessSlug}`
    : "";
  const publicTestimonialsLink = businessSlug
    ? `${publicAppUrl}/p/${businessSlug}`
    : "";
  const widgetSlug = businessSlug || "";
  const widgetOrigin = publicAppUrl;
  const iframeCode = widgetSlug
    ? `<div
  class="woice-testimonial-widget"
  data-business-slug="${widgetSlug}"
  data-theme="light"
  data-layout="slider"
  data-height="420"
></div>
<script
  src="${widgetOrigin}/embed.js"
  data-base-url="${widgetOrigin}"
  defer
></script>`
    : "";
  const recentTestimonials = (allTestimonialsQuery.data?.data || []).slice(
    0,
    3,
  );
  const hasTestimonials = recentTestimonials.length > 0;
  const isDashboardLoading =
    allTestimonialsQuery.isLoading || businessQuery.isLoading;
  const isDashboardError =
    allTestimonialsQuery.isError || businessQuery.isError;

  const insights = useMemo(() => {
    const testimonials = allTestimonialsQuery.data?.data || [];
    const total = summary.total || 0;
    const averageRating =
      testimonials.length > 0
        ? (
            testimonials.reduce(
              (sum, item) => sum + (Number(item.rating) || 0),
              0,
            ) / testimonials.length
          ).toFixed(1)
        : "0.0";

    const approvalRate = total
      ? Math.round((summary.approved / total) * 100)
      : 0;

    const whatsappCount = testimonials.filter(
      (item) => item.source === "whatsapp",
    ).length;

    return [
      {
        label: "Avg Rating",
        value: averageRating,
        icon: Star,
        color: "text-amber-500",
        bg: "bg-amber-100",
      },
      {
        label: "Approval Rate",
        value: `${approvalRate}%`,
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-100",
      },
      {
        label: "WhatsApp",
        value: whatsappCount,
        icon: MessageCircle,
        color: "text-indigo-500",
        bg: "bg-indigo-100",
      },
    ];
  }, [allTestimonialsQuery.data, summary]);

  const defaultShareMessage = useMemo(
    () => buildShareMessage(shareName || businessName, reviewLink),
    [shareName, businessName, reviewLink],
  );

  useEffect(() => {
    if (!shareModalOpen) {
      setShareName(businessName);
      setShareMessage(buildShareMessage(businessName, reviewLink));
      setShareLinkCopied(false);
      setShareMessageCopied(false);
    }
  }, [businessName, reviewLink, shareModalOpen]);

  const handleCopyLink = async () => {
    if (!reviewLink) return;

    const didCopy = await copyText(reviewLink);

    if (didCopy) {
      setCopied(true);
      toast.success("Review link copied");
      window.setTimeout(() => setCopied(false), 2000);
      return;
    }

    toast.error("Failed to copy link");
  };

  const openShareModal = () => {
    setShareName(businessName);
    setShareMessage(buildShareMessage(businessName, reviewLink));
    setShareModalOpen(true);
  };

  const handleCopyShareLink = async () => {
    if (!reviewLink) return;

    const didCopy = await copyText(reviewLink);

    if (didCopy) {
      setShareLinkCopied(true);
      toast.success("Review link copied");
      window.setTimeout(() => setShareLinkCopied(false), 2000);
      return;
    }

    toast.error("Failed to copy link");
  };

  const handleCopyShareMessage = async () => {
    const messageToCopy = shareMessage.trim() || defaultShareMessage;

    if (!messageToCopy) return;

    const didCopy = await copyText(messageToCopy);

    if (didCopy) {
      setShareMessageCopied(true);
      toast.success("Message copied");
      window.setTimeout(() => setShareMessageCopied(false), 2000);
      return;
    }

    toast.error("Failed to copy message");
  };

  const handleShareOnWhatsApp = () => {
    const messageToShare = shareMessage.trim() || defaultShareMessage;

    if (!messageToShare) {
      toast.error("Share message is not ready yet.");
      return;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageToShare)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleSettingsSave = async (event) => {
    event.preventDefault();
    await businessMutation.mutateAsync({ googleReviewLink });
  };

  const handleCopyEmbedCode = async () => {
    if (!iframeCode) return;

    try {
      await navigator.clipboard.writeText(iframeCode);
      setEmbedCopied(true);
      toast.success("Embed code copied!");
      window.setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  const handleRetryDashboard = () => {
    allTestimonialsQuery.refetch();
    businessQuery.refetch();
  };

  const handleKpiCardNavigation = (destination) => {
    navigate(destination);
  };

  if (isDashboardLoading) {
    return <DashboardLoadingState />;
  }

  if (isDashboardError) {
    return (
      <div className="min-h-screen pb-16 font-sans">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-5">
          <ErrorStateCard
            message="We couldn’t load your dashboard right now."
            onRetry={handleRetryDashboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {/* Welcome Hero */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-3 sm:p-6 lg:col-span-4 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Dashboard Live
                </div>

                <h1 className="text-xl font-bold text-slate-700 sm:text-3xl">
                  Welcome back{" "}
                  <span className="text-black">{businessName}</span>
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                  Here is the latest snapshot of your customer feedback. Send a
                  new request to keep the momentum going.
                </p>
              </div>

              <div className="flex w-full shrink-0 gap-3 sm:w-auto">
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                  onClick={() =>
                    window.open(
                      publicTestimonialsLink,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  disabled={!publicTestimonialsLink}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Public page
                </Button>

                <Button
                  variant="outline"
                  className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                  onClick={openShareModal}
                  disabled={!reviewLink}
                >
                  <FaWhatsapp className="mr-2 h-4 w-4 text-[#25D366]" />
                  Share feedback
                </Button>

              </div>
            </div>
          </div>

          {/* Gradient KPI Cards */}
          <div className="grid grid-cols-1 gap-5 md:col-span-3 md:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
            {/* Total */}
            <button
              type="button"
              className="relative min-h-[160px] overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-5 text-left text-white shadow-lg shadow-pink-500/25 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[170px] sm:p-6"
              onClick={() => handleKpiCardNavigation("/testimonials")}
            >
              <div className="relative z-10 flex h-full items-end justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">
                    Total Feedback
                  </h3>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {summary.total}
                  </p>
                  <p className="mt-1 text-xs text-white/80">All collected</p>
                </div>
                <WavesDecoration />
              </div>
            </button>

            {/* Approved */}
            <button
              type="button"
              className="relative min-h-[160px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-left text-white shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[170px] sm:p-6"
              onClick={() =>
                handleKpiCardNavigation("/testimonials?status=approved")
              }
            >
              <div className="relative z-10 mt-5">
                <h3 className="mb-2 text-sm font-medium text-white/90">
                  Approved
                </h3>
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {summary.approved}
                </p>
                <p className="mt-1 text-xs text-white/75">Ready to publish</p>
              </div>
              <CurveDecoration />
            </button>

            {/* Pending */}
            <button
              type="button"
              className="relative min-h-[160px] overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 p-5 text-left text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[170px] sm:p-6"
              onClick={() =>
                handleKpiCardNavigation("/testimonials?status=pending")
              }
            >
              <div className="relative z-10 flex h-full items-end justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">
                    Pending Review
                  </h3>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {summary.pending}
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    Awaiting moderation
                  </p>
                </div>

                <BarsDecoration />
              </div>
            </button>

            {/* Private Feedback */}
            <button
              type="button"
              className="relative min-h-[160px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#11998e] to-[#38ef7d]

             p-5 text-left text-white shadow-lg shadow-orange-500/25 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[170px] sm:p-6"
              onClick={() => handleKpiCardNavigation("/private-feedback")}
            >
              <div className="relative z-10 flex h-full items-end justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">
                    Private Feedback
                  </h3>
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {privateFeedbackCount}
                  </p>
                  <p className="mt-1 text-xs text-white/75">Needs follow-up</p>
                </div>
                <GridDecoration />
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:col-span-3 lg:col-span-4 items-start">
            {/* Insights */}
            <div className="h-fit rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
              <h3 className="mb-5 text-base font-bold text-slate-900">
                Quick Insights
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {insights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={insight.label}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${insight.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${insight.color}`} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500">
                          {insight.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                          {insight.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {!hasTestimonials ? (
            <div className="grid grid-cols-1 gap-5 md:col-span-3 lg:col-span-4 items-start">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#eff6ff_100%)] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                      <CircleCheckBig className="h-3.5 w-3.5 text-emerald-500" />
                      First testimonial
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">
                      No testimonials yet
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Copy your review link and send it to a few customers to
                      collect your first testimonial.
                    </p>
                  </div>
                  <Button
                    className="h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800"
                    onClick={handleCopyLink}
                    disabled={!reviewLink}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy review link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:col-span-3 lg:col-span-4 items-start">
            <Card className="border-white/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent testimonials
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Review the latest customer responses coming into your
                      workspace.
                    </p>
                  </div>
                  {hasTestimonials ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl sm:w-auto"
                      onClick={() => navigate("/testimonials")}
                    >
                      View all testimonials
                    </Button>
                  ) : null}
                </div>

                <div className="mt-5">
                  {hasTestimonials ? (
                    <div className="space-y-4">
                      {recentTestimonials.map((testimonial) => (
                        <TestimonialCard
                          key={testimonial._id}
                          testimonial={testimonial}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center sm:p-8">
                      <h3 className="text-lg font-semibold text-slate-950">
                        Waiting for your first testimonial
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Once customers submit feedback, it will show up here
                        for review and approval.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 md:col-span-3 lg:col-span-4 lg:grid-cols-[1fr_1.4fr] items-start">
            {/* Share Link Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:shadow-md sm:p-6">
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>

                  <h3 className="mb-1 text-lg font-semibold text-slate-900">
                    Share Link
                  </h3>

                  <p className="mb-3 text-sm text-slate-500">
                    Send this link to customers to collect reviews instantly.
                  </p>

                  {/* Preview Link */}
                  <p className="text-xs text-slate-400 truncate">
                    {reviewLink ||
                      "Review link will appear here once your page is ready."}
                  </p>
                </div>

                <Button
                  className="mt-5 h-11 w-full rounded-xl bg-slate-900 px-4 font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-slate-800 hover:shadow-[0_18px_36px_rgba(15,23,42,0.2)] active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                  onClick={openShareModal}
                >
                  <FaWhatsapp className="mr-2 h-4 w-4 text-[#25D366]" />
                  Share feedback
                </Button>
              </div>
            </div>

            {/* Embed Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold text-slate-900">
                Embed on your website
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add this slider to your homepage to showcase your latest
                reviews.
              </p>

              <Textarea
                readOnly
                value={iframeCode}
                className="mt-4 min-h-[140px] rounded-xl border-slate-200 bg-slate-50 font-mono text-xs leading-6 text-slate-700"
              />

              <Button
                variant="outline"
                className="mt-4 h-11 rounded-2xl border-slate-300 bg-white px-4 font-semibold text-slate-700 shadow-[0_8px_24px_rgba(148,163,184,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_14px_30px_rgba(148,163,184,0.16)] active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                onClick={handleCopyEmbedCode}
                disabled={!iframeCode}
              >
                {embedCopied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ManualAddModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        activeStatus="all"
      />
      <DashboardOnboarding
        businessSlug={businessSlug}
        reviewLink={reviewLink}
        copied={copied}
        onCopyLink={handleCopyLink}
      />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Link Settings
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Set an optional Google review destination shown after a public
              review is submitted.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6 pt-2" onSubmit={handleSettingsSave}>
            <div className="space-y-2">
              <Label
                htmlFor="googleReviewLink"
                className="text-sm font-bold text-slate-700"
              >
                Google Review Link{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Input
                id="googleReviewLink"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                placeholder="https://g.page/r/..."
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              />
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-slate-900 text-base font-bold text-white shadow-lg hover:bg-slate-800"
              type="submit"
              disabled={businessMutation.isPending}
            >
              {businessMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Share feedback
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Personalize the greeting, then copy the review link or open WhatsApp with the message pre-filled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label
                htmlFor="share-name"
                className="text-sm font-bold text-slate-700"
              >
                Business name
              </Label>
              <Input
                id="share-name"
                value={shareName}
                onChange={(event) => {
                  const nextName = event.target.value;
                  const previousDefault = buildShareMessage(shareName, reviewLink);
                  setShareName(nextName);
                  setShareMessage((currentMessage) =>
                    !currentMessage.trim() || currentMessage === previousDefault
                      ? buildShareMessage(nextName, reviewLink)
                      : currentMessage,
                  );
                }}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="share-message"
                className="text-sm font-bold text-slate-700"
              >
                Greeting message
              </Label>
              <Textarea
                id="share-message"
                value={shareMessage}
                onChange={(event) => setShareMessage(event.target.value)}
                className="min-h-[220px] rounded-xl border-slate-200 bg-slate-50 px-4 py-3"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="share-review-link"
                className="text-sm font-bold text-slate-700"
              >
                Review link
              </Label>
              <Input
                id="share-review-link"
                value={reviewLink || "Review link is not available yet."}
                readOnly
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-slate-500"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-5 font-semibold text-slate-900 hover:bg-slate-50"
                onClick={handleCopyShareLink}
                disabled={!reviewLink}
              >
                {shareLinkCopied ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {shareLinkCopied ? "Copied" : "Copy review link"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-5 font-semibold text-slate-900 hover:bg-slate-50"
                onClick={handleShareOnWhatsApp}
                disabled={!reviewLink}
              >
                <FaWhatsapp className="mr-2 h-5 w-5 text-[#25D366]" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
