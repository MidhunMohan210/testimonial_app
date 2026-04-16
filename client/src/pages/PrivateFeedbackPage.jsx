import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageSquareWarning, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  getPrivateFeedback,
  markAllPrivateFeedbackAsRead,
  updatePrivateFeedback,
} from "../api/businessApi";
import { EmptyStateCard, ErrorStateCard } from "../components/StateCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const RESPONSE_TEMPLATES = [
  {
    id: "apology",
    label: "Apology",
    body: "Hi{{namePart}}, we're really sorry to hear about your experience. This is not the standard we aim for. Thank you for bringing it to our attention.",
  },
  {
    id: "details",
    label: "Ask for more details",
    body: "Hi{{namePart}}, thank you for your feedback. We'd like to understand what happened in a bit more detail so we can improve and make things right.",
  },
  {
    id: "resolution",
    label: "Resolution update",
    body: "Hi{{namePart}}, thank you for your feedback. We've reviewed your concern internally and taken steps to address it. We appreciate you helping us improve.",
  },
  {
    id: "second_chance",
    label: "Second chance / recovery",
    body: "Hi{{namePart}}, we're sorry your experience did not meet expectations. If you're open to it, we'd appreciate the chance to make things right.",
  },
  {
    id: "thank_you",
    label: "Thank you for honest feedback",
    body: "Hi{{namePart}}, thank you for your honest feedback. We truly value it and will use it to improve our service.",
  },
];

function getStatusMeta(status) {
  switch (status) {
    case "in_progress":
      return {
        label: "In Progress",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case "resolved":
      return {
        label: "Resolved",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "closed":
      return {
        label: "Closed",
        className: "border-slate-300 bg-slate-100 text-slate-700",
      };
    case "new":
    default:
      return {
        label: "New",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNamePart(name) {
  const firstName = name?.trim()?.split(/\s+/)[0] || "";
  return firstName ? ` ${firstName}` : "";
}

function buildTemplateBody(template, name) {
  return template.body.replaceAll("{{namePart}}", getNamePart(name));
}

function buildDefaultFollowUpText(name) {
  return `Hi${getNamePart(name)}, thank you for sharing your feedback. We appreciate it and will use it to improve our service.`;
}

function normalizePhoneForWhatsApp(phone) {
  if (!phone) return "";
  const digitsOnly = String(phone).replace(/[^\d+]/g, "");
  const withoutPlus = digitsOnly.replace(/^\+/, "");
  return withoutPlus.replace(/^00/, "");
}

function formatStatusLabel(value) {
  if (value === "in_progress") return "In Progress";
  if (value === "all") return "All";
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function PrivateFeedbackCard({ feedback, onOpen, onStatusChange, isUpdating }) {
  const createdDate = formatDate(feedback.createdAt);
  const statusMeta = getStatusMeta(feedback.status);
  const hasContact = Boolean(feedback.contactEmail || feedback.contactPhone);
  const hasResponse = Boolean(feedback.businessResponse?.trim());

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:border-slate-300">
      <CardHeader className="flex flex-col items-start justify-between gap-3 pb-3 sm:flex-row">
        <div>
          <CardTitle className="text-base text-slate-950 sm:text-lg">
            {feedback.customerName || "Anonymous customer"}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-500">{createdDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            {feedback.rating}/3
          </Badge>
          <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <MessageSquareWarning className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Private feedback
              </span>
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-slate-700">
              {feedback.feedbackText || "No feedback text provided."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {hasContact ? (
                <Badge className="border-slate-200 bg-white text-slate-600">Contact available</Badge>
              ) : (
                <Badge className="border-slate-200 bg-white text-slate-500">No contact info</Badge>
              )}
              {hasResponse ? (
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Response saved</Badge>
              ) : null}
            </div>
            <Button
              variant="outline"
              className="mt-4 rounded-lg"
              onClick={() => onOpen(feedback)}
            >
              View full feedback
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-[220px] xl:min-w-[220px] xl:shrink-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Actions
            </p>
            {feedback.status !== "in_progress" ? (
              <Button
                type="button"
                className="h-9 w-full justify-center"
                onClick={() => onStatusChange(feedback._id, "in_progress")}
                disabled={isUpdating}
              >
                Mark In Progress
              </Button>
            ) : null}
            {feedback.status !== "resolved" ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-center border-slate-200 bg-white hover:bg-slate-50"
                onClick={() => onStatusChange(feedback._id, "resolved")}
                disabled={isUpdating}
              >
                Mark Resolved
              </Button>
            ) : null}
            {feedback.status !== "closed" ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => onStatusChange(feedback._id, "closed")}
                disabled={isUpdating}
              >
                Close
              </Button>
            ) : null}
            {feedback.status !== "new" ? (
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => onStatusChange(feedback._id, "new")}
                disabled={isUpdating}
              >
                Move to New
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrivateFeedbackPage() {
  const PAGE_SIZE = 6;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("new");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [responseDraft, setResponseDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("new");
  const [selectedTemplateId, setSelectedTemplateId] = useState(RESPONSE_TEMPLATES[0].id);

  const privateFeedbackQuery = useQuery({
    queryKey: ["private-feedback"],
    queryFn: getPrivateFeedback,
  });

  const privateFeedback = privateFeedbackQuery.data || [];
  const filteredFeedback = useMemo(() => {
    if (activeStatus === "all") {
      return privateFeedback;
    }
    return privateFeedback.filter((item) => (item.status || "new") === activeStatus);
  }, [activeStatus, privateFeedback]);
  const hasPrivateFeedback = filteredFeedback.length > 0;

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredFeedback.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredFeedback]);

  const syncEntryEverywhere = (updatedEntry) => {
    queryClient.setQueryData(["private-feedback"], (current) =>
      Array.isArray(current)
        ? current.map((item) => (item._id === updatedEntry._id ? updatedEntry : item))
        : [],
    );
    setSelectedEntry((current) =>
      current?._id === updatedEntry._id ? updatedEntry : current,
    );
  };

  const updatePrivateFeedbackMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePrivateFeedback(id, payload),
    onSuccess: (updatedEntry, variables) => {
      syncEntryEverywhere(updatedEntry);
      setStatusDraft(updatedEntry.status || "new");
      setResponseDraft(updatedEntry.businessResponse || "");

      if (variables.kind === "save-response") {
        toast.success("Response saved");
      } else if (variables.kind === "save-status") {
        toast.success("Status updated");
      } else {
        toast.success("Feedback updated");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update feedback");
    },
  });

  const handlePageChange = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    setStatusDraft(entry.status || "new");
    setResponseDraft(entry.businessResponse || "");
    setSelectedTemplateId(RESPONSE_TEMPLATES[0].id);
    setDetailDialogOpen(true);
  };

  const handleCardStatusChange = (id, nextStatus) => {
    updatePrivateFeedbackMutation.mutate({
      id,
      payload: { status: nextStatus },
      kind: "save-status",
    });
  };

  const handleInsertTemplate = () => {
    const template = RESPONSE_TEMPLATES.find((item) => item.id === selectedTemplateId);
    if (!template) return;
    const nextText = buildTemplateBody(template, selectedEntry?.customerName);
    setResponseDraft(nextText);
  };

  const handleCopyResponse = async () => {
    const text = responseDraft.trim();
    if (!text) {
      toast.error("Write a response before copying");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
      return;
    } catch {
      // fallback
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        toast.success("Copied");
      } else {
        toast.error("Copy failed");
      }
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleSaveResponse = () => {
    if (!selectedEntry?._id) return;
    updatePrivateFeedbackMutation.mutate({
      id: selectedEntry._id,
      payload: { businessResponse: responseDraft.trim() },
      kind: "save-response",
    });
  };

  const handleSaveStatus = () => {
    if (!selectedEntry?._id) return;
    updatePrivateFeedbackMutation.mutate({
      id: selectedEntry._id,
      payload: { status: statusDraft },
      kind: "save-status",
    });
  };

  const handleQuickStatus = (nextStatus) => {
    if (!selectedEntry?._id) return;
    setStatusDraft(nextStatus);
    updatePrivateFeedbackMutation.mutate({
      id: selectedEntry._id,
      payload: { status: nextStatus },
      kind: "save-status",
    });
  };

  const handleReplyByEmail = () => {
    if (!selectedEntry?.contactEmail) return;
    const body = responseDraft.trim() || buildDefaultFollowUpText(selectedEntry.customerName);
    const emailLink = `mailto:${selectedEntry.contactEmail}?subject=${encodeURIComponent("Regarding your feedback")}&body=${encodeURIComponent(body)}`;
    window.open(emailLink, "_blank", "noopener,noreferrer");
  };

  const handleReplyByWhatsApp = () => {
    if (!selectedEntry?.contactPhone) return;
    const normalized = normalizePhoneForWhatsApp(selectedEntry.contactPhone);
    if (!normalized) {
      toast.error("Invalid phone number");
      return;
    }
    const message = responseDraft.trim() || buildDefaultFollowUpText(selectedEntry.customerName);
    const whatsappLink = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

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

  const selectedStatusMeta = getStatusMeta(statusDraft || selectedEntry?.status || "new");
  const hasSelectedContact = Boolean(selectedEntry?.contactEmail || selectedEntry?.contactPhone);

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

        <section>
          <Tabs value={activeStatus} onValueChange={setActiveStatus}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                    Private feedback queue
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Switch by status and process each card faster.
                  </p>
                </div>
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current view
                  </p>
                  <p className="mt-2 text-base font-semibold capitalize text-slate-950">
                    {formatStatusLabel(activeStatus)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Items
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {filteredFeedback.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {privateFeedbackQuery.isFetching ? "Refreshing..." : "Up to date"}
                  </p>
                </div>
              </div>
            </div>
            <TabsContent value={activeStatus} className="mt-5">
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
                        onStatusChange={handleCardStatusChange}
                        isUpdating={updatePrivateFeedbackMutation.isPending}
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
                  title={
                    activeStatus === "all"
                      ? "No private feedback items"
                      : `No ${formatStatusLabel(activeStatus)} feedback items`
                  }
                  description="Status updates will move private feedback into the right queue."
                />
              )}
            </TabsContent>
          </Tabs>
        </section>
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
        <DialogContent className="flex max-h-[min(88vh,56rem)] flex-col rounded-2xl border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] sm:max-w-4xl lg:max-w-5xl">
          <DialogHeader className="space-y-3 rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="truncate text-2xl font-semibold text-slate-950">
                  {selectedEntry?.customerName || "Anonymous customer"}
                </DialogTitle>
              </div>
              <Badge className={selectedStatusMeta.className}>{selectedStatusMeta.label}</Badge>
            </div>
            <DialogDescription className="text-slate-500">
              {selectedEntry
                ? `${formatDate(selectedEntry.createdAt)} • Rating ${selectedEntry.rating}/3`
                : ""}
            </DialogDescription>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {selectedEntry?.respondedAt ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                  Responded: {formatDate(selectedEntry.respondedAt)}
                </span>
              ) : null}
              {selectedEntry?.resolvedAt ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  Resolved: {formatDate(selectedEntry.resolvedAt)}
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <Tabs defaultValue="feedback" className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="contact">Contact actions</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="mt-0">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.3)]">
                <h3 className="text-base font-semibold text-slate-950">Feedback</h3>
                <div className="h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="break-words whitespace-pre-wrap text-sm leading-7 text-slate-700 [overflow-wrap:anywhere]">
                    {selectedEntry?.feedbackText || "No feedback text provided."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {selectedEntry?.contactEmail ? <span>Email: {selectedEntry.contactEmail}</span> : null}
                  {selectedEntry?.contactPhone ? <span>Phone: {selectedEntry.contactPhone}</span> : null}
                  {selectedEntry?.allowFollowUp ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      Customer is okay with being contacted
                    </span>
                  ) : null}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="response" className="mt-0">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.3)]">
                <h3 className="text-base font-semibold text-slate-950">Response</h3>
                <div className="space-y-2">
                  <label htmlFor="private-feedback-response" className="text-sm font-medium text-slate-700">
                    Response
                  </label>
                  <Textarea
                    id="private-feedback-response"
                    placeholder="Write a response or internal follow-up note..."
                    className="min-h-[170px]"
                    value={responseDraft}
                    onChange={(event) => setResponseDraft(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Templates</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-slate-300"
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                    >
                      {RESPONSE_TEMPLATES.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.label}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" onClick={handleInsertTemplate}>
                      Insert Template
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveResponse}
                    disabled={updatePrivateFeedbackMutation.isPending}
                  >
                    Save Response
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyResponse}
                    disabled={updatePrivateFeedbackMutation.isPending}
                  >
                    Copy Response
                  </Button>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.3)]">
                <h3 className="text-base font-semibold text-slate-950">Contact actions</h3>
                {hasSelectedContact ? (
                  <>
                    <div className="space-y-2 text-sm text-slate-600">
                      {selectedEntry?.contactEmail ? (
                        <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{selectedEntry.contactEmail}</span>
                        </p>
                      ) : null}
                      {selectedEntry?.contactPhone ? (
                        <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{selectedEntry.contactPhone}</span>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry?.contactEmail ? (
                        <Button type="button" variant="outline" onClick={handleReplyByEmail}>
                          Reply via Email
                        </Button>
                      ) : null}
                      {selectedEntry?.contactPhone ? (
                        <Button type="button" variant="outline" onClick={handleReplyByWhatsApp}>
                          Open WhatsApp
                        </Button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    No contact details were provided for this feedback.
                  </p>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
