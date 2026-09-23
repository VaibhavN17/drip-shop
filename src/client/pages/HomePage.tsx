import React from "react";
import { Navbar }                   from "@/components/homepage/Navbar";
import { HeroSection }              from "@/components/homepage/HeroSection";
import { TrustStrip }               from "@/components/homepage/TrustStrip";
import { ProductCategoriesSection } from "@/components/homepage/ProductCategoriesSection";
import { IrrigationFlowSection }    from "@/components/homepage/IrrigationFlowSection";
import { SubsidySection }           from "@/components/homepage/SubsidySection";
import { EstimateCTASection }       from "@/components/homepage/EstimateCTASection";
import { WhyChooseUsSection }       from "@/components/homepage/WhyChooseUsSection";
import { StatsSection }             from "@/components/homepage/StatsSection";
import { ProductShowcaseSection }   from "@/components/homepage/ProductShowcaseSection";
import { HowItWorksSection }        from "@/components/homepage/HowItWorksSection";
import { FarmerVisualSection }      from "@/components/homepage/FarmerVisualSection";
import { FAQSection }               from "@/components/homepage/FAQSection";
import { FinalCTASection }          from "@/components/homepage/FinalCTASection";
import { Footer }                   from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--warm-white)" }}>
      {/* SEO */}
      <title>Shetkari Raja — Drip Irrigation Products, Estimates & Subsidy Guidance | Maharashtra</title>

      {/* Sticky transparent → glass navbar */}
      <Navbar />

      {/* 1. Hero — full viewport */}
      <HeroSection />

      {/* 2. Trust marquee strip */}
      <TrustStrip />

      {/* 3. Product Categories */}
      <ProductCategoriesSection />

      {/* 4. Irrigation Flow / How system works */}
      <IrrigationFlowSection />

      {/* 5. Government Subsidy */}
      <SubsidySection />

      {/* 6. Estimate CTA */}
      <EstimateCTASection />

      {/* 7. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 8. Stats */}
      <StatsSection />

      {/* 9. Product Showcase (horizontal scroll) */}
      <ProductShowcaseSection />

      {/* 10. How It Works */}
      <HowItWorksSection />

      {/* 11. Farmer Parallax Visual */}
      <FarmerVisualSection />

      {/* 12. FAQ */}
      <FAQSection />

      {/* 13. Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
