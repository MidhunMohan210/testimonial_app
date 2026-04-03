import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  Inbox,
  Settings,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Star,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getMyBusiness, updateBusiness } from "../api/businessApi";
import { getTestimonials } from "../api/testimonialApi";
import SendRequestModal from "../components/SendRequestModal";
import TestimonialCard from "../components/TestimonialCard";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
      className="absolute bottom-0 left-0 h-24 w-full opacity-60"
      viewBox="0 0 400 100"
      preserveAspectRatio="xMidYMax slice"
    >
      <path
        d="M0 60 C 100 20, 200 100, 400 40 L 400 100 L 0 100 Z"
        fill="rgba(255,255,255,0.14)"
      />
      <path
        d="M0 60 C 100 20, 200 100, 400 40"
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

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [sendOpen, setSendOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState("");
  const [copied, setCopied] = useState(false);

  const allTestimonialsQuery = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials("all"),
  });

  const businessQuery = useQuery({
    queryKey: ["business", "me"],
    queryFn: getMyBusiness,
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

  const businessName = businessQuery.data?.name || "Business";
  const reviewLink = businessQuery.data?.slug
    ? `${window.location.origin}/r/${businessQuery.data.slug}`
    : "";
  const recentTestimonials = (allTestimonialsQuery.data?.data || []).slice(0, 3);

  const insights = useMemo(() => {
    const testimonials = allTestimonialsQuery.data?.data || [];
    const total = summary.total || 0;
    const averageRating =
      testimonials.length > 0
        ? (
            testimonials.reduce(
              (sum, item) => sum + (Number(item.rating) || 0),
              0
            ) / testimonials.length
          ).toFixed(1)
        : "0.0";

    const approvalRate = total
      ? Math.round((summary.approved / total) * 100)
      : 0;

    const whatsappCount = testimonials.filter(
      (item) => item.source === "whatsapp"
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

  const handleCopyLink = async () => {
    if (!reviewLink) return;

    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      toast.success("Link copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleSettingsSave = async (event) => {
    event.preventDefault();
    await businessMutation.mutateAsync({ googleReviewLink });
  };

  return (
    <div className="min-h-screen  pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {/* Welcome Hero */}
          <div className="md:col-span-3 rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Dashboard Live
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Welcome back, {businessName}.
                </h1>

                <p className="mt-2 max-w-lg text-slate-500">
                  Here is the latest snapshot of your customer feedback. Send a
                  new request to keep the momentum going.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>

                <Button
                  className="h-10 rounded-xl bg-slate-900 px-5 font-semibold text-white shadow-sm hover:bg-slate-800"
                  onClick={() => setSendOpen(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Request
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Share */}
          <div className="group relative overflow-hidden rounded-2xl bg-indigo-900 p-8 text-white shadow-[0_8px_30px_rgb(79,70,229,0.2)] md:col-span-3 lg:col-span-1">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500 blur-3xl transition-transform duration-700 group-hover:scale-150" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1 text-xl font-bold">Share Link</h3>
                <p className="mb-6 text-sm text-indigo-100">
                  Collect new reviews instantly.
                </p>
              </div>

              <Button
                className="h-10 w-full rounded-xl bg-white font-bold text-indigo-600 shadow-sm hover:bg-indigo-50"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Gradient KPI Cards */}
          <div className="grid grid-cols-1 gap-5 md:col-span-3 md:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
            {/* Total */}
            <div className="relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-lg shadow-pink-500/25 transition-transform duration-300 hover:-translate-y-1">
              <div className="relative z-10 flex h-full justify-between items-end">
                <div className="flex h-full flex-col justify-between">
                  <h3 className="text-sm font-medium text-white/90">
                    Total Feedback
                  </h3>
                  <WavesDecoration />
                </div>
                <div className="text-right">
                  <p className="mb-1 text-4xl font-bold tracking-tight">
                    {summary.total}
                  </p>
                  <p className="text-xs text-white/80">All collected</p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div className="relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-purple-500/25 transition-transform duration-300 hover:-translate-y-1">
              <div className="relative z-10">
                <h3 className="mb-2 text-sm font-medium text-white/90">
                  Approved
                </h3>
                <p className="text-4xl font-bold tracking-tight">
                  {summary.approved}
                </p>
                <p className="mt-1 text-xs text-white/75">Ready to publish</p>
              </div>
              <CurveDecoration />
            </div>

            {/* Pending */}
            <div className="relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 p-6 text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 hover:-translate-y-1">
              <div className="relative z-10 flex h-full items-end justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">
                    Pending Review
                  </h3>
                  <p className="text-4xl font-bold tracking-tight">
                    {summary.pending}
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    Awaiting moderation
                  </p>
                </div>
                <BarsDecoration />
              </div>
            </div>

            {/* Archived */}
            <div className="relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white shadow-lg shadow-orange-500/25 transition-transform duration-300 hover:-translate-y-1">
              <div className="relative z-10 flex h-full items-end justify-between gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">
                    Archived
                  </h3>
                  <p className="text-4xl font-bold tracking-tight">
                    {summary.hidden}
                  </p>
                  <p className="mt-1 text-xs text-white/75">
                    Hidden from public
                  </p>
                </div>
                <GridDecoration />
              </div>
            </div>
          </div>

          {/* Recent Testimonials */}
          <div className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h2>
              <Link to="/testimonials">
                <Button
                  variant="ghost"
                  className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  View all
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {recentTestimonials.length ? (
                recentTestimonials.map((testimonial) => (
                  <div
                    key={testimonial._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5"
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <Inbox className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    It&apos;s quiet here
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start collecting feedback to see it here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5 md:col-span-3 lg:col-span-1">
            {/* Insights */}
            <div className="flex-1 rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="mb-5 text-base font-bold text-slate-900">
                Quick Insights
              </h3>
              <div className="space-y-4">
                {insights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div key={insight.label} className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${insight.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500">
                          {insight.label}
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          {insight.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="rounded-2xl bg-slate-900 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="flex flex-col gap-3">
                <Link
                  to="/testimonials"
                  className="group flex items-center justify-between rounded-xl bg-slate-800 p-4 transition-colors hover:bg-slate-700"
                >
                  <span className="text-sm font-bold text-white">
                    Manage Reviews
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-white" />
                </Link>

                <Link
                  to="/requests"
                  className="group flex items-center justify-between rounded-xl bg-slate-800 p-4 transition-colors hover:bg-slate-700"
                >
                  <span className="text-sm font-bold text-white">
                    Send Invites
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SendRequestModal open={sendOpen} onOpenChange={setSendOpen} />

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
    </div>
  );
}