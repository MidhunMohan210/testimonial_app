import LandingHeader from "../components/landing/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const sections = [
  {
    title: "Operator",
    content: ["WOICE is owned and operated by Midhun Mohan."],
  },
  {
    title: "Business Address",
    content: [
      "Njaralakuzhiyil (H), Kuravilangad, Kottayam, Kerala - 686633, India",
    ],
  },
  {
    title: "Information We Collect",
    content: ["WhatsApp messages", "Media (images, audio, video)", "Contact details", "Usage data"],
    list: true,
  },
  {
    title: "How We Use Data",
    content: ["Provide SaaS features", "Store testimonials", "Improve service"],
    list: true,
  },
  {
    title: "Data Storage",
    content: [
      "Data is stored securely using MongoDB and cloud-based systems.",
      "Access is limited to authorized users who need it to operate the service.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "We do not sell user data.",
      "Data is only used as needed to provide and support the service functionality.",
    ],
  },
  {
    title: "User Rights",
    content: [
      "Users can request deletion of their data.",
      "Users can contact us with privacy or data-related questions.",
    ],
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

export default function PrivacyPage() {
  return (
    <main className="min-h-full bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(247,247,245,0.52)_58%,transparent_78%)]" />
      <LandingHeader />

      <section className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-white/80 bg-white/90 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl text-slate-950 sm:text-3xl">Privacy Policy</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-7 text-slate-600">
                WOICE is operated by Midhun Mohan. This Privacy Policy explains how we collect,
                use, and protect your information when you use our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sections.map((section) => (
                <LegalSection key={section.title} {...section} />
              ))}
              <section className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 sm:p-6">
                <p className="text-sm font-medium text-slate-600">Last updated: March 25, 2026</p>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
