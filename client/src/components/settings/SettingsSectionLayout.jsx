import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

export default function SettingsSectionLayout({
  section,
  onBack,
  onSubmit,
  isSaving,
  isSaveDisabled,
  error,
  children,
}) {
  const Icon = section.icon;

  return (
    <Card className="min-h-[520px] overflow-hidden rounded-xl border-white/80 bg-white shadow-[0_26px_80px_-50px_rgba(15,23,42,0.42)] ring-1 ring-slate-950/[0.04]">
      <CardContent className="flex min-h-[520px] flex-col p-4 sm:p-7">
        <div className="rounded-lg border border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3 sm:gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)] sm:h-12 sm:w-12",
                  section.iconClassName,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 transition hover:text-slate-600"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Settings
                </button>
                <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {section.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {section.detailDescription}
                </p>
              </div>
            </div>
            <Button
              className="w-full rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.75)] hover:bg-slate-800 sm:w-auto sm:px-5"
              type="submit"
              form={onSubmit ? "settings-form" : undefined}
              disabled={isSaving || isSaveDisabled}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex-1 py-5 sm:py-6">{children}</div>
      </CardContent>
    </Card>
  );
}
