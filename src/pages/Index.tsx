import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { FeaturedSection } from "@/components/FeaturedSection";
import { ConditionRatingSection } from "@/components/ConditionRatingSection";
import { NewlyAddedSection } from "@/components/NewlyAddedSection";
import { WhatsAppCTASection } from "@/components/WhatsAppCTASection";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <FeaturedSection />
      <ConditionRatingSection />
      <NewlyAddedSection />
      <WhatsAppCTASection />

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container text-center">
          <p className="font-serif text-lg text-gold/60">Golden Planet Watches</p>
          <p className="font-sans text-xs text-muted-foreground mt-2 tracking-wider">
            Authenticated Pre-Owned Luxury Timepieces
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
