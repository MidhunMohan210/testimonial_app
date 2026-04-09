import { Sparkles } from "lucide-react";
import HeroActions from "./HeroActions";
import HeroBadge from "./HeroBadge";
import TrustedBySection from "./TrustedBySection";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
      {/* <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-100"
          viewBox="0 0 1440 560"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-40 120C210 72 430 78 650 150C880 225 1060 320 1285 288"
            stroke="black"
            strokeOpacity="0.28"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M-60 360C180 390 440 410 690 372C935 336 1110 296 1285 288"
            stroke="black"
            strokeOpacity="0.28"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div> */}

      <div className="relative z-10 mx-auto mt-5 flex max-w-6xl flex-col items-center text-center">
        <div className="woice-trust-badge inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/85 px-4 py-2 text-sm font-semibold  shadow-[0_18px_40px_-28px_rgba(99,102,241,0.4)] backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Built for brands that grow on trust
        </div>

        <div className="mt-10 max-w-5xl space-y-8 ">
          <h1 className=" text-gray-900  font-sans text-2xl font-semibold leading-[0.98] tracking-wide sm:text-5xl lg:text-[5rem]">
            Turn customer feedback into{" "}
            <span className="">powerful </span>
            <span className="relative inline-block px-2 py-0.5 ">
              <span className="absolute inset-x-0 bottom-0 top-1 -z-10 rounded-lg bg-[#fec89a]/60 shadow-[0_10px_24px_-18px_rgba(99,102,241,0.45)] -rotate-[1.9deg]" />
              testimonials
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-slate-500 sm:text-xl">
Send one link to collect customer feedback, keep negative responses private, and showcase your best testimonials beautifully on your website.          </p>
        </div>

        <div className="mt-12">
          <HeroActions />
        </div>

        <TrustedBySection />
      </div>
    </section>
  );
}
