import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, ShieldBan, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminBusinessById,
  updateAdminBusinessBeta,
  updateAdminBusinessStatus,
} from "../../api/adminApi";
import { ErrorStateCard } from "../../components/StateCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const statusClass = (status) =>
  status === "suspended"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

function DetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Skeleton className="h-12 w-48" />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[460px] rounded-2xl" />
        <Skeleton className="h-[460px] rounded-2xl" />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function UsageCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_36px_-30px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-950">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function AdminBusinessDetailPage() {
  const { businessId } = useParams();
  const queryClient = useQueryClient();
  const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);
  const [isBeta, setIsBeta] = useState(true);
  const [betaExpiresAt, setBetaExpiresAt] = useState("");

  const businessQuery = useQuery({
    queryKey: ["admin", "business", businessId],
    queryFn: () => getAdminBusinessById(businessId),
    enabled: Boolean(businessId),
  });

  const business = businessQuery.data?.business;

  useEffect(() => {
    if (!business) return;
    setIsBeta(Boolean(business.isBeta));
    setBetaExpiresAt(toDateInputValue(business.betaExpiresAt));
  }, [business]);

  const invalidateBusiness = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "business", businessId] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
    ]);
  };

  const statusMutation = useMutation({
    mutationFn: (accountStatus) =>
      updateAdminBusinessStatus(businessId, { accountStatus }),
    onSuccess: async (data) => {
      toast.success(
        data.accountStatus === "suspended"
          ? "Business suspended"
          : "Business activated",
      );
      setConfirmSuspendOpen(false);
      await invalidateBusiness();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const betaMutation = useMutation({
    mutationFn: () =>
      updateAdminBusinessBeta(businessId, {
        isBeta,
        betaExpiresAt: betaExpiresAt ? new Date(betaExpiresAt).toISOString() : null,
      }),
    onSuccess: async () => {
      toast.success("Beta settings updated");
      await invalidateBusiness();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update beta settings");
    },
  });

  if (businessQuery.isLoading) {
    return <DetailLoading />;
  }

  if (businessQuery.isError) {
    return (
      <ErrorStateCard
        message={
          businessQuery.error?.response?.data?.message ||
          "We could not load this business."
        }
        onRetry={() => businessQuery.refetch()}
      />
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link
        to="/admin/businesses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/80 bg-white shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Business profile
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {business.businessName || "Untitled business"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {business.slug ? `/${business.slug}` : "No public slug"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusClass(business.accountStatus)}>
                  {business.accountStatus || "active"}
                </Badge>
                <Badge className="border-sky-200 bg-sky-50 text-sky-700">
                  {business.isBeta ? "Beta" : "Free"}
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoItem label="Business ID" value={business._id} />
              <InfoItem label="Owner name" value={business.owner?.name} />
              <InfoItem label="Owner email" value={business.owner?.email} />
              <InfoItem label="Owner mobile" value={business.owner?.mobile} />
              <InfoItem label="Slug" value={business.slug} />
              <InfoItem label="Registration date" value={formatDate(business.createdAt)} />
              <InfoItem label="Last activity" value={formatDate(business.lastActivity)} />
              <InfoItem label="Beta expiry" value={formatDate(business.betaExpiresAt)} />
              <InfoItem
                label="Google Review"
                value={business.googleReviewEnabled ? "Enabled" : "Disabled"}
              />
              <InfoItem
                label="Public testimonials"
                value={business.isPublicEnabled ? "Enabled" : "Disabled"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Admin controls
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Account actions</h2>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700">
                  {business.accountStatus === "suspended" ? (
                    <ShieldBan className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">Account status</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Suspended businesses cannot use protected business-management APIs.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {business.accountStatus === "suspended" ? (
                  <Button
                    className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate("active")}
                  >
                    Activate account
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="rounded-xl"
                    disabled={statusMutation.isPending}
                    onClick={() => setConfirmSuspendOpen(true)}
                  >
                    Suspend account
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">Beta status</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    V1 uses beta or free account type. Paid plans are out of scope.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isBeta}
                    onChange={(event) => setIsBeta(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Beta business
                </label>
                <div className="space-y-2">
                  <Label htmlFor="betaExpiresAt">Beta expiry date</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="betaExpiresAt"
                        type="date"
                        value={betaExpiresAt}
                        onChange={(event) => setBetaExpiresAt(event.target.value)}
                        className="h-11 rounded-xl border-slate-200 bg-white pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-200 bg-white"
                      onClick={() => setBetaExpiresAt("")}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                  disabled={betaMutation.isPending}
                  onClick={() => betaMutation.mutate()}
                >
                  {betaMutation.isPending ? "Saving..." : "Save beta settings"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/80 bg-white shadow-[0_18px_60px_-44px_rgba(15,23,42,0.45)]">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Usage summary
            </p>
            <h2 className="text-xl font-bold text-slate-950">Feedback activity</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <UsageCard
              label="Total testimonials"
              value={business.usage?.totalTestimonials || 0}
            />
            <UsageCard label="Approved" value={business.usage?.approvedTestimonials || 0} />
            <UsageCard label="Pending" value={business.usage?.pendingTestimonials || 0} />
            <UsageCard label="Hidden" value={business.usage?.hiddenTestimonials || 0} />
            <UsageCard
              label="Private feedback"
              value={business.usage?.privateFeedbackCount || 0}
            />
            <UsageCard
              label="Last testimonial"
              value={formatDate(business.usage?.lastTestimonialAt)}
            />
            <UsageCard
              label="Last private feedback"
              value={formatDate(business.usage?.lastPrivateFeedbackAt)}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmSuspendOpen} onOpenChange={setConfirmSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend this business?</DialogTitle>
            <DialogDescription>
              This blocks protected business-management APIs for this account. Public pages,
              widgets, and review links stay unchanged in V1.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white"
              onClick={() => setConfirmSuspendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate("suspended")}
            >
              {statusMutation.isPending ? "Suspending..." : "Suspend account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
