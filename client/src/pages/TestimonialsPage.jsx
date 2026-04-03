import { useDeferredValue, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";
import { getPrivateFeedback } from "../api/businessApi";
import { getTestimonials, updateStatus } from "../api/testimonialApi";
import ManualAddModal from "../components/ManualAddModal";
import TestimonialCard from "../components/TestimonialCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

function EmptyState({ onManualAdd }) {
  return (
    <Card className="border-dashed border-slate-300 bg-white/80">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-semibold">No testimonials yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Testimonials you collect from customers will appear here once they are submitted.
        </p>
        <Button className="mt-6" onClick={onManualAdd}>
          Add testimonial manually
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function PrivateFeedbackCard({ feedback }) {
  const createdDate = new Date(feedback.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="border-white/80 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-lg text-slate-950">
            {feedback.customerName || "Anonymous customer"}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">{createdDate}</p>
        </div>
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          {feedback.rating}/3
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <MessageSquareWarning className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">
              Private feedback
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700">
            {feedback.feedbackText || "No feedback text provided."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState("all");
  const [manualOpen, setManualOpen] = useState(false);
  const deferredStatus = useDeferredValue(activeStatus);

  const testimonialsQuery = useQuery({
    queryKey: ["testimonials", deferredStatus],
    queryFn: () => getTestimonials(deferredStatus),
    enabled: deferredStatus !== "private-feedback",
    placeholderData: keepPreviousData,
  });

  const privateFeedbackQuery = useQuery({
    queryKey: ["private-feedback"],
    queryFn: getPrivateFeedback,
    enabled: deferredStatus === "private-feedback",
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: async (_, variables) => {
      toast.success(`Testimonial moved to ${variables.status}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
        queryClient.invalidateQueries({ queryKey: ["testimonials", activeStatus] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update testimonial");
    },
  });

  const testimonials = testimonialsQuery.data?.data || [];
  const hasTestimonials = testimonials.length > 0;
  const privateFeedback = privateFeedbackQuery.data || [];
  const hasPrivateFeedback = privateFeedback.length > 0;
  const isFeedbackView = deferredStatus === "private-feedback";

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Testimonials
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
                Manage every customer quote in one place.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Review, approve, hide, and organize your testimonials without crowding the dashboard overview.
              </p>
            </div>
            <Button onClick={() => setManualOpen(true)}>Add testimonial</Button>
          </div>
        </section>

        <section>
          <Tabs value={activeStatus} onValueChange={setActiveStatus}>
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-950">
                    Moderation queue
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Filter by status and process testimonials in a dedicated workspace.
                  </p>
                </div>
                <TabsList className="w-full justify-start overflow-x-auto rounded-2xl bg-slate-100/90 sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="hidden">Hidden</TabsTrigger>
                  <TabsTrigger value="private-feedback">Private Feedback</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                <span>
                  {isFeedbackView
                    ? hasPrivateFeedback
                      ? `${privateFeedback.length} private feedback entr${privateFeedback.length === 1 ? "y" : "ies"}`
                      : "No private feedback yet"
                    : hasTestimonials
                    ? `${testimonials.length} testimonial${testimonials.length === 1 ? "" : "s"} in this view`
                    : "No testimonials in this view yet"}
                </span>
                {(testimonialsQuery.isFetching || privateFeedbackQuery.isFetching) ? (
                  <span className="font-medium text-slate-500">Refreshing…</span>
                ) : null}
              </div>
            </div>
            <TabsContent value={activeStatus}>
              {isFeedbackView ? (
                privateFeedbackQuery.isLoading ? (
                  <LoadingState />
                ) : hasPrivateFeedback ? (
                  <div className="space-y-4">
                    {privateFeedback.map((feedback) => (
                      <PrivateFeedbackCard key={feedback._id} feedback={feedback} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-slate-300 bg-white/80">
                    <CardContent className="py-16 text-center">
                      <h3 className="text-xl font-semibold">No private feedback yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Lower-rated responses from the public review link will appear here for follow-up.
                      </p>
                    </CardContent>
                  </Card>
                )
              ) : testimonialsQuery.isLoading ? (
                <LoadingState />
              ) : hasTestimonials ? (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial._id}
                      testimonial={testimonial}
                      onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                      isUpdating={statusMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState onManualAdd={() => setManualOpen(true)} />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <ManualAddModal open={manualOpen} onOpenChange={setManualOpen} activeStatus={activeStatus} />
    </>
  );
}
