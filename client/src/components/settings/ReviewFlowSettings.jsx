import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

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
        "flex w-full flex-col items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left transition hover:border-slate-300 hover:bg-white sm:gap-4 sm:py-4 sm:flex-row sm:items-center",
        disabled && "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-slate-50/80",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors sm:h-7 sm:w-12",
          checked ? "bg-slate-950" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform sm:top-1",
            checked ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

export default function ReviewFlowSettings({
  register,
  errors,
  hasGoogleReviewLink,
  googleReviewEnabled,
  onGoogleReviewEnabledChange,
  googleReviewLinkValue,
}) {
  return (
    <div className=" space-y-5 sm:space-y-6">
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 sm:p-4">
        <div className="space-y-2">
          <Label htmlFor="settings-google-review-link">Google Review Link </Label>
          <Input
            id="settings-google-review-link"
            placeholder="https://g.page/r/..."
            className="rounded-lg border-slate-200 bg-white"
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
            <p className="text-sm text-red-600">{errors.googleReviewLink.message}</p>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              After a positive testimonial, customers can be guided to leave a Google review.
            </p>
          )}
        </div>
      </div>

      <SettingsToggle
        checked={hasGoogleReviewLink && googleReviewEnabled}
        onChange={onGoogleReviewEnabledChange}
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
            window.open(googleReviewLinkValue.trim(), "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Google link
        </Button>
      ) : null}
    </div>
  );
}
