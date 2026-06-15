import { useCallback, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { PUBLIC_APP_BASE_URL } from "../lib/publicUrl";

function CodeBlock({ id, title, subtitle, code, onCopy, copied }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-38px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onCopy(id, code)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:p-5 sm:text-sm">
        <code>{code}</code>
      </pre>
    </section>
  );
}

function StepCard({ icon: Icon, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_45px_-42px_rgba(15,23,42,0.55)] sm:p-5">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
        {description}
      </p>
    </article>
  );
}

export default function EmbedDocsPage() {
  const { business } = useAuth();
  const [copiedKey, setCopiedKey] = useState("");

  const businessSlug = (business?.slug || "your-business-slug").trim();
  const embedScriptUrl = `${PUBLIC_APP_BASE_URL}/embed.js`;

  const embedSnippet = useMemo(
    () => `<div
  class="woice-testimonial-widget"
  data-business-slug="${businessSlug}"
  data-theme="light"
  data-layout="grid"
  data-height="420"
></div>
<script
  src="${embedScriptUrl}"
  data-base-url="${PUBLIC_APP_BASE_URL}"
  defer
></script>`,
    [businessSlug, embedScriptUrl],
  );

  const reactSnippet = useMemo(
    () => `import { useEffect } from "react";

export default function TestimonialsWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${embedScriptUrl}";
    script.defer = true;
    script.setAttribute("data-base-url", "${PUBLIC_APP_BASE_URL}");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="woice-testimonial-widget"
      data-business-slug="${businessSlug}"
      data-theme="light"
      data-layout="slider"
      data-height="420"
    />
  );
}`,
    [businessSlug, embedScriptUrl],
  );

  const nextSnippet = useMemo(
    () => `import Script from "next/script";

export default function Page() {
  return (
    <>
      <div
        className="woice-testimonial-widget"
        data-business-slug="${businessSlug}"
        data-theme="light"
        data-layout="slider"
        data-height="420"
      />

      <Script
        src="${embedScriptUrl}"
        strategy="afterInteractive"
        data-base-url="${PUBLIC_APP_BASE_URL}"
      />
    </>
  );
}`,
    [businessSlug, embedScriptUrl],
  );

  const wordpressSnippet = useMemo(
    () => `<!-- Add this inside a Custom HTML block -->
<div
  class="woice-testimonial-widget"
  data-business-slug="${businessSlug}"
  data-theme="light"
  data-layout="grid"
></div>
<script
  src="${embedScriptUrl}"
  data-base-url="${PUBLIC_APP_BASE_URL}"
  defer
></script>`,
    [businessSlug, embedScriptUrl],
  );

  const shopifySnippet = useMemo(
    () => `{% comment %} Add where the widget should render {% endcomment %}
<div
  class="woice-testimonial-widget"
  data-business-slug="${businessSlug}"
  data-theme="light"
  data-layout="grid"
></div>

{% comment %} Add before </body> in theme.liquid if not already added {% endcomment %}
<script
  src="${embedScriptUrl}"
  data-base-url="${PUBLIC_APP_BASE_URL}"
  defer
></script>`,
    [businessSlug, embedScriptUrl],
  );

  const platformBlocks = useMemo(
    () => [
      {
        id: "react",
        title: "React",
        subtitle: "Load script once in useEffect",
        code: reactSnippet,
      },
      {
        id: "next",
        title: "Next.js",
        subtitle: "Use next/script with afterInteractive",
        code: nextSnippet,
      },
      {
        id: "wordpress",
        title: "WordPress",
        subtitle: "Custom HTML block",
        code: wordpressSnippet,
      },
      {
        id: "shopify",
        title: "Shopify",
        subtitle: "Theme section + theme.liquid",
        code: shopifySnippet,
      },
    ],
    [nextSnippet, reactSnippet, shopifySnippet, wordpressSnippet],
  );

  const handleCopy = useCallback(async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1400);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(""), 1400);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f3f6fb_45%,#eef2f8_100%)] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-1 space-y-5 sm:mx-4 sm:space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_40px_90px_-65px_rgba(15,23,42,0.65)] sm:p-8 lg:p-10">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-sky-100/70 blur-2xl" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-violet-100/60 blur-2xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5" />
                Embed Documentation
              </p>

              <h1 className="mt-4 text-xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Add your testimonial widget to any website in minutes.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Use the production-ready snippet below to publish verified
                social proof across landing pages, product pages, and checkout
                funnels with zero custom backend work.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "No-code install",
                  "Auto-resize iframe",
                  "CSP-friendly",
                  "Framework compatible",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <StepCard
            icon={Layers}
            title="1. Place Widget Container"
            description="Insert the widget container where testimonials should appear in your layout."
          />
          <StepCard
            icon={Globe}
            title="2. Load Runtime Script"
            description="Add Woice embed.js once per page and let it hydrate every widget instance."
          />
          <StepCard
            icon={Rocket}
            title="3. Publish Confidently"
            description="The widget auto-resizes inside iframes and stays responsive across devices."
          />
        </section>

        <section className="space-y-3">
          <CodeBlock
            id="universal"
            title="Universal Embed Snippet"
            subtitle="Recommended for HTML, CMS pages, and static sites"
            code={embedSnippet}
            onCopy={handleCopy}
            copied={copiedKey === "universal"}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-2xl">
              Platform Guides
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Choose the integration pattern that fits your stack.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {platformBlocks.map((block) => (
              <CodeBlock
                key={block.id}
                id={block.id}
                title={block.title}
                subtitle={block.subtitle}
                code={block.code}
                onCopy={handleCopy}
                copied={copiedKey === block.id}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)] sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
              Production Readiness
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Use a fixed <code>data-height</code> as a baseline fallback.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Avoid duplicate script tags on single-page apps.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                Ensure your business slug maps to a published testimonial feed.
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)] sm:p-6">
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              Troubleshooting
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Widget not loading</p>
                <p className="mt-1 text-slate-600">
                  Validate <code>data-business-slug</code> and confirm embed.js
                  is reachable.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">
                  Iframe blocked or blank
                </p>
                <p className="mt-1 text-slate-600">
                  Update CSP to allow <code>{PUBLIC_APP_BASE_URL}</code> in{" "}
                  <code>script-src</code> and <code>frame-src</code>.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Height mismatch</p>
                <p className="mt-1 text-slate-600">
                  Keep <code>window.postMessage</code> unblocked and pass a
                  stable <code>data-height</code> fallback.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
