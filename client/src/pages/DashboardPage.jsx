import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCirclePlus, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { getTestimonials, updateStatus } from "../api/testimonialApi";
import Navbar from "../components/Navbar";
import SendRequestModal from "../components/SendRequestModal";
import ManualAddModal from "../components/ManualAddModal";
import TestimonialCard from "../components/TestimonialCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const summaryConfig = [
  { key: "total", label: "Total Testimonials" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "hidden", label: "Hidden" },
];

function EmptyState() {
  return (
    <Card className="border-dashed border-slate-300 bg-white/80">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-semibold">No testimonials yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Send your first WhatsApp or Telegram test request and customer feedback will appear here.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState("all");
  const [sendOpen, setSendOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const testimonialsQuery = useQuery({
    queryKey: ["testimonials", activeStatus],
    queryFn: () => getTestimonials(activeStatus),
  });

  const allTestimonialsQuery = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => getTestimonials("all"),
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

  const allTestimonials = allTestimonialsQuery.data || [];
  const summary = {
    total: allTestimonials.length,
    approved: allTestimonials.filter((item) => item.status === "approved").length,
    pending: allTestimonials.filter((item) => item.status === "pending").length,
    hidden: allTestimonials.filter((item) => item.status === "hidden").length,
  };

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Testimonial Operating System
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Turn customer replies into social proof.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Send a WhatsApp request or a Telegram test request, capture the reply, and keep every testimonial organized in one calm dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="gap-2" onClick={() => setSendOpen(true)}>
              <MessageCirclePlus className="h-4 w-4" />
              Send Request
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setManualOpen(true)}>
              <PencilLine className="h-4 w-4" />
              Add Manually
            </Button>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryConfig.map((item) => (
            <Card key={item.key} className="border-white/80 bg-white/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-extrabold">{summary[item.key]}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <Tabs value={activeStatus} onValueChange={setActiveStatus}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="hidden">Hidden</TabsTrigger>
            </TabsList>
            <TabsContent value={activeStatus}>
              {testimonialsQuery.isLoading ? (
                <LoadingState />
              ) : testimonialsQuery.data?.length ? (
                <div className="space-y-4">
                  {testimonialsQuery.data.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial._id}
                      testimonial={testimonial}
                      onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                      isUpdating={statusMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <SendRequestModal open={sendOpen} onOpenChange={setSendOpen} />
      <ManualAddModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        activeStatus={activeStatus}
      />
    </>
  );
}
