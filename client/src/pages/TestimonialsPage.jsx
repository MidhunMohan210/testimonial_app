import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTestimonials,
  markAllTestimonialsAsRead,
  updateStatus,
} from "../api/testimonialApi";
import ManualAddModal from "../components/ManualAddModal";
import { EmptyStateCard, ErrorStateCard } from "../components/StateCard";
import TestimonialCard from "../components/TestimonialCard";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
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

const DEFAULT_FILTERS = {
  datePreset: "all_time",
  fromDate: "",
  toDate: "",
  ratingSort: "none",
  wordPreset: "any",
  minWords: "",
  maxWords: "",
};

const getWordCount = (item) => {
  const text = String(item?.testimonialText || item?.feedbackText || "").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
};

const parseFilterNumber = (value) => {
  if (value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getStartOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getEndOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getWeekStart = (date) => {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return getStartOfDay(addDays(date, diffToMonday));
};

const getDateRangeFromPreset = (preset, customFromDate, customToDate) => {
  const today = new Date();

  if (preset === "today") {
    return { fromDate: getStartOfDay(today), toDate: getEndOfDay(today) };
  }

  if (preset === "yesterday") {
    const yesterday = addDays(today, -1);
    return { fromDate: getStartOfDay(yesterday), toDate: getEndOfDay(yesterday) };
  }

  if (preset === "this_week") {
    return { fromDate: getWeekStart(today), toDate: getEndOfDay(today) };
  }

  if (preset === "previous_week") {
    const thisWeekStart = getWeekStart(today);
    const previousWeekStart = addDays(thisWeekStart, -7);
    const previousWeekEnd = addDays(thisWeekStart, -1);
    return { fromDate: previousWeekStart, toDate: getEndOfDay(previousWeekEnd) };
  }

  if (preset === "this_month") {
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    return { fromDate: getStartOfDay(fromDate), toDate: getEndOfDay(today) };
  }

  if (preset === "prev_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { fromDate: getStartOfDay(start), toDate: getEndOfDay(end) };
  }

  if (preset === "prev_three_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { fromDate: getStartOfDay(start), toDate: getEndOfDay(end) };
  }

  if (preset === "custom") {
    return {
      fromDate: customFromDate ? new Date(`${customFromDate}T00:00:00`) : null,
      toDate: customToDate ? new Date(`${customToDate}T23:59:59.999`) : null,
    };
  }

  return { fromDate: null, toDate: null };
};

export default function TestimonialsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const PAGE_SIZE = 6;
  const queryClient = useQueryClient();
  const getValidStatus = (status) => {
    const allowedStatuses = new Set(["all", "pending", "approved", "hidden"]);
    return allowedStatuses.has(status) ? status : "all";
  };
  const [activeStatus, setActiveStatus] = useState(() =>
    getValidStatus(searchParams.get("status")),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [manualOpen, setManualOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const deferredStatus = useDeferredValue(activeStatus);

  const handleStatusChange = (nextStatus) => {
    const normalizedStatus = getValidStatus(nextStatus);
    setActiveStatus(normalizedStatus);

    const queryStatus = getValidStatus(searchParams.get("status"));
    if (queryStatus !== normalizedStatus) {
      setSearchParams(normalizedStatus === "all" ? {} : { status: normalizedStatus });
    }
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setDetailDialogOpen(true);
  };

  const testimonialsQuery = useQuery({
    queryKey: ["testimonials", deferredStatus],
    queryFn: () => getTestimonials(deferredStatus),
    placeholderData: keepPreviousData,
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
  const filteredTestimonials = useMemo(() => {
    const { fromDate, toDate } = getDateRangeFromPreset(
      filters.datePreset,
      filters.fromDate,
      filters.toDate,
    );
    const customMinWords = parseFilterNumber(filters.minWords);
    const customMaxWords = parseFilterNumber(filters.maxWords);

    let minWords = customMinWords;
    let maxWords = customMaxWords;
    if (filters.wordPreset === "below_10") {
      minWords = null;
      maxWords = 9;
    } else if (filters.wordPreset === "10_20") {
      minWords = 10;
      maxWords = 20;
    } else if (filters.wordPreset === "20_50") {
      minWords = 20;
      maxWords = 50;
    } else if (filters.wordPreset === "50_100") {
      minWords = 50;
      maxWords = 100;
    } else if (filters.wordPreset === "above_100") {
      minWords = 101;
      maxWords = null;
    }

    const next = testimonials.filter((testimonial) => {
      const createdAt = new Date(
        testimonial.createdAt || testimonial.collectedAt || Date.now(),
      );
      if (fromDate && createdAt < fromDate) return false;
      if (toDate && createdAt > toDate) return false;

      const wordCount = getWordCount(testimonial);
      if (minWords !== null && wordCount < minWords) return false;
      if (maxWords !== null && wordCount > maxWords) return false;

      return true;
    });

    if (filters.ratingSort === "high_to_low") {
      next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.ratingSort === "low_to_high") {
      next.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }

    return next;
  }, [filters, testimonials]);
  const hasTestimonials = filteredTestimonials.length > 0;
  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([key, value]) => value !== DEFAULT_FILTERS[key]),
    [filters],
  );

  const testimonialTotalPages = Math.max(
    1,
    Math.ceil(filteredTestimonials.length / PAGE_SIZE),
  );
  const paginatedTestimonials = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredTestimonials.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredTestimonials, currentPage]);

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), testimonialTotalPages);
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredStatus]);

  useEffect(() => {
    const statusFromQuery = getValidStatus(searchParams.get("status"));
    if (statusFromQuery !== activeStatus) {
      setActiveStatus(statusFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentPage > testimonialTotalPages) {
      setCurrentPage(testimonialTotalPages);
    }
  }, [currentPage, testimonialTotalPages]);

  useEffect(() => {
    if (filterSheetOpen) {
      setDraftFilters(filters);
    }
  }, [filterSheetOpen, filters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const markUnreadAsRead = async () => {
      try {
        await markAllTestimonialsAsRead();
        queryClient.invalidateQueries({
          queryKey: ["unread-count", "testimonials"],
        });
      } catch {
        // Keep page functional even if unread sync fails.
      }
    };

    markUnreadAsRead();
  }, [queryClient]);

  const getEmptyStateConfig = () => {
    if (activeStatus === "pending") {
      return {
        title: "No pending testimonials",
        description: "New reviews that need approval will appear here.",
      };
    }

    if (activeStatus === "approved") {
      return {
        title: "No published testimonials yet",
        description: "Approve some from Pending to publish them.",
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
      description: "Send a request or add one manually.",
      actionLabel: "Add testimonial",
      onAction: () => setManualOpen(true),
      secondaryActionLabel: "Send a request",
      onSecondaryAction: () => navigate("/send-request"),
    };
  };

  const emptyStateConfig = getEmptyStateConfig();

  if (testimonialsQuery.isError) {
    return (
      <>
        <div className="mx-auto max-w-7xl">
          <ErrorStateCard
            message="We couldn’t load testimonials right now."
            onRetry={() => testimonialsQuery.refetch()}
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
      <div className="mx-auto max-w-7xl px-3">
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Testimonials
              </span>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                Manage every customer quote in one place.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review, approve, hide, and organize incoming feedback in a
                focused moderation workspace.
              </p>
            </div>
            <Button
              className="w-full rounded-xl px-5 sm:w-auto"
              onClick={() => setManualOpen(true)}
            >
              Add testimonial
            </Button>
          </div>
        </section>

        <section>
          <Tabs
            value={activeStatus}
            onValueChange={(nextStatus) => {
              handleStatusChange(nextStatus);
            }}
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
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
                </TabsList>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current view
                  </p>
                  <p className="mt-2 text-base font-semibold capitalize text-slate-950">
                    {activeStatus}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Items
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {filteredTestimonials.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {testimonialsQuery.isFetching ? "Refreshing..." : "Up to date"}
                  </p>
                </div>
              </div>
            </div>
            <TabsContent value={activeStatus} className="mt-5">
              <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  {hasActiveFilters
                    ? `Showing ${filteredTestimonials.length} filtered testimonials`
                    : "No filters applied"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white px-4"
                  onClick={() => setFilterSheetOpen(true)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              {testimonialsQuery.isLoading ? (
                <LoadingState />
              ) : hasTestimonials ? (
                <>
                  <div className="space-y-4">
                    {paginatedTestimonials.map((testimonial) => (
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
                    totalPages={testimonialTotalPages}
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
        <DialogContent className="flex max-h-[min(78vh,42rem)] flex-col rounded-xl sm:max-w-xl">
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
                  })} • Rating ${selectedEntry.rating}/5`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="break-words whitespace-pre-wrap text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                {selectedEntry?.feedbackText ||
                  selectedEntry?.testimonialText ||
                  "No feedback text provided."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Testimonials</SheetTitle>
            <SheetDescription>
              Filter by date, rating order, and message word count.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="testimonial-filter-date-preset">Date</Label>
              <select
                id="testimonial-filter-date-preset"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-offset-white transition focus-visible:ring-2 focus-visible:ring-slate-300"
                value={draftFilters.datePreset}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    datePreset: event.target.value,
                  }))
                }
              >
                <option value="all_time">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="previous_week">Previous Week</option>
                <option value="this_month">This Month</option>
                <option value="prev_month">Previous Month</option>
                <option value="prev_three_month">Previous Three Months</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            {draftFilters.datePreset === "custom" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testimonial-filter-from">From date</Label>
                  <Input
                    id="testimonial-filter-from"
                    type="date"
                    value={draftFilters.fromDate}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        fromDate: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimonial-filter-to">To date</Label>
                  <Input
                    id="testimonial-filter-to"
                    type="date"
                    value={draftFilters.toDate}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        toDate: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="testimonial-filter-rating">Rating</Label>
              <select
                id="testimonial-filter-rating"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-offset-white transition focus-visible:ring-2 focus-visible:ring-slate-300"
                value={draftFilters.ratingSort}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    ratingSort: event.target.value,
                  }))
                }
              >
                <option value="none">Default</option>
                <option value="high_to_low">Higher to Lower</option>
                <option value="low_to_high">Lower to Higher</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial-filter-word-preset">Words</Label>
              <select
                id="testimonial-filter-word-preset"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-offset-white transition focus-visible:ring-2 focus-visible:ring-slate-300"
                value={draftFilters.wordPreset}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    wordPreset: event.target.value,
                  }))
                }
              >
                <option value="any">Any length</option>
                <option value="below_10">Below 10</option>
                <option value="10_20">10-20</option>
                <option value="20_50">20-50</option>
                <option value="50_100">50-100</option>
                <option value="above_100">Above 100</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {draftFilters.wordPreset === "custom" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testimonial-filter-min-words">
                    Min words
                  </Label>
                  <Input
                    id="testimonial-filter-min-words"
                    type="number"
                    min="0"
                    value={draftFilters.minWords}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        minWords: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimonial-filter-max-words">
                    Max words
                  </Label>
                  <Input
                    id="testimonial-filter-max-words"
                    type="number"
                    min="0"
                    value={draftFilters.maxWords}
                    onChange={(event) =>
                      setDraftFilters((current) => ({
                        ...current,
                        maxWords: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setDraftFilters(DEFAULT_FILTERS);
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => {
                setFilters(draftFilters);
                setFilterSheetOpen(false);
                setCurrentPage(1);
              }}
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
