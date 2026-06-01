import { useState } from "react";
import previewImage from "../../assets/landingPage/productPreview/Dashboard/dashboard.png";
import shareLink from "../../assets/landingPage/productPreview/Dashboard/shareLink.png";
import embed from "../../assets/landingPage/productPreview/Dashboard/embed.png";
import testimonials from "../../assets/landingPage/productPreview/testimonials/testimonials.png";
import feedback from "../../assets/landingPage/productPreview/feedback/feedback.png";

const sections = [
  {
    id: 0,
    number: "01",
    label: "See everything in one place",
    description:
      "Track feedback, approvals, pending reviews, and recent activity from one clean dashboard.",
    url: "app.woice.it.com/dashboard",
    mainImage: previewImage,
    topRightImage: embed,
    bottomLeftImage: shareLink,
  },
  {
    id: 1,
    number: "02",
    label: "Approve the best, hide the rest",
    description:
      "Review incoming testimonials, publish the strongest ones, and move unsuitable responses out of public view.",
    url: "app.woice.it.com/testimonials",
    mainImage: testimonials,
    topRightImage: "",
    bottomLeftImage: "",
  },
  {
    id: 2,
    number: "03",
    label: "Protect your brand reputation",
    description:
      "Low-rated responses stay private so your team can follow up internally before anything reaches your website.",
    url: "app.woice.it.com/feedback",
    mainImage: feedback,
    topRightImage: "",
    bottomLeftImage: "",
  },
];


export default function ProductPreviewSection() {
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const activeSection = sections[active];

  const handleSelect = (id) => {
    if (id === active) return;
    setActive(id);
    setAnimKey((k) => k + 1);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a352b] via-[#0f4a3d] to-[#06241d] px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
      {/* Subtle Background Glow for depth */}
      <div className="pointer-events-none absolute -right-60 -top-60 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300">
            Platform Capabilities
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Everything you need to <span className="text-emerald-400">manage testimonials.</span>
          </h2>
          <p className="mx-auto mt-6 text-lg leading-relaxed text-white/60">
          Review feedback, moderate testimonials, and manage what goes live
            from one focused workspace.
          </p>
        </div>

        {/* Body */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          
          {/* LEFT: Interactive Cards */}
          <div className="flex flex-col gap-4">
            {sections.map((section) => {
              const isActive = active === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelect(section.id)}
                  className={`group relative w-full rounded-2xl border px-6 py-6 text-left transition-all duration-500 ease-out ${
                    isActive
                      ? "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                      : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs font-bold tracking-widest transition-colors duration-300 ${
                            isActive ? "text-emerald-400" : "text-white/20 group-hover:text-white/40"
                          }`}
                        >
                          {section.number}
                        </span>
                        <h3
                          className={`text-xl font-semibold tracking-tight transition-colors duration-300 ${
                            isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                          }`}
                        >
                          {section.label}
                        </h3>
                      </div>

                      {/* Expanding description */}
                      <div
                        className={`grid transition-all duration-500 ease-in-out ${
                          isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="overflow-hidden text-[15px] leading-relaxed text-white/60 pl-9">
                          <span className="block pt-2">{section.description}</span>
                        </p>
                      </div>
                    </div>

                    {/* Animated Indicator */}
                    <div
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        isActive
                          ? "border-emerald-400/30 bg-emerald-400/20 text-emerald-300"
                          : "border-white/10 text-transparent group-hover:border-white/20"
                      }`}
                    >
                      <svg
                        className={`h-3 w-3 transition-transform duration-500 ${
                          isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Active glowing edge */}
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT: Browser frame with glow */}
          <div className="relative pt-8 lg:pt-0">
            {/* Diffuse backdrop glow for the browser window */}
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 blur-2xl opacity-40 rounded-3xl" />
            
            <div
              key={animKey}
              className="relative z-10"
              style={{ animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
            >
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1115] shadow-2xl ring-1 ring-white/5">
                {/* Browser Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3 backdrop-blur-md">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
                  </div>
                  <div className="flex items-center justify-center rounded-md border border-white/5 bg-black/20 px-4 py-1.5 shadow-inner">
                    <svg className="mr-2 h-3 w-3 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[12px] font-medium text-white/40 tracking-wide">
                      {activeSection.url}
                    </span>
                  </div>
                  <div className="w-14" /> {/* Spacer to balance flex layout */}
                </div>

                {/* Main Content Image */}
                <div className="relative bg-white">
                  <img
                    src={activeSection.mainImage}
                    alt={activeSection.label}
                    className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Floating Elements */}
              {activeSection.topRightImage && (
                <div 
                  className="absolute -right-6 -top-6 z-20 w-[160px] overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:w-[320px]"
                  style={{ animation: "floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
                >
                  <img
                    src={activeSection.topRightImage}
                    alt={`${activeSection.label} highlight`}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              {activeSection.bottomLeftImage && (
                <div 
                  className="absolute -bottom-8 -left-6 z-20 w-[150px] overflow-hidden rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:w-[240px]"
                  style={{ animation: "floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
                >
                  <img
                    src={activeSection.bottomLeftImage}
                    alt={`${activeSection.label} highlight`}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(15px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}