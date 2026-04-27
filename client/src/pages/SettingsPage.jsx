import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Monitor,
  Settings,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../api/businessApi";
import { ErrorStateCard } from "../components/StateCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

function SettingsToggle({ checked, onChange, title, description, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      disabled={disabled}
      className={cn(
        "flex w-full flex-col items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white sm:flex-row sm:items-center",
        disabled && "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-slate-50/80",
      )}
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

const SETTINGS_TABS = [
  {
    id: "business-profile",
    label: "Business Profile",
    description: "Business details ",
    icon: Building2,
    iconClassName: "border-blue-100 bg-blue-50 text-blue-700",
    activeAccentClassName: "bg-blue-600",
  },
  {
    id: "review-flow",
    label: "Review Flow",
    description: "Google review destination",
    icon: Star,
    iconClassName: "border-amber-100 bg-amber-50 text-amber-700",
    activeAccentClassName: "bg-amber-500",
  },
  // {
  //   id: "display",
  //   label: "Display",
  //   description: "Public testimonial page",
  //   icon: Monitor,
  //   iconClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
  //   activeAccentClassName: "bg-emerald-600",
  // },
  // {
  //   id: "notifications",
  //   label: "Notifications",
  //   description: "Workspace alerts",
  //   icon: BellRing,
  //   iconClassName: "border-violet-100 bg-violet-50 text-violet-700",
  //   activeAccentClassName: "bg-violet-600",
  // },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { business, updateBusiness: updateBusinessInAuth } = useAuth();
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("business-profile");
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
      googleReviewEnabled: false,
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
        googleReviewEnabled: data.googleReviewEnabled,
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

  const googleReviewLinkValue = watch("googleReviewLink") || "";
  const hasGoogleReviewLink = Boolean(googleReviewLinkValue.trim());

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    setFormError("");
    await mutation.mutateAsync({
      ...values,
      googleReviewEnabled: values.googleReviewLink?.trim()
        ? values.googleReviewEnabled
        : false,
    });
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

  const activeTabMeta =
    SETTINGS_TABS.find((item) => item.id === activeTab) || SETTINGS_TABS[0];
  const ActiveTabIcon = activeTabMeta.icon;

  return (
    <div className="mx-auto max-w-7xl space-y-6">


      <form id="settings-form" onSubmit={onSubmit}>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-2 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.42)] ring-1 ring-slate-950/[0.03] lg:p-3">
            <nav
              className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
              aria-label="Settings sections"
            >
              {SETTINGS_TABS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "relative flex min-w-[190px] items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 lg:min-w-0",
                      isActive
                        ? "bg-white text-slate-950 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/80"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-3 hidden h-8 w-1 rounded-r-full lg:block",
                        isActive ? item.activeAccentClassName : "bg-transparent",
                      )}
                    />
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        item.iconClassName,
                        !isActive && "opacity-75",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 hidden text-xs leading-5 text-slate-400 sm:block">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <Card className="min-h-[520px] overflow-hidden rounded-xl border-white/80 bg-white shadow-[0_26px_80px_-50px_rgba(15,23,42,0.42)] ring-1 ring-slate-950/[0.04]">
            <CardContent className="flex min-h-[520px] flex-col p-5 sm:p-7">
              <div className="rounded-lg border border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)]",
                        activeTabMeta.iconClassName,
                      )}
                    >
                      <ActiveTabIcon className="h-5 w-5" />
                    </div>
                    <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {activeTabMeta.label}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                    {activeTabMeta.label}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {activeTab === "business-profile"
                      ? "This is the link you can share with customers to collect reviews."
                      : activeTab === "review-flow"
                        ? "After a positive testimonial, customers can be guided to leave a Google review."
                        : activeTab === "display"
                          ? "Control whether your approved testimonials page is publicly available."
                          : "Get notified when new testimonials or private feedback arrive."}
                  </p>
                    </div>
                  </div>
                  <Button
                    className="h-11 w-full rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.75)] hover:bg-slate-800 sm:w-auto"
                    type="submit"
                    disabled={mutation.isPending || settingsQuery.isLoading || !isDirty}
                  >
                    {mutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>

              {formError ? (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex-1 py-6">
                {activeTab === "business-profile" ? (
                  <div className="max-w-3xl space-y-6">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                      <div className="space-y-2">
                      <Label htmlFor="settings-name">Business Name</Label>
                      <Input
                        id="settings-name"
                        className="h-12 rounded-lg border-slate-200 bg-white"
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
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                      <div className="space-y-2">
                      <Label htmlFor="settings-slug">Slug</Label>
                      <Input
                        id="settings-slug"
                        value={slug}
                        readOnly
                        className="h-12 rounded-lg border-slate-200 bg-white text-slate-500"
                      />
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                      <div className="space-y-2">
                      <Label htmlFor="settings-public-link">Public review link</Label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          id="settings-public-link"
                          value={publicReviewLink}
                          readOnly
                          className="h-12 rounded-lg border-slate-200 bg-white text-slate-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-full rounded-lg px-4 sm:w-auto"
                          onClick={handleCopyLink}
                          disabled={!publicReviewLink}
                        >
                          {copied ? (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <p className="text-sm leading-6 text-slate-500">
                        This is the link you can share with customers to collect reviews.
                      </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeTab === "review-flow" ? (
                  <div className="max-w-3xl space-y-6">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                      <div className="space-y-2">
                      <Label htmlFor="settings-google-review-link">Google Review Link</Label>
                      <Input
                        id="settings-google-review-link"
                        placeholder="https://g.page/r/..."
                        className="h-12 rounded-lg border-slate-200 bg-white"
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
                        <p className="text-sm leading-6 text-slate-500">
                          After a positive testimonial, customers can be guided to leave a Google review.
                        </p>
                      )}
                      </div>
                    </div>

                    <SettingsToggle
                      checked={hasGoogleReviewLink && watch("googleReviewEnabled")}
                      onChange={(value) =>
                        hasGoogleReviewLink
                          ? setValue("googleReviewEnabled", value, { shouldDirty: true })
                          : undefined
                      }
                      title="Enable Google review flow"
                      description={
                        hasGoogleReviewLink
                          ? "When enabled, customers who submit a positive testimonial can be guided to your Google review link."
                          : "Add a Google Review Link before enabling this flow."
                      }
                      disabled={!hasGoogleReviewLink}
                    />

                    {hasGoogleReviewLink ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full rounded-lg px-4 sm:w-auto"
                        onClick={() =>
                          window.open(
                            googleReviewLinkValue.trim(),
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Google link
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                {activeTab === "display" ? (
                  <div className="max-w-3xl">
                    <SettingsToggle
                      checked={watch("isPublicEnabled")}
                      onChange={(value) =>
                        setValue("isPublicEnabled", value, { shouldDirty: true })
                      }
                      title="Enable Public Testimonials Page"
                      description="Control whether your approved testimonials page is publicly available."
                    />
                  </div>
                ) : null}

                {activeTab === "notifications" ? (
                  <div className="max-w-3xl">
                    <SettingsToggle
                      checked={watch("notificationsEnabled")}
                      onChange={(value) =>
                        setValue("notificationsEnabled", value, { shouldDirty: true })
                      }
                      title="Notify on new reviews"
                      description="Get notified when new testimonials or private feedback arrive."
                    />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
