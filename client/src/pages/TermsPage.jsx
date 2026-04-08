import LandingHeader from "../components/landing/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const sections = [
  {
    title: "Introduction",
    content: ["These Terms govern your use of WOICE and apply when you access or use the platform."],
  },
  {
    title: "Service Description",
    content: [
      "WOICE is a SaaS platform that helps businesses manage WhatsApp-based interactions and testimonials.",
    ],
  },
  {
    title: "User Responsibilities",
    content: ["Provide accurate data", "Do not misuse the platform", "Do not engage in illegal activity"],
    list: true,
  },
  {
    title: "Acceptable Use",
    content: ["No spam", "No abuse", "No illegal content"],
    list: true,
  },
  {
    title: "Data Usage",
    content: [
      "The platform processes WhatsApp data to provide core functionality.",
      "Users are responsible for obtaining any required consent from their customers.",
    ],
  },
  {
    title: "Intellectual Property",
    content: ["All platform code, UI, and branding belong to WOICE."],
  },
  {
    title: "Limitation of Liability",
    content: [
      'The service is provided "as is".',
      "We do not guarantee uninterrupted uptime.",
      "We are not liable for data loss or issues caused by third-party services.",
    ],
  },
  {
    title: "Termination",
    content: ["We may suspend or terminate accounts that misuse the platform."],
  },
  {
    title: "Payments",
    content: ["If applicable, WOICE is offered as a subscription-based SaaS service."],
  },
  {
    title: "Governing Law",
    content: ["These Terms are governed by the laws of India."],
  },
  {
    title: "Contact",
    content: ["Email: midhunmohan3210@gmail.com"],
  },
];

function LegalSection({ title, content, list = false }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-950 sm:text-lg">{title}</h2>
      {list ? (
        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
          {content.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
          {content.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-full bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(247,247,245,0.52)_58%,transparent_78%)]" />
      <LandingHeader />

      <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-white/80 bg-white/90 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl text-slate-950 sm:text-3xl">Terms and Conditions</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7 text-slate-600">
                These Terms explain the basic rules for using WOICE in clear, simple language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section) => (
                <LegalSection key={section.title} {...section} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
