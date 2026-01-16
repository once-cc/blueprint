import { useEffect } from "react";
import { HeroFounderTransition } from "@/components/home/HeroFounderTransition";
import { StickyNav } from "@/components/sections/StickyNav";
import { ApproachProjectsBand } from "@/components/home/ApproachProjectsBand";
import { CinematicFooter } from "@/components/sections/CinematicFooter";
import { CustomerJourneyIndicator } from "@/components/ui/CustomerJourneyIndicator";

const Index = () => {
  useEffect(() => {
  }, []);

  return (
    <main className="relative bg-background text-foreground">
      <StickyNav />
      <CustomerJourneyIndicator />

      {/* SEO */}
      <title>Cleland Studio — Premium Web Design & Brand Strategy</title>
      <meta
        name="description"
        content="World-class web design and brand strategy for ambitious SME founders. The C.R.A.F.T.™ Framework transforms your website into a conversion system."
      />

      {/* Unified Hero + Authority + Founder transition (single scroll controller) */}
      <HeroFounderTransition />

      {/* Shared sticky video background spanning Approach + Projects + Services + C.R.A.F.T.™ */}
      <ApproachProjectsBand />

      <CinematicFooter id="begin" />
    </main>
  );
};

export default Index;
