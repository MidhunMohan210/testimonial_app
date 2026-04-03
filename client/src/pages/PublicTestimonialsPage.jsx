import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getPublicTestimonials } from "../api/publicTestimonialsApi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PublicTestimonialsPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const embedMode = searchParams.get("embed") === "true";

  const testimonialsQuery = useQuery({
    queryKey: ["public-testimonials", slug],
    queryFn: () => getPublicTestimonials(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const averageLabel = useMemo(
    () => `${Number(testimonialsQuery.data?.averageRating || 0).toFixed(1)} / 5`,
    [testimonialsQuery.data?.averageRating]
  );

  if (testimonialsQuery.isLoading) {
    return (
      <main className={`min-h-screen bg-slate-50 ${embedMode ? "py-4" : "px-4 py-10"}`}>
        <div className="mx-auto max-w-5xl">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-6 w-36 rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (testimonialsQuery.isError) {
    return (
      <main className={`min-h-screen bg-slate-50 ${embedMode ? "py-4" : "px-4 py-10"}`}>
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-2xl border-slate-200 bg-white">
            <CardContent className="p-10 text-center">
              <h1 className="text-2xl font-semibold text-slate-950">
                We couldn&apos;t find this business
              </h1>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const data = testimonialsQuery.data;

  return (
    <main className={`min-h-screen bg-slate-50 ${embedMode ? "py-4" : "px-4 py-10"}`}>
      <div className={`mx-auto ${embedMode ? "max-w-4xl px-4" : "max-w-5xl"}`}>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.3)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Public reviews
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {data.businessName}
              </h1>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <StarRating rating={data.averageRating} />
                <span className="text-base font-semibold text-slate-900">{averageLabel}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Based on {data.totalCount} review{data.totalCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {!embedMode ? (
            <div className="mt-6">
              <Link to={`/r/${slug}`} target="_blank" rel="noreferrer">
                <Button className="rounded-xl">Leave a review</Button>
              </Link>
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          {data.testimonials.length === 0 ? (
            <Card className="rounded-2xl border-slate-200 bg-white">
              <CardContent className="p-10 text-center text-slate-500">
                No public reviews yet. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="rounded-2xl border-slate-200 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <StarRating rating={testimonial.rating || 0} />
                      <p className="text-sm text-slate-500">
                        {formatDate(testimonial.collectedAt)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-700">
                      {testimonial.testimonialText || "No review text provided."}
                    </p>
                    <CardTitle className="mt-5 text-base text-slate-950">
                      {testimonial.customerName || "Anonymous"}
                    </CardTitle>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {!embedMode ? (
          <footer className="py-8 text-center text-sm text-slate-400">
            Powered by Woice
          </footer>
        ) : null}
      </div>
    </main>
  );
}
