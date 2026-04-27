import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Link2,
  MessageSquareShare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const getOnboardingStorageKey = (slug) =>
  slug ? `woice_onboarding_completed_${slug}` : "";

function OnboardingStep({
  step,
  icon: Icon,
  accentClassName,
  title,
  description,
  actionLabel,
  onAction,
  disabled = false,
  actionState = "idle",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-38px_rgba(15,23,42,0.28)] sm:p-6">
      <div
        className={`absolute inset-x-0 top-0 h-1.5 ${accentClassName}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
          {step}
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
        {actionLabel ? (
          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 rounded-xl border-slate-200 bg-slate-50 px-4 font-semibold text-slate-800 hover:bg-slate-100"
            onClick={onAction}
            disabled={disabled}
          >
            {actionState === "copied" ? (
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {actionState === "copied" ? "Copied" : actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function DashboardOnboarding({
  businessSlug,
  reviewLink,
  copied,
  onCopyLink,
}) {
  const [open, setOpen] = useState(false);
  const onboardingStorageKey = getOnboardingStorageKey(businessSlug);

  useEffect(() => {
    if (!businessSlug) return;

    const onboardingCompleted = window.localStorage.getItem(
      onboardingStorageKey,
    );

    if (!onboardingCompleted) {
      setOpen(true);
    }
  }, [businessSlug, onboardingStorageKey]);

  const completeOnboarding = () => {
    if (onboardingStorageKey) {
      window.localStorage.setItem(onboardingStorageKey, "true");
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          completeOnboarding();
          return;
        }

        setOpen(true);
      }}
    >
      <DialogContent className="max-h-[min(90vh,56rem)] overflow-y-auto rounded-[2rem] border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-0 sm:max-w-5xl">
        <div className="overflow-hidden rounded-[2rem]">
          <div className="relative border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#111827_100%)] px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                First steps
              </div>
              <DialogHeader className="mt-5 mb-0 max-w-3xl space-y-0">
                <DialogTitle className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Start collecting testimonials 🚀
                </DialogTitle>
                <DialogDescription className="mt-3 text-base leading-7 text-slate-300 sm:text-lg">
                  Copy your review link, send it to customers, and approve
                  testimonials before showing them publicly.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                  3 quick steps
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                  Takes less than 2 minutes
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8 sm:py-8">
            <div className="grid gap-4 lg:grid-cols-3">
          <OnboardingStep
            step="1"
            icon={Link2}
            accentClassName="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
            title="Copy your review link"
            description="Share this link with customers after a service, order, or interaction."
            actionLabel="Copy review link"
            onAction={onCopyLink}
            disabled={!reviewLink}
            actionState={copied ? "copied" : "idle"}
          />
          <OnboardingStep
            step="2"
            icon={MessageSquareShare}
            accentClassName="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400"
            title="Send it to customers"
            description="Paste the link into WhatsApp, SMS, email, or invoice messages."
          />
          <OnboardingStep
            step="3"
            icon={ShieldCheck}
            accentClassName="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
            title="Approve testimonials"
            description="Positive reviews will appear as pending testimonials. Approve the best ones to show on your public page and website widget."
          />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)] sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Your next move
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Copy the link now, then start sharing it with a few happy
                    customers today.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    onClick={completeOnboarding}
                  >
                    I&apos;ll do this later
                  </Button>
                  <Button
                    type="button"
                    className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                    onClick={completeOnboarding}
                  >
                    Go to dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
