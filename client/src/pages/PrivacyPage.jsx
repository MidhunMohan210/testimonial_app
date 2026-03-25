import LandingHeader from "../components/landing/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const sections = [
  {
    title: "Operator",
    body: "This service (Woice) is operated by Midhun Mohan.",
  },
  {
    title: "Information We Collect",
    body:
      "Woice may collect data shared through WhatsApp interactions, including messages, media, testimonial submissions, and related contact details provided during the collection process.",
  },
  {
    title: "How Data Is Stored",
    body:
      "Messages, media, and testimonials submitted through the service may be stored to help businesses review, manage, and publish customer feedback inside Woice.",
  },
  {
    title: "Contact",
    body: "For privacy questions or requests, contact support@woice.app.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-full bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(247,247,245,0.52)_58%,transparent_78%)]" />
      <LandingHeader />

      <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-white/80 bg-white/90 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl text-slate-950">Privacy Policy</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7 text-slate-600">
                This page explains the core privacy and ownership details required for Woice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-6"
                >
                  <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                </section>
              ))}
              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-6">
                <p className="text-sm leading-7 text-slate-600">
                  By using Woice, businesses may collect and manage testimonials originating from
                  customer conversations on WhatsApp. If you need support or want to raise a
                  privacy concern, email{" "}
                  <a
                    href="mailto:support@woice.app"
                    className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
                  >
                    support@woice.app
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
