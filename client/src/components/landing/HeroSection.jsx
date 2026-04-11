import HeroActions from "./HeroActions";
import TrustedBySection from "./TrustedBySection";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-transparent px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col items-center text-center sm:mt-24">
        <div className="mt-8 max-w-4xl space-y-5 sm:mt-10 sm:space-y-7">
          <h1 className="font-sans text-[1.95rem] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[3.5rem] sm:leading-[1.05] sm:tracking-[-0.035em] lg:text-[4.5rem]">
            <span className="block">Collect feedback.</span>
            <span className="block">Hide the negative.</span>
            <span className="block">Showcase your best</span>
            <span className="block">
              <span className="relative inline-block px-2 py-1">
                <span className="absolute inset-0 -z-10 rounded-lg bg-[#fec89a]/70 rotate-[-1.5deg]" />
                testimonials
              </span>
              .
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-sm font-normal leading-6 text-slate-500 sm:text-lg sm:leading-7">
            Send one simple link to your customers, collect feedback, and
            automatically turn positive responses into testimonials.
          </p>
        </div>

        <div className="mt-12">
          <HeroActions />
        </div>

        <TrustedBySection />
      </div>
    </section>
  );
}
