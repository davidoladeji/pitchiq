import AppNav from "@/components/AppNav";
import Footer from "@/components/Footer";
import LandingHero from "@/components/landing/LandingHero";
import LandingDemo from "@/components/landing/LandingDemo";
import LandingSteps from "@/components/landing/LandingSteps";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingCTA from "@/components/landing/LandingCTA";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-white"
      >
        Skip to main content
      </a>
      <AppNav variant="landing" />

      <main id="main" tabIndex={-1}>
        <LandingHero />
        <LandingDemo />
        <LandingSteps />
        <LandingFeatures />
        <LandingPricing />
        <LandingTrust />
        <LandingCTA />
      </main>

      <Footer />
    </div>
  );
}
