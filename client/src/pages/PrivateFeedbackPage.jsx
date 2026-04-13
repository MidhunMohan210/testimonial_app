import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareWarning } from "lucide-react";
import {
  getPrivateFeedback,
  markAllPrivateFeedbackAsRead,
} from "../api/businessApi";
import { EmptyStateCard, ErrorStateCard } from "../components/StateCard";
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

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 rounded-full border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] hover:bg-slate-50 sm:flex-none"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 rounded-full bg-slate-900 px-4 font-semibold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.6)] hover:bg-slate-800 sm:flex-none"
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
      <CardHeader className="flex flex-col items-start justify-between gap-3 pb-3 sm:flex-row">
        <div>
          <CardTitle className="text-base text-slate-950 sm:text-lg">
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

export default function PrivateFeedbackPage() {
  const PAGE_SIZE = 6;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const privateFeedbackQuery = useQuery({
    queryKey: ["private-feedback"],
    queryFn: getPrivateFeedback,
  });

  const privateFeedback = privateFeedbackQuery.data || [];
  const hasPrivateFeedback = privateFeedback.length > 0;

  const totalPages = Math.max(1, Math.ceil(privateFeedback.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return privateFeedback.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, privateFeedback]);

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setDetailDialogOpen(true);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const markUnreadAsRead = async () => {
      try {
        await markAllPrivateFeedbackAsRead();
        queryClient.invalidateQueries({
          queryKey: ["unread-count", "private-feedback"],
        });
      } catch {
        // Keep page functional even if unread sync fails.
      }
    };

    markUnreadAsRead();
  }, [queryClient]);

  if (privateFeedbackQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorStateCard
          message="We couldn’t load your private feedback."
          onRetry={() => privateFeedbackQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-3">
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                Private feedback
              </span>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                Review low-rated customer feedback separately.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Customers who leave 1 to 3 star ratings appear here so you can
                follow up quickly and resolve issues earlier.
              </p>
            </div>
            <Badge className="w-fit border-amber-200 bg-amber-50 text-amber-700">
              {privateFeedback.length} items
            </Badge>
          </div>
        </section>

        {privateFeedbackQuery.isLoading ? (
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
            title="No private feedback yet"
            description="Customers who leave 1 to 3 star ratings will show up here so you can follow up and improve."
          />
        )}
      </div>

      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setSelectedEntry(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[min(78vh,42rem)] flex-col rounded-xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.customerName || "Anonymous customer"}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry
                ? `${new Date(selectedEntry.createdAt).toLocaleDateString(
                    undefined,
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )} • Rating ${selectedEntry.rating}/3`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="break-words whitespace-pre-wrap text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                {selectedEntry?.feedbackText || "No feedback text provided."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
