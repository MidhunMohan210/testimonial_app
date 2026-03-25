import LandingHeader from "../components/landing/LandingHeader";
import HeroSection from "../components/landing/HeroSection";
import WhatsAppShowcaseSection from "../components/landing/WhatsAppShowcaseSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(247,247,245,0.45)_58%,transparent_75%)]" />
      <LandingHeader />
      <HeroSection />
      <WhatsAppShowcaseSection />
    </main>
  );
}
