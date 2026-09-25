import React from "react";
import { Navbar }                   from "@/components/homepage/Navbar";
import { HeroSection }              from "@/components/homepage/HeroSection";
import { TrustStrip }               from "@/components/homepage/TrustStrip";
import { ProductCategoriesSection } from "@/components/homepage/ProductCategoriesSection";
import { SubsidySection }           from "@/components/homepage/SubsidySection";
import { EstimateCTASection }       from "@/components/homepage/EstimateCTASection";
import { WhyChooseUsSection }       from "@/components/homepage/WhyChooseUsSection";
import { StatsSection }             from "@/components/homepage/StatsSection";
import { FarmerVisualSection }      from "@/components/homepage/FarmerVisualSection";
import { FinalCTASection }          from "@/components/homepage/FinalCTASection";
import { Footer }                   from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#fffdf7" }}>
      <title>शेतकरी राजा मोरे हार्डवेअर — ड्रिप सिंचन, पाईप, शेती साहित्य | लाख खंडाळा, महाराष्ट्र</title>
      <meta name="description" content="शेतकरी राजा मोरे हार्डवेअर — लाख खंडाळा, महाराष्ट्र. ड्रिप पाईप, पीव्हीसी पाईप, फिटिंग्ज, व्हाल्व्ह आणि शेती साहित्य. सरकारी अनुदान मार्गदर्शन व ऑनलाईन अंदाज सेवा." />

      {/* Sticky navbar */}
      <Navbar />

      {/* 1. Hero — real shop photo + Marathi identity */}
      <HeroSection />

      {/* 2. Trust strip */}
      <TrustStrip />

      {/* 3. Product Categories */}
      <ProductCategoriesSection />

      {/* 4. Government Subsidy */}
      <SubsidySection />

      {/* 5. Estimate CTA */}
      <EstimateCTASection />

      {/* 6. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 7. Stats counter */}
      <StatsSection />

      {/* 8. Real Shop Section with contact */}
      <FarmerVisualSection />

      {/* 9. Final CTA */}
      <FinalCTASection />

      {/* Footer with contact details */}
      <Footer />
    </div>
  );
}
