import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Card className="border-dashed border-slate-300 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.3)]">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
        <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:mt-6 sm:gap-3">
            <Button className="rounded-xl px-4 sm:px-5" onClick={onAction}>
              {actionLabel}
            </Button>
            {secondaryActionLabel ? (
              <Button
                variant="outline"
                className="rounded-xl px-4 sm:px-5"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ErrorStateCard({ message, onRetry }) {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
      <Card className="relative w-full max-w-xl overflow-hidden border bg-transparent shadow-none ring-0 backdrop-blur border-none">
        <CardContent className="flex flex-col items-center justify-center px-5 py-10 text-center sm:px-8 sm:py-14">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100 sm:mb-5 sm:h-12 sm:w-12">
            <span className="text-2xl">!</span>
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Something went wrong
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            {message}
          </p>

          <Button
            className="mt-6 rounded-xl px-5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            variant="default"
            onClick={onRetry}
          >
            Try again
          </Button>

          <div className="pointer-events-none absolute inset-x-10 -bottom-10 h-24 bg-gradient-to-t from-slate-100/80 to-transparent blur-3xl" />
        </CardContent>
      </Card>
    </div>
  );
}
