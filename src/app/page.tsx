import AppNav from "@/components/AppNav";
import Footer from "@/components/Footer";
import LandingHero from "@/components/landing/LandingHero";
import LandingDemo from "@/components/landing/LandingDemo";
import LandingPIQDeepDive from "@/components/landing/LandingPIQDeepDive";
import LandingNumbers from "@/components/landing/LandingNumbers";
import LandingTransformation from "@/components/landing/LandingTransformation";
import LandingSteps from "@/components/landing/LandingSteps";
import LandingPersonas from "@/components/landing/LandingPersonas";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingSocialProof from "@/components/landing/LandingSocialProof";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingCTA from "@/components/landing/LandingCTA";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header aria-label="Site header">
        <AppNav variant="landing" />
      </header>

      <main id="main" tabIndex={-1} aria-labelledby="hero-heading">
        <LandingHero />
        <LandingDemo />
        <LandingPIQDeepDive />
        <LandingNumbers />
        <LandingTransformation />
        <LandingSteps />
        <LandingPersonas />
        <LandingFeatures />
        <LandingSocialProof />
        <LandingPricing />
        <LandingTrust />
        <LandingCTA />
      </main>

      <Footer />
    </div>
  );
}
