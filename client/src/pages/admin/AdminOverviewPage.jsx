import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquareText,
  ShieldBan,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { getAdminOverview } from "../../api/adminApi";
import { EmptyStateCard, ErrorStateCard } from "../../components/StateCard";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

const formatNumber = (value) => new Intl.NumberFormat("en").format(value || 0);

const formatDate = (value) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getStatusClass = (status) =>
  status === "suspended"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <Card className="border-white/80 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)]">
      <CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
            {formatNumber(value)}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-2xl" />
    </div>
  );
}

export default function AdminOverviewPage() {
  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: getAdminOverview,
  });

  if (overviewQuery.isLoading) {
    return <OverviewLoading />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorStateCard
        message={
          overviewQuery.error?.response?.data?.message ||
          "We could not load the admin overview."
        }
        onRetry={() => overviewQuery.refetch()}
      />
    );
  }

  const summary = overviewQuery.data?.summary || {};
  const recentBusinesses = overviewQuery.data?.recentBusinesses || [];
  const metrics = [
    {
      label: "Total businesses",
      value: summary.totalBusinesses,
      icon: Building2,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      label: "Active",
      value: summary.activeBusinesses,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Suspended",
      value: summary.suspendedBusinesses,
      icon: ShieldBan,
      tone: "bg-red-100 text-red-700",
    },
    {
      label: "Beta",
      value: summary.betaBusinesses,
      icon: Sparkles,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "This month",
      value: summary.businessesRegisteredThisMonth,
      icon: Clock,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Testimonials",
      value: summary.totalTestimonials,
      icon: Star,
      tone: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Approved",
      value: summary.approvedTestimonials,
      icon: CheckCircle2,
      tone: "bg-teal-100 text-teal-700",
    },
    {
      label: "Pending",
      value: summary.pendingTestimonials,
      icon: MessageSquareText,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "Private feedback",
      value: summary.totalPrivateFeedback,
      icon: Users,
      tone: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="overflow-hidden border-white/80 bg-white shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent businesses</h2>
              <p className="mt-1 text-sm text-slate-500">
                Newest Woice accounts and their current activity.
              </p>
            </div>
            <Link
              to="/admin/businesses"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
            >
              View all
            </Link>
          </div>

          {recentBusinesses.length === 0 ? (
            <div className="p-5">
              <EmptyStateCard
                title="No businesses yet"
                description="Businesses will appear here as soon as teams register for Woice."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Business</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Registered</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Testimonials</th>
                    <th className="px-4 py-3 font-semibold">Last activity</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBusinesses.map((business) => (
                    <tr key={business._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {business.businessName || "Untitled business"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.owner?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.owner?.email || "Not provided"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(business.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getStatusClass(business.accountStatus)}>
                          {business.accountStatus || "active"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatNumber(business.usage?.totalTestimonials)}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(business.lastActivity)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/businesses/${business._id}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
