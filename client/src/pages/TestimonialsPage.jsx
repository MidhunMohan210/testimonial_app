import { useDeferredValue, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";
import { getPrivateFeedback } from "../api/businessApi";
import { getTestimonials, updateStatus } from "../api/testimonialApi";
import ManualAddModal from "../components/ManualAddModal";
import TestimonialCard from "../components/TestimonialCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

function EmptyState({ onManualAdd }) {
  return (
    <Card className="border-dashed border-slate-300 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.3)]">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-semibold">No testimonials yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Testimonials you collect from customers will appear here once they are
          submitted.
        </p>
        <Button className="mt-6 rounded-xl px-5" onClick={onManualAdd}>
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

function PrivateFeedbackCard({ feedback, onOpen }) {
  const createdDate = new Date(feedback.createdAt).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:border-slate-300">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <MessageSquareWarning className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">
              Private feedback
            </span>
          </div>
          <p className="line-clamp-3 text-sm leading-7 text-slate-700">
            {feedback.feedbackText || "No feedback text provided."}
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-lg"
            onClick={() => onOpen(feedback)}
          >
            View full feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState("all");
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const deferredStatus = useDeferredValue(activeStatus);

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setDetailDialogOpen(true);
  };

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
        queryClient.invalidateQueries({
          queryKey: ["testimonials", activeStatus],
        }),
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update testimonial",
      );
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
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Testimonials
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
                Manage every customer quote in one place.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review, approve, hide, and organize incoming feedback in a
                focused moderation workspace.
              </p>
            </div>
            <Button
              className="rounded-xl px-5"
              onClick={() => setManualOpen(true)}
            >
              Add testimonial
            </Button>
          </div>
        </section>

        <section>
          <Tabs value={activeStatus} onValueChange={setActiveStatus}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.24)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                    Moderation queue
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Switch between queues and process feedback with less
                    clutter.
                  </p>
                </div>
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="hidden">Hidden</TabsTrigger>
                  <TabsTrigger value="private-feedback">
                    Private Feedback
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current view
                  </p>
                  <p className="mt-2 text-base font-semibold capitalize text-slate-950">
                    {isFeedbackView ? "Private feedback" : activeStatus}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Items
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {isFeedbackView
                      ? privateFeedback.length
                      : testimonials.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {testimonialsQuery.isFetching ||
                    privateFeedbackQuery.isFetching
                      ? "Refreshing..."
                      : "Up to date"}
                  </p>
                </div>
              </div>
            </div>
            <TabsContent value={activeStatus} className="mt-5">
              {isFeedbackView ? (
                privateFeedbackQuery.isLoading ? (
                  <LoadingState />
                ) : hasPrivateFeedback ? (
                  <div className="space-y-4">
                    {privateFeedback.map((feedback) => (
                      <PrivateFeedbackCard
                        key={feedback._id}
                        feedback={feedback}
                        onOpen={handleOpenEntry}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-slate-300 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.3)]">
                    <CardContent className="py-16 text-center">
                      <h3 className="text-xl font-semibold">
                        No private feedback yet
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Lower-rated responses from the public review link will
                        appear here for follow-up.
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
                      onStatusChange={(id, status) =>
                        statusMutation.mutate({ id, status })
                      }
                      isUpdating={statusMutation.isPending}
                      onOpen={handleOpenEntry}
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

      <ManualAddModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        activeStatus={activeStatus}
      />
      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setSelectedEntry(null);
          }
        }}
      >
        <DialogContent className="rounded-xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.customerName || "Anonymous customer"}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry
                ? `${new Date(
                    selectedEntry.createdAt || selectedEntry.collectedAt,
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} • Rating ${selectedEntry.rating}/${selectedEntry.feedbackText ? "3" : "5"}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-7 text-slate-700">
              {selectedEntry?.feedbackText ||
                selectedEntry?.testimonialText ||
                "No feedback text provided."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
