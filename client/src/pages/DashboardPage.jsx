import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  EyeOff,
  Inbox,
  LayoutGrid,
  MessageCirclePlus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { getTestimonials } from "../api/testimonialApi";
import SendRequestModal from "../components/SendRequestModal";
import TestimonialCard from "../components/TestimonialCard";
import WhatsAppEmbeddedSignupButton from "../components/WhatsAppEmbeddedSignupButton";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const summaryConfig = [
  {
    key: "total",
    label: "Total testimonials",
    description: "All feedback collected across channels",
    icon: LayoutGrid,
  },
  {
    key: "approved",
    label: "Approved",
    description: "Ready to reuse in marketing and sales",
    icon: CheckCircle2,
  },
  {
    key: "pending",
    label: "Pending",
    description: "Waiting for review before publishing",
    icon: Inbox,
  },
  {
    key: "hidden",
    label: "Hidden",
    description: "Archived from public-facing use",
    icon: EyeOff,
  },
];

export default function DashboardPage() {
  const [sendOpen, setSendOpen] = useState(false);

  const allTestimonialsQuery = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials("all"),
  });

  const summary = allTestimonialsQuery.data?.summary || {
    total: 0,
    approved: 0,
    pending: 0,
    hidden: 0,
  };

  const insights = useMemo(() => {
    const testimonials = allTestimonialsQuery.data?.data || [];
    const total = summary.total || 0;
    const averageRating =
      testimonials.length > 0
        ? (
            testimonials.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
            testimonials.length
          ).toFixed(1)
        : "0.0";
    const approvalRate = total ? Math.round((summary.approved / total) * 100) : 0;
    const whatsappCount = testimonials.filter((item) => item.source !== "manual").length;
    const latestDate = testimonials[0]?.collectedAt
      ? new Date(testimonials[0].collectedAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No entries yet";

    return [
      {
        label: "Average rating",
        value: averageRating,
        suffix: "/5",
        helper: "Quality signal from collected testimonials",
        icon: Star,
      },
      {
        label: "Approval rate",
        value: `${approvalRate}%`,
        helper: "Portion of feedback ready for reuse",
        icon: TrendingUp,
      },
      {
        label: "WhatsApp sourced",
        value: whatsappCount,
        helper: `Latest testimonial on ${latestDate}`,
        icon: Sparkles,
      },
    ];
  }, [allTestimonialsQuery.data, summary]);

  const recentTestimonials = (allTestimonialsQuery.data?.data || []).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-6 text-white shadow-soft sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_left,rgba(16,185,129,0.18),transparent_24%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-grid bg-[length:42px_42px] opacity-10 lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:items-end">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                Woice overview
              </span>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Keep the dashboard focused on health, trends, and quick actions.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Use this page for a fast overview, then jump into Testimonials for moderation or Requests for collection.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="gap-2 bg-white text-slate-950 hover:bg-slate-100" onClick={() => setSendOpen(true)}>
                  <MessageCirclePlus className="h-4 w-4" />
                  Send request
                </Button>
                <Link to="/testimonials">
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Open testimonials
                  </Button>
                </Link>
                <Link to="/send-request">
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Open requests
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-white">
                  Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {insights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-black/10 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">{item.label}</p>
                        <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold">
                        {item.value}
                        {item.suffix ? (
                          <span className="ml-1 text-sm font-medium text-slate-300">
                            {item.suffix}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">{item.helper}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryConfig.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.key}
                className="border-white/80 bg-white/85 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-950">
                    {summary[item.key]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
          <Card className="border-white/80 bg-white/85">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-xl font-bold text-slate-950">
                  Recent testimonials
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  A quick look at the latest customer feedback coming into Woice.
                </p>
              </div>
              <Link to="/testimonials">
                <Button variant="outline">View all</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTestimonials.length ? (
                recentTestimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial._id} testimonial={testimonial} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
                  <h3 className="text-lg font-semibold text-slate-950">No testimonials yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start collecting feedback from the Requests page and your latest testimonials will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/80 bg-white/85">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-slate-950">
                  Quick actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-center" onClick={() => setSendOpen(true)}>
                  Send a new request
                </Button>
                <WhatsAppEmbeddedSignupButton />
                <Link to="/testimonials" className="block">
                  <Button variant="outline" className="w-full justify-center">
                    Review testimonials
                  </Button>
                </Link>
                <Link to="/send-request" className="block">
                  <Button variant="ghost" className="w-full justify-center">
                    Open request tools
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-white/80 bg-white/85">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-slate-950">
                  Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Dashboard</p>
                  <p className="mt-1">Overview, trends, recent activity, and quick entry points.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Testimonials</p>
                  <p className="mt-1">Full review workflow, filtering, moderation, and pagination later.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Requests</p>
                  <p className="mt-1">Sending WhatsApp requests and adding testimonials manually.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <SendRequestModal open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}
