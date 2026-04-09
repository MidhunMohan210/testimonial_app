import {
  CheckCheck,
  Filter,
  LayoutPanelTop,
  Link2,
  MessageCircleHeart,
  MonitorSmartphone,
  Star,
} from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    title: "Share your review link",
    description: "Send one short link right after a service or purchase.",
    icon: Link2,
    cardClass: "bg-gradient-to-br from-[#f8f5ff]/70 via-[#f3f0ff]/65 to-[#ede8ff]/70 border-[#ddd4ff]/80",
    iconClass: "bg-[#cbc0ff] text-[#36216d]",
    markerClass: "bg-[#cdc2ff] ring-[#e9e2ff]",
    side: "left",
  },
  {
    title: "Collect customer feedback",
    description: "Customers submit a quick rating and message.",
    icon: MessageCircleHeart,
    cardClass: "bg-gradient-to-br from-[#ebfbf9]/75 via-[#e2f7f2]/70 to-[#d8f2eb]/75 border-[#bae7dc]/80",
    iconClass: "bg-[#a8e7d8] text-[#0b4a3d]",
    markerClass: "bg-[#96dccb] ring-[#d8f2eb]",
    side: "right",
  },
  {
    title: "Filter responses intelligently",
    description: "Woice auto-splits 1-3 stars private and 4-5 stars public.",
    icon: Filter,
    cardClass: "bg-gradient-to-br from-[#f2fff8]/85 via-[#e8fff3]/80 to-[#deffe8]/85 border-[#8ee4b3]",
    iconClass: "bg-[#66d992] text-[#0e5031]",
    markerClass: "bg-[#53cf84] ring-[#d8f9e7]",
    focus: true,
    side: "left",
  },
  {
    title: "Approve and manage testimonials",
    description: "Approve or hold testimonials inside your dashboard queue.",
    icon: LayoutPanelTop,
    cardClass: "bg-gradient-to-br from-[#fff6eb]/75 via-[#fff0e0]/70 to-[#ffe9d2]/75 border-[#ffd5ad]/85",
    iconClass: "bg-[#ffc896] text-[#6a3212]",
    markerClass: "bg-[#ffc389] ring-[#ffe7cd]",
    side: "right",
  },
  {
    title: "Showcase on your website",
    description: "Publish approved feedback to your page or embeddable widget.",
    icon: MonitorSmartphone,
    cardClass: "bg-gradient-to-br from-[#fff1f2]/75 via-[#ffe9ed]/70 to-[#ffe1e8]/75 border-[#ffc9d5]/85",
    iconClass: "bg-[#ffb1c4] text-[#6e1d35]",
    markerClass: "bg-[#ffadc2] ring-[#ffe1ea]",
    side: "left",
  },
];

function LinkStepVisual() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/75 bg-white/70 px-3 py-2">
      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white">
        woice.it/review/cliq
      </span>
      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
        Copied
      </span>
    </div>
  );
}

function CollectStepVisual() {
  return (
    <div className="rounded-2xl border border-white/75 bg-white/70 px-3 py-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] text-slate-600">
        "Fast reply and smooth experience."
      </p>
    </div>
  );
}

function FilterStepVisual() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white/90 p-3 shadow-[0_18px_36px_-24px_rgba(16,185,129,0.45)]">
      <div className="mb-2 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-emerald-800">
          <Filter className="h-3 w-3" />
          Smart Split
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < 2 ? "fill-rose-400 text-rose-400" : "text-rose-200"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-[10px] font-semibold text-rose-700">1-3 stars</p>
          <p className="mt-1 rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">
            Private feedback
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-emerald-400 text-emerald-400" />
            ))}
          </div>
          <p className="mt-1 text-[10px] font-semibold text-emerald-700">4-5 stars</p>
          <p className="mt-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            Public testimonial
          </p>
        </div>
      </div>
    </div>
  );
}

function ApproveStepVisual() {
  return (
    <div className="rounded-2xl border border-white/75 bg-white/70 p-2.5">
      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-2.5 py-2 text-[11px]">
        <span className="text-slate-600">Great communication</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
          Approve
        </span>
      </div>
    </div>
  );
}

function ShowcaseStepVisual() {
  return (
    <div className="rounded-2xl border border-white/75 bg-white/70 p-2.5">
      <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-700">Live widget</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <CheckCheck className="h-3 w-3" />
            Published
          </span>
        </div>
        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

const visuals = [
  <LinkStepVisual key="link" />,
  <CollectStepVisual key="collect" />,
  <FilterStepVisual key="filter" />,
  <ApproveStepVisual key="approve" />,
  <ShowcaseStepVisual key="showcase" />,
];

function StepCard({ step, index, reduceMotion }) {
  const isRight = step.side === "right";
  const Icon = step.icon;

  return (
    <motion.li
      className="relative"
      variants={{
        hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.58,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      <motion.span
        className={`absolute left-[1.45rem] top-14 z-20 h-4 w-4 rounded-full ring-8 lg:left-1/2 lg:-translate-x-1/2 ${step.markerClass}`}
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -2, 0],
                opacity: [0.9, 1, 0.9],
              }
        }
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
      />

      <article
        className={`ml-12 rounded-[1.85rem] border px-6 py-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.4)] backdrop-blur-[2px] sm:px-7 sm:py-7 lg:ml-0 lg:max-w-[31rem] ${
          isRight ? "lg:ml-auto lg:mr-12" : "lg:mr-auto lg:ml-12"
        } ${step.cardClass} ${
          step.focus
            ? "ring-1 ring-[#7dd7a4]/60 shadow-[0_30px_58px_-34px_rgba(16,185,129,0.48)] lg:scale-[1.035]"
            : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="inline-flex rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Step {index + 1}
          </p>
          <motion.span
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-[0_12px_24px_-18px_rgba(15,23,42,0.48)] ${step.iconClass}`}
            animate={
              reduceMotion
                ? undefined
                : { rotate: [0, -3, 0, 3, 0], y: [0, -1, 0] }
            }
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-4 w-4" />
          </motion.span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-tight text-slate-900">
          {step.title}
        </h3>
        <p
          className={`mt-1.5 text-sm leading-relaxed sm:text-[0.95rem] ${
            step.focus ? "text-slate-700" : "text-slate-600"
          }`}
        >
          {step.description}
        </p>
        <div className="mt-3.5">{visuals[index]}</div>
      </article>
    </motion.li>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative mt-8 overflow-hidden px-4 py-28 sm:mt-10 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(245,248,255,0.92),rgba(250,252,255,0.82)_25%,rgba(255,255,255,0.55)_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[16rem] bg-[radial-gradient(circle_at_top,rgba(206,233,255,0.36),transparent_68%)]" />
      <div className="absolute inset-x-0 top-24 -z-10 h-[34rem] bg-[radial-gradient(circle_at_center,rgba(255,244,227,0.45),transparent_65%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_20%,rgba(228,240,255,0.48),transparent_30%),radial-gradient(circle_at_86%_34%,rgba(241,232,255,0.45),transparent_28%)]" />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-slate-200/90 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
            Woice flow
          </p>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            How it works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Collect feedback, filter responses, and showcase your best
            testimonials in a few simple steps.
          </p>
        </div>

        <motion.div
          className="relative mt-20"
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.12,
                delayChildren: reduceMotion ? 0 : 0.08,
              },
            },
          }}
        >
          <motion.div
            className="pointer-events-none absolute bottom-14 left-[1.94rem] top-14 w-0.5 rounded-full bg-gradient-to-b from-[#e8dcff] via-[#f2d8b2] to-[#ffd4de] lg:hidden"
            aria-hidden="true"
            initial={{ scaleY: 0, opacity: 0.2 }}
            animate={isInView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0.2 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
          />

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-8 hidden h-[51rem] w-[25rem] -translate-x-1/2 lg:block"
            viewBox="0 0 400 820"
            fill="none"
          >
            <motion.path
              d="M200 20C140 70 140 130 200 182C260 234 260 294 200 346C140 398 140 458 200 510C260 562 260 622 200 674C140 726 140 776 200 806"
              stroke="url(#woiceTimelinePath)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="14 14"
              opacity="0.9"
              initial={{ pathLength: 0, opacity: 0.25 }}
              animate={isInView ? { pathLength: 1, opacity: 0.9 } : { pathLength: 0, opacity: 0.25 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient
                id="woiceTimelinePath"
                x1="200"
                y1="20"
                x2="200"
                y2="806"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#d6caff" />
                <stop offset="0.45" stopColor="#f6d6a8" />
                <stop offset="1" stopColor="#ffc2d4" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="space-y-9 lg:space-y-8">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} reduceMotion={reduceMotion} />
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
