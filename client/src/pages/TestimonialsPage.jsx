import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { EmptyStateCard, ErrorStateCard } from "../components/StateCard";
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

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = [];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  pageItems.push(1);

  if (startPage > 2) {
    pageItems.push("start-ellipsis");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    pageItems.push(page);
  }

  if (endPage < totalPages - 1) {
    pageItems.push("end-ellipsis");
  }

  if (totalPages > 1) {
    pageItems.push(totalPages);
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.2),0_10px_24px_-18px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Pagination
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Page <span className="text-slate-950">{currentPage}</span> of{" "}
            <span className="text-slate-950">{totalPages}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)]">
          {pageItems.map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 ${
                  item === currentPage
                    ? "bg-slate-900 text-white shadow-[0_12px_24px_-16px_rgba(15,23,42,0.75)]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
              >
                {item}
              </button>
            ) : (
              <span
                key={item}
                className="px-1 text-sm font-semibold tracking-[0.2em] text-slate-300"
                aria-hidden="true"
              >
                ...
              </span>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] hover:bg-slate-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            type="button"
            className="h-10 rounded-full bg-slate-900 px-4 font-semibold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.6)] hover:bg-slate-800"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
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
  const navigate = useNavigate();
  const PAGE_SIZE = 6;
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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
  const activeItems = isFeedbackView ? privateFeedback : testimonials;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return activeItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [activeItems, currentPage]);

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredStatus]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const getEmptyStateConfig = () => {
    if (isFeedbackView) {
      return {
        title: "No private feedback yet",
        description:
          "Customers who leave 1–3 star ratings will show up here so you can follow up and improve.",
      };
    }

    if (activeStatus === "pending") {
      return {
        title: "No pending testimonials",
        description:
          "New reviews that need approval will appear here.",
      };
    }

    if (activeStatus === "approved") {
      return {
        title: "No published testimonials yet",
        description:
          "Approve some from Pending to publish them.",
      };
    }

    if (activeStatus === "hidden") {
      return {
        title: "No rejected testimonials",
        description: "No rejected testimonials.",
      };
    }

    return {
      title: "You don’t have any testimonials yet",
      description:
        "Send a request or add one manually.",
      actionLabel: "Add testimonial",
      onAction: () => setManualOpen(true),
      secondaryActionLabel: "Send a request",
      onSecondaryAction: () => navigate("/send-request"),
    };
  };

  const activeQuery = isFeedbackView ? privateFeedbackQuery : testimonialsQuery;
  const emptyStateConfig = getEmptyStateConfig();
  const activeErrorMessage = isFeedbackView
    ? "We couldn’t load your private feedback."
    : "We couldn’t load testimonials right now.";

  if (activeQuery.isError) {
    return (
      <>
        <div className="mx-auto max-w-7xl">
          <ErrorStateCard
            message={activeErrorMessage}
            onRetry={() => activeQuery.refetch()}
          />
        </div>
        <ManualAddModal
          open={manualOpen}
          onOpenChange={setManualOpen}
          activeStatus={activeStatus}
        />
      </>
    );
  }

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
                    {activeItems.length}
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
                  <>
                    <div className="space-y-4">
                      {paginatedItems.map((feedback) => (
                        <PrivateFeedbackCard
                          key={feedback._id}
                          feedback={feedback}
                          onOpen={handleOpenEntry}
                        />
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : (
                  <EmptyStateCard
                    title={emptyStateConfig.title}
                    description={emptyStateConfig.description}
                  />
                )
              ) : testimonialsQuery.isLoading ? (
                <LoadingState />
              ) : hasTestimonials ? (
                <>
                  <div className="space-y-4">
                    {paginatedItems.map((testimonial) => (
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
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <EmptyStateCard
                  title={emptyStateConfig.title}
                  description={emptyStateConfig.description}
                  actionLabel={emptyStateConfig.actionLabel}
                  onAction={emptyStateConfig.onAction}
                  secondaryActionLabel={emptyStateConfig.secondaryActionLabel}
                  onSecondaryAction={emptyStateConfig.onSecondaryAction}
                />
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
