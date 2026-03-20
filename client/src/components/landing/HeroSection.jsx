import HeroActions from "./HeroActions";
import HeroBadge from "./HeroBadge";
import TrustedBySection from "./TrustedBySection";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 " />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center mt-5">
        <HeroBadge />

        <div className="mt-10 max-w-5xl space-y-8 ">
          <h1 className=" font-sans text-5xl font-semibold leading-[0.92] tracking-normal text-slate-950 sm:text-6xl lg:text-[5rem]">
            Collect testimonials on  WhatsApp.
          </h1>

          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-slate-500 sm:text-xl">
            Reach customers on WhatsApp — and get up to <br /> 3× more responses than email.
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
