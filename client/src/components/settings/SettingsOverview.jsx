import { ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

export default function SettingsOverview({ sections, onSelect }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-xl border-white/80 bg-white shadow-[0_26px_80px_-50px_rgba(15,23,42,0.42)] ring-1 ring-slate-950/[0.04]">
        <div className="rounded-lg border border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Settings
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Business configuration
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Choose a settings area to manage your business profile, review flow, or how you share
            your feedback link with customers.
          </p>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className="group rounded-xl border border-white/80 bg-white p-5 text-left shadow-[0_26px_80px_-50px_rgba(15,23,42,0.42)] ring-1 ring-slate-950/[0.04] transition hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_32px_90px_-50px_rgba(15,23,42,0.5)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)]",
                    section.iconClassName,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-slate-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{section.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{section.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
