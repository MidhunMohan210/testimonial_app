"use client";

import { useEffect, useRef } from "react";
import { Star, CheckCheck, Filter } from "lucide-react";
import { motion, useAnimationControls, useInView } from "framer-motion";

// ─── Mini UI components ────────────────────────────────────────────────────

function CollectMiniUi() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45),0_8px_18px_-14px_rgba(15,23,42,0.28)]">
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />
        ))}
      </div>
      <p className="text-[11px] italic text-slate-400 mb-2">"Fast reply, smooth experience."</p>
      <div className="border-t border-slate-100 pt-2 flex items-center gap-1.5">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[8px] font-semibold text-violet-700 flex-shrink-0">JD</span>
        <span className="text-[10px] text-slate-400">James D. · just now</span>
      </div>
    </div>
  );
}

function FilterMiniUi() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45),0_8px_18px_-14px_rgba(15,23,42,0.28)]">
      <div className="flex items-center justify-center mb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="h-2.5 w-2.5" /> Smart split
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-2">
          <div className="flex gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-2.5 w-2.5 ${i < 2 ? "fill-rose-400 text-rose-400" : "fill-rose-200 text-rose-200"}`} />
            ))}
          </div>
          <p className="text-[9px] font-semibold text-rose-700 mb-1">1–3 stars</p>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700">Private</span>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2">
          <div className="flex gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
            ))}
          </div>
          <p className="text-[9px] font-semibold text-emerald-700 mb-1">4–5 stars</p>
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Public</span>
        </div>
      </div>
    </div>
  );
}

function PublishMiniUi() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45),0_8px_18px_-14px_rgba(15,23,42,0.28)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-700">Live widget</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
          <CheckCheck className="h-2.5 w-2.5" /> Published
        </span>
      </div>
      <div className="flex items-center gap-0.5 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-[10px] text-slate-400">4.9 · 128 reviews</p>
    </div>
  );
}

// ─── Step data ─────────────────────────────────────────────────────────────

const CARD_W = 208;

const STEPS = [
  {
    num: "1", title: "Collect",
    desc: "Customers submit a star rating and a short message via your link.",
    ui: <CollectMiniUi />,
    px: 8, py: 78, labelPos: "below", labelAlign: "left",
    mSide: "right",
  },
  {
    num: "2", title: "Filter",
    desc: "1–3 stars stay private. 4–5 stars go public automatically.",
    ui: <FilterMiniUi />,
    px: 40, py: 50, labelPos: "above", labelAlign: "center",
    mSide: "left",
  },
  {
    num: "3", title: "Publish",
    desc: "Approved testimonials go live on your site or embeddable widget.",
    ui: <PublishMiniUi />,
    px: 90, py: 16, labelPos: "above", labelAlign: "left",
    mSide: "right",
  },
];

// smooth easing used everywhere
const EASE = [0.16, 1, 0.3, 1];

// ─── Mobile: vertical wave ─────────────────────────────────────────────────

function MobileWave() {
  const containerRef = useRef(null);
  const svgRef       = useRef(null);
  const rowRefs      = useRef([]);
  const isInView     = useInView(containerRef, { once: true, amount: 0.15 });

  // one control per segment + dot
  const pathCtrls = [useAnimationControls(), useAnimationControls()];
  const dotCtrls  = [useAnimationControls(), useAnimationControls(), useAnimationControls()];
  const numCtrls  = [useAnimationControls(), useAnimationControls(), useAnimationControls()];
  const cardCtrls = [useAnimationControls(), useAnimationControls(), useAnimationControls()];

  // draw geometry
  useEffect(() => {
    function draw() {
      const container = containerRef.current;
      const svg       = svgRef.current;
      if (!container || !svg) return;

      const cRect = container.getBoundingClientRect();
      const W = cRect.width;
      const H = cRect.height;

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.width  = W + "px";
      svg.style.height = H + "px";

      const CENTER = W / 2;
      const SWING  = W * 0.24;

      const pts = rowRefs.current.map((rowEl, i) => {
        if (!rowEl) return { x: CENTER, y: H / 2 };
        const rRect = rowEl.getBoundingClientRect();
        const y = rRect.top - cRect.top + rRect.height * 0.15;
        const x = STEPS[i].mSide === "right" ? CENTER - SWING : CENTER + SWING;
        return { x, y };
      });

      // two separate path segments so we can animate each independently
      const seg = (a, b) => {
        const mid = (a.y + b.y) / 2;
        return `M ${a.x} ${a.y} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
      };
      svg.querySelector("#mp-12")?.setAttribute("d", seg(pts[0], pts[1]));
      svg.querySelector("#mp-23")?.setAttribute("d", seg(pts[1], pts[2]));

      svg.querySelectorAll("[data-mdot]").forEach((el, i) => {
        el.setAttribute("cx", pts[i].x);
        el.setAttribute("cy", pts[i].y);
      });
      svg.querySelectorAll("[data-mnum]").forEach((el, i) => {
        const off = STEPS[i].mSide === "right" ? 10 : -52;
        el.setAttribute("x", pts[i].x + off);
        el.setAttribute("y", pts[i].y + 58);
      });
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // animate once in-view
  useEffect(() => {
    if (!isInView) return;

    const run = async () => {
      // reset
      pathCtrls.forEach(c => c.set({ pathLength: 0, opacity: 0 }));
      dotCtrls.forEach(c  => c.set({ scale: 0, opacity: 0 }));
      numCtrls.forEach(c  => c.set({ opacity: 0, y: 8 }));
      cardCtrls.forEach(c => c.set({ opacity: 0, y: 18 }));

      // step 0 card + dot together
      await Promise.all([
        dotCtrls[0].start({ scale: 1, opacity: 1, transition: { duration: 0.4, ease: EASE } }),
        cardCtrls[0].start({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }),
        numCtrls[0].start({ opacity: 0.3, y: 0, transition: { duration: 0.45, ease: EASE } }),
      ]);

      // draw seg 1 while step 1 card fades in slightly behind
      await Promise.all([
        pathCtrls[0].start({ pathLength: 1, opacity: 0.85, transition: { duration: 0.8, ease: EASE } }),
        new Promise(r => setTimeout(() => {
          Promise.all([
            dotCtrls[1].start({ scale: 1, opacity: 1, transition: { duration: 0.35, ease: EASE } }),
            numCtrls[1].start({ opacity: 0.3, y: 0, transition: { duration: 0.35, ease: EASE } }),
          ]).then(r);
        }, 600)),
      ]);

      cardCtrls[1].start({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } });

      // draw seg 2
      await Promise.all([
        pathCtrls[1].start({ pathLength: 1, opacity: 0.85, transition: { duration: 0.75, ease: EASE } }),
        new Promise(r => setTimeout(() => {
          Promise.all([
            dotCtrls[2].start({ scale: 1, opacity: 1, transition: { duration: 0.35, ease: EASE } }),
            numCtrls[2].start({ opacity: 0.3, y: 0, transition: { duration: 0.35, ease: EASE } }),
          ]).then(r);
        }, 580)),
      ]);

      cardCtrls[2].start({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } });
    };

    run();
  }, [isInView]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mobileCurveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c2410c" stopOpacity="1" />
          </linearGradient>
          <filter id="mobileCurveGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#ea580c" floodOpacity="0.22" />
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path id="mp-12" stroke="url(#mobileCurveGradient)" strokeWidth="3.5" strokeLinecap="round" filter="url(#mobileCurveGlow)"
          initial={{ pathLength: 0, opacity: 0 }} animate={pathCtrls[0]} />
        <motion.path id="mp-23" stroke="url(#mobileCurveGradient)" strokeWidth="3.5" strokeLinecap="round" filter="url(#mobileCurveGlow)"
          initial={{ pathLength: 0, opacity: 0 }} animate={pathCtrls[1]} />
        {STEPS.map((_, i) => (
          <motion.circle key={i} data-mdot={i} r="7" fill="#c0bab5"
            initial={{ scale: 0, opacity: 0 }} animate={dotCtrls[i]}
            style={{ transformOrigin: "center" }} />
        ))}
        {STEPS.map((s, i) => (
          <motion.text key={i} data-mnum={i} x="0" y="0"
            fontSize="72" fontWeight="700" fill="#758A93" fontFamily="inherit"
            initial={{ opacity: 0, y: 8 }} animate={numCtrls[i]}>
            {s.num}
          </motion.text>
        ))}
      </svg>

      {STEPS.map((s, i) => (
        <motion.div
          key={i}
          ref={(el) => (rowRefs.current[i] = el)}
          className="flex items-start gap-3 pb-12 last:pb-0"
          initial={{ opacity: 0, y: 18 }}
          animate={cardCtrls[i]}
        >
          <div className="flex-1">
            {s.mSide === "left" && (
              <div className="pt-1">
                <p className="text-sm font-semibold text-slate-900 mb-1">{s.title}</p>
                <p className="text-[11px] leading-relaxed text-slate-500 mb-2.5">{s.desc}</p>
                {s.ui}
              </div>
            )}
          </div>
          <div className="flex-shrink-0" style={{ width: "44px" }} />
          <div className="flex-1">
            {s.mSide === "right" && (
              <div className="pt-1">
                <p className="text-sm font-semibold text-slate-900 mb-1">{s.title}</p>
                <p className="text-[11px] leading-relaxed text-slate-500 mb-2.5">{s.desc}</p>
                {s.ui}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Desktop wave panel ────────────────────────────────────────────────────

function DesktopWave() {
  const svgRef   = useRef(null);
  const panelRef = useRef(null);
  const isInView = useInView(panelRef, { once: true, amount: 0.25 });
  const ranRef   = useRef(false);

  const path12Ctrl = useAnimationControls();
  const path23Ctrl = useAnimationControls();
  const dotCtrls   = [useAnimationControls(), useAnimationControls(), useAnimationControls()];
  const numCtrls   = [useAnimationControls(), useAnimationControls(), useAnimationControls()];
  const lblCtrls   = [useAnimationControls(), useAnimationControls(), useAnimationControls()];

  useEffect(() => {
    function draw() {
      const svg   = svgRef.current;
      const panel = panelRef.current;
      if (!svg || !panel) return;

      const { width: W, height: H } = panel.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.width  = W + "px";
      svg.style.height = H + "px";

      const pts = STEPS.map((s) => ({ x: (s.px / 100) * W, y: (s.py / 100) * H }));

      const seg = (a, b) => {
        const mx = (a.x + b.x) / 2;
        return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
      };
      svg.querySelector("#wv-12")?.setAttribute("d", seg(pts[0], pts[1]));
      svg.querySelector("#wv-23")?.setAttribute("d", seg(pts[1], pts[2]));

      svg.querySelectorAll("[data-dot]").forEach((el, i) => {
        el.setAttribute("cx", pts[i].x);
        el.setAttribute("cy", pts[i].y);
      });
      svg.querySelectorAll("[data-stepnum]").forEach((el, i) => {
        el.setAttribute("x", pts[i].x + 14);
        el.setAttribute("y", pts[i].y + 36);
      });

      STEPS.forEach((s, i) => {
        const lbl = panel.querySelector(`[data-label="${i}"]`);
        if (!lbl) return;
        const { x, y } = pts[i];
        if (s.labelAlign === "left")   lbl.style.left = x + "px";
        if (s.labelAlign === "center") lbl.style.left = x - CARD_W / 2 + "px";
        if (s.labelAlign === "right")  lbl.style.left = x - CARD_W + "px";
        if (s.labelPos === "below") { lbl.style.top = y + 18 + "px"; lbl.style.bottom = ""; }
        else { lbl.style.top = ""; lbl.style.bottom = H - y + 18 + "px"; }
      });
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  // reset on mount
  useEffect(() => {
    path12Ctrl.set({ pathLength: 0, opacity: 0 });
    path23Ctrl.set({ pathLength: 0, opacity: 0 });
    dotCtrls.forEach(c  => c.set({ scale: 0, opacity: 0 }));
    numCtrls.forEach(c  => c.set({ opacity: 0, y: 10 }));
    lblCtrls.forEach(c  => c.set({ opacity: 0, y: 22 }));
  }, []);

  // trigger once in view
  useEffect(() => {
    if (!isInView || ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      // dot 0 + label 0 together — slightly staggered
      await Promise.all([
        dotCtrls[0].start({ scale: 1, opacity: 1,
          transition: { type: "spring", stiffness: 380, damping: 22 } }),
        numCtrls[0].start({ opacity: 0.75, y: 0,
          transition: { duration: 0.4, ease: EASE } }),
        lblCtrls[0].start({ opacity: 1, y: 0,
          transition: { duration: 0.5, ease: EASE, delay: 0.08 } }),
      ]);

      // draw seg 1 — dot 1 pops at 65% of path draw
      await Promise.all([
        path12Ctrl.start({ pathLength: 1, opacity: 0.85,
          transition: { duration: 0.85, ease: EASE } }),
        new Promise(r => setTimeout(() => {
          Promise.all([
            dotCtrls[1].start({ scale: 1, opacity: 1,
              transition: { type: "spring", stiffness: 360, damping: 20 } }),
            numCtrls[1].start({ opacity: 0.75, y: 0,
              transition: { duration: 0.35, ease: EASE } }),
          ]).then(r);
        }, 540)),
      ]);

      // label 1 fades in right after dot
      lblCtrls[1].start({ opacity: 1, y: 0,
        transition: { duration: 0.5, ease: EASE } });

      await new Promise(r => setTimeout(r, 120));

      // draw seg 2
      await Promise.all([
        path23Ctrl.start({ pathLength: 1, opacity: 0.85,
          transition: { duration: 0.75, ease: EASE } }),
        new Promise(r => setTimeout(() => {
          Promise.all([
            dotCtrls[2].start({ scale: 1, opacity: 1,
              transition: { type: "spring", stiffness: 340, damping: 20 } }),
            numCtrls[2].start({ opacity: 0.75, y: 0,
              transition: { duration: 0.35, ease: EASE } }),
          ]).then(r);
        }, 490)),
      ]);

      lblCtrls[2].start({ opacity: 1, y: 0,
        transition: { duration: 0.5, ease: EASE } });
    };

    run();
  }, [isInView]);

  return (
    <div ref={panelRef} className="relative flex-1 min-h-[600px]">
      <motion.svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="desktopCurveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c2410c" stopOpacity="1" />
          </linearGradient>
          <filter id="desktopCurveGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#ea580c" floodOpacity="0.24" />
            <feGaussianBlur stdDeviation="3.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path id="wv-12" stroke="url(#desktopCurveGradient)" strokeWidth="4" strokeLinecap="round" filter="url(#desktopCurveGlow)"
          initial={{ pathLength: 0, opacity: 0 }} animate={path12Ctrl} />
        <motion.path id="wv-23" stroke="url(#desktopCurveGradient)" strokeWidth="4" strokeLinecap="round" filter="url(#desktopCurveGlow)"
          initial={{ pathLength: 0, opacity: 0 }} animate={path23Ctrl} />
        {STEPS.map((_, i) => (
          <motion.circle key={i} data-dot={i} r="8" fill="#c0bab5"
            initial={{ scale: 0, opacity: 0 }} animate={dotCtrls[i]}
            style={{ transformOrigin: "center" }} />
        ))}
        {STEPS.map((s, i) => (
          <motion.text key={i} data-stepnum={i} x="0" y="0"
            fontSize="96" fontWeight="700" fill="#758A93" fontFamily="inherit"
            initial={{ opacity: 0, y: 10 }} animate={numCtrls[i]}>
            {s.num}
          </motion.text>
        ))}
      </motion.svg>

      {STEPS.map((s, i) => (
        <motion.div key={i} data-label={i}
          style={{ position: "absolute", width: `${CARD_W}px` }}
          className="z-10"
          initial={{ opacity: 0, y: 22 }}
          animate={lblCtrls[i]}
        >
          {s.labelPos === "above" && <div className="mb-3">{s.ui}</div>}
          <p className="text-sm font-semibold text-slate-900 leading-snug">{s.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-800">{s.desc}</p>
          {s.labelPos === "below" && <div className="mt-3">{s.ui}</div>}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Header block (reused on both layouts) ─────────────────────────────────

function Header({ className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.09, ease: EASE } },
      }}
    >
      {[
        <p key="eye" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e05a35]">Woice operation</p>,
        <h2 key="h" className="mt-3 text-3xl font-semibold leading-[1.15] tracking-tight text-slate-900 sm:mt-4 sm:text-4xl lg:text-5xl">
          Turn feedback <br />
           into powerful testimonials
        </h2>,
        <p key="sub" className="mt-3 max-w-xs text-sm leading-6 text-slate-500 sm:mt-5 sm:text-base sm:leading-7">
          Turn raw customer feedback into polished testimonials — automatically and in minutes.
        </p>,
        <motion.button key="btn" type="button"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#e05a35] px-6 text-sm font-semibold text-white sm:mt-8 sm:h-11 sm:px-7"
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>,
      ].map((child, i) => (
        <motion.div key={i} variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
        }}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-t from-white to-[#ecf0f0] px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">

        {/* ── Mobile (hidden on lg+) ── */}
        <div className="lg:hidden">
          <Header className="mb-8 sm:mb-10" />
          <MobileWave />
        </div>

        {/* ── Desktop (hidden below lg) ── */}
        <div className="hidden lg:flex lg:flex-row lg:items-start lg:gap-8">
          <Header className="w-[300px] flex-shrink-0 pt-24" />
          <DesktopWave />
        </div>

      </div>
    </section>
  );
}
