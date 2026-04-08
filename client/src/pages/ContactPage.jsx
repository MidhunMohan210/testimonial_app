import LandingHeader from "../components/landing/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function ContactPage() {
  return (
    <main className="min-h-full bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(247,247,245,0.52)_58%,transparent_78%)]" />
      <LandingHeader />

      <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-white/80 bg-white/90 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
            <CardHeader className="space-y-3 text-center sm:text-left">
              <CardTitle className="text-2xl text-slate-950 sm:text-3xl">Contact</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 text-slate-600">
                Reach out for support, privacy-related questions, or verification inquiries about
                Woice.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Owner
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">Midhun Mohan</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Email
                  </p>
                  <a
                    href="mailto:support@woice.app"
                    className="mt-2 inline-block text-base font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                  >
                    support@woice.app
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-2 text-base text-slate-700">Kerala, India</p>
                </div>
              </div>

              <form className="space-y-4 rounded-[1.5rem] border border-slate-200/80 bg-white p-5 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea id="contact-message" placeholder="How can we help?" />
                </div>
                <Button type="button" className="w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
