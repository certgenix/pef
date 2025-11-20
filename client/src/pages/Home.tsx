import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ChairmanMessageSection from "@/components/ChairmanMessageSection";
import FiveRolesSection from "@/components/FiveRolesSection";
import PlatformBenefitsSection from "@/components/PlatformBenefitsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import GlobalReachSection from "@/components/GlobalReachSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ChairmanMessageSection />
        <FiveRolesSection />
        <PlatformBenefitsSection />
        <HowItWorksSection />
        <GlobalReachSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
