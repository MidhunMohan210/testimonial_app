import LandingHeader from "../components/landing/LandingHeader";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import WhatsAppShowcaseSection from "../components/landing/WhatsAppShowcaseSection";
import TestimonialWidget from "../components/landing/TestimonialWidget";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44rem] bg-[radial-gradient(70%_58%_at_50%_0%,rgba(254,200,154,0.22),rgba(254,200,154,0.08)_45%,rgba(255,255,255,0)_78%)]" />
        <div className="relative z-10">
          <HeroSection />
        </div>
      </div>
      <HowItWorksSection />

      <WhatsAppShowcaseSection />
      {/* Add widget here */}
      <TestimonialWidget />
    </main>
  );
}
