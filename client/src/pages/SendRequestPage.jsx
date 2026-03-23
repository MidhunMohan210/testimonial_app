import { useState } from "react";
import { MessageCirclePlus, PencilLine, Sparkles } from "lucide-react";
import SendRequestModal from "../components/SendRequestModal";
import ManualAddModal from "../components/ManualAddModal";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SendRequestPage() {
  const [sendOpen, setSendOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Card className="overflow-hidden border-white/80 bg-slate-950 text-white">
            <CardContent className="relative p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_26%),radial-gradient(circle_at_left,rgba(56,189,248,0.18),transparent_26%)]" />
              <div className="relative space-y-5">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                  Collection workflow
                </span>
                <div className="space-y-3">
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Send more requests without cluttering the review queue.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Use WhatsApp when you want fresh customer feedback, or add verified offline testimonials manually when they already came in through another channel.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="gap-2 bg-white text-slate-950 hover:bg-slate-100" onClick={() => setSendOpen(true)}>
                    <MessageCirclePlus className="h-4 w-4" />
                    Send WhatsApp request
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setManualOpen(true)}
                  >
                    <PencilLine className="h-4 w-4" />
                    Add manually
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/85">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-950">
                Best practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-900">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-semibold">Ask right after value is delivered</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Requests convert better when sent shortly after onboarding, purchase, or a successful support interaction.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Keep the ask simple</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  One clear message and one clear reply path usually performs better than a longer scripted request.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Review before publishing</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep moderation in the dashboard so approved testimonials stay clean, trustworthy, and ready to reuse.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <SendRequestModal open={sendOpen} onOpenChange={setSendOpen} />
      <ManualAddModal open={manualOpen} onOpenChange={setManualOpen} activeStatus="all" />
    </>
  );
}
