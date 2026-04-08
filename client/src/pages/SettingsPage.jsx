import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Globe, BellRing, Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../api/businessApi";
import { ErrorStateCard } from "../components/StateCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

function SettingsToggle({ checked, onChange, title, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white sm:flex-row sm:items-center"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-slate-950" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function SettingsLoadingState() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-32 w-full rounded-[2rem]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-[2rem]" />
        <Skeleton className="h-72 w-full rounded-[2rem]" />
      </div>
      <Skeleton className="h-56 w-full rounded-[2rem]" />
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { business, updateBusiness: updateBusinessInAuth } = useAuth();
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      googleReviewLink: "",
      isPublicEnabled: true,
      notificationsEnabled: true,
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["business", "settings"],
    queryFn: getBusinessSettings,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data);
      setFormError("");
    }
  }, [reset, settingsQuery.data]);

  const slug = settingsQuery.data?.slug || "";
  const publicReviewLink = useMemo(
    () => (slug ? `${window.location.origin}/r/${slug}` : ""),
    [slug],
  );

  const mutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: async (data) => {
      setFormError("");
      reset(data);
      updateBusinessInAuth({
        ...(business || {}),
        businessName: data.name,
        slug: data.slug,
        googleReviewLink: data.googleReviewLink,
        isPublicEnabled: data.isPublicEnabled,
        notificationsEnabled: data.notificationsEnabled,
      });
      toast.success("Settings saved");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["business", "settings"] }),
        queryClient.invalidateQueries({ queryKey: ["business", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["auth"] }),
      ]);
    },
    onError: (error) => {
      const payload = error.response?.data;
      const details = Array.isArray(payload?.details) ? payload.details : [];

      if (details.length > 0) {
        setFormError(details[0].message || "Please review the form and try again.");
        details.forEach((detail) => {
          if (detail?.field) {
            setError(detail.field, {
              type: "server",
              message: detail.message,
            });
          }
        });
        return;
      }

      setFormError(payload?.message || payload?.error || "Failed to save settings");
    },
  });

  const handleCopyLink = async () => {
    if (!publicReviewLink) return;

    try {
      await navigator.clipboard.writeText(publicReviewLink);
      setCopied(true);
      toast.success("Public review link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    setFormError("");
    await mutation.mutateAsync(values);
  });

  if (settingsQuery.isLoading) {
    return <SettingsLoadingState />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorStateCard
        message="We couldn’t load your settings right now."
        onRetry={settingsQuery.refetch}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Card className="overflow-hidden border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_32px_80px_-48px_rgba(15,23,42,0.35)]">
        <CardContent className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              Settings
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Manage your workspace
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Keep your business profile, public page, and notifications aligned from one place.
            </p>
          </div>

          <Button
            className="h-11 w-full rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
            type="submit"
            form="settings-form"
            disabled={mutation.isPending || settingsQuery.isLoading || !isDirty}
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <form id="settings-form" className="space-y-6" onSubmit={onSubmit}>
        {formError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-950">
                Business Profile
              </CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Update the essentials customers see and use when sharing your review page.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="settings-name">Business Name</Label>
                <Input
                  id="settings-name"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("name", {
                    required: "Business name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Business name is required",
                  })}
                />
                {errors.name ? (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-slug">Slug</Label>
                <Input
                  id="settings-slug"
                  value={slug}
                  readOnly
                  className="h-12 rounded-2xl border-slate-200 bg-slate-100 text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-public-link">Public review link</Label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="settings-public-link"
                    value={publicReviewLink}
                    readOnly
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/70 text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl px-4 sm:w-auto"
                    onClick={handleCopyLink}
                    disabled={!publicReviewLink}
                  >
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-950">
                Review Settings
              </CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Control where happy customers land after they submit a public review.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="settings-google-review-link">Google Review Link</Label>
                <Input
                  id="settings-google-review-link"
                  placeholder="https://g.page/r/..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/70"
                  {...register("googleReviewLink", {
                    validate: (value) => {
                      const trimmed = value.trim();

                      if (!trimmed) return true;

                      try {
                        const parsed = new URL(trimmed);
                        return (
                          parsed.protocol === "http:" ||
                          parsed.protocol === "https:" ||
                          "Enter a valid URL"
                        );
                      } catch {
                        return "Enter a valid URL";
                      }
                    },
                  })}
                />
                {errors.googleReviewLink ? (
                  <p className="text-sm text-red-600">
                    {errors.googleReviewLink.message}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Add this if you want to invite customers to leave a Google review after a positive testimonial.
                  </p>
                )}
              </div>

              {watch("googleReviewLink")?.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-2xl px-4 sm:w-auto"
                  onClick={() => window.open(watch("googleReviewLink").trim(), "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Google link
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-3 pb-2">
              <CardTitle className="text-xl font-semibold text-slate-950">
                Public Page Settings
              </CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Decide whether your testimonial page should be available publicly.
              </p>
            </CardHeader>
            <CardContent>
              <SettingsToggle
                checked={watch("isPublicEnabled")}
                onChange={(value) => setValue("isPublicEnabled", value, { shouldDirty: true })}
                title="Enable Public Testimonials Page"
                description="Turn this off if you want to pause access to your public testimonials page temporarily."
              />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
                <BellRing className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-950">
                Notifications
              </CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Control whether your workspace should notify you when new reviews come in.
              </p>
            </CardHeader>
            <CardContent>
              <SettingsToggle
                checked={watch("notificationsEnabled")}
                onChange={(value) =>
                  setValue("notificationsEnabled", value, { shouldDirty: true })
                }
                title="Notify on new reviews"
                description="Keep this on to stay in sync whenever fresh testimonials or private feedback arrive."
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
