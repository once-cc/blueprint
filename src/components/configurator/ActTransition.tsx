import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DiscoverySvg } from '@/components/marketing/graphics/DiscoverySvg';
import { DesignSvg } from '@/components/marketing/graphics/DesignSvg';
import { DeliverSvg } from '@/components/marketing/graphics/DeliverSvg';
import { ACT_INFO, ConfiguratorAct, BlueprintDiscovery, BlueprintDesign } from '@/types/blueprint';

interface ActTransitionProps {
  completedAct: ConfiguratorAct;
  nextAct: ConfiguratorAct;
  onContinue: () => void;
  discovery?: BlueprintDiscovery;
  design?: BlueprintDesign;
}

const getSummaryItems = (
  act: ConfiguratorAct,
  discovery?: BlueprintDiscovery,
  design?: BlueprintDesign
): { label: string; value: string }[] => {
  if (act === 'discovery' && discovery) {
    const items: { label: string; value: string }[] = [];
    if (discovery.businessType) {
      items.push({ label: 'Business Type', value: formatValue(discovery.businessType) });
    }
    if (discovery.primaryPurpose) {
      items.push({ label: 'Purpose', value: formatValue(discovery.primaryPurpose) });
    }
    if (discovery.mainConversionGoal) {
      items.push({ label: 'Primary Goal', value: formatValue(discovery.mainConversionGoal) });
    }
    if (discovery.brandArchetype) {
      items.push({ label: 'Brand Archetype', value: formatValue(discovery.brandArchetype) });
    }
    if (discovery.salesPersonality) {
      items.push({ label: 'CTA Style', value: formatValue(discovery.salesPersonality) });
    }
    if (discovery.conversionGoals && discovery.conversionGoals.length > 0) {
      items.push({ label: 'Specific Goals', value: `${discovery.conversionGoals.length} Selected` });
    }
    return items;
  }

  if (act === 'design' && design) {
    const items: { label: string; value: string }[] = [];
    if (design.visualStyle) {
      items.push({ label: 'Visual Style', value: formatValue(design.visualStyle) });
    }
    const typography = design.typography_direction || design.typographyStyle;
    if (typography) {
      items.push({ label: 'Typography', value: formatValue(typography) });
    }
    if (design.imageryStyle) {
      items.push({ label: 'Imagery Style', value: formatValue(design.imageryStyle) });
    }
    if (design.colourRelationship) {
      items.push({ label: 'Color Palette', value: formatValue(design.colourRelationship) });
    }
    if (design.paletteEnergy) {
      items.push({ label: 'Color Energy', value: `${design.paletteEnergy}/10` });
    }
    if (design.animationIntensity) {
      items.push({ label: 'Animation', value: `${design.animationIntensity}/10` });
    }
    return items;
  }

  return [];
};

const formatValue = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ActTransition({
  completedAct,
  nextAct,
  onContinue,
  discovery,
  design,
}: ActTransitionProps) {
  const completedInfo = ACT_INFO[completedAct];
  const nextInfo = ACT_INFO[nextAct];
  const summaryItems = getSummaryItems(completedAct, discovery, design);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] supports-[height:100dvh]:min-h-[calc(100dvh-12rem)] md:min-h-[calc(100vh-16rem)] md:supports-[height:100dvh]:min-h-[calc(100dvh-16rem)] text-center px-4 relative"
    >
      {/* Subtle Ambient Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Celebration Animation / Act SVG */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-6 w-full max-w-[240px] aspect-square mx-auto"
      >
        {completedAct === 'discovery' && <DiscoverySvg />}
        {completedAct === 'design' && <DesignSvg />}
        {completedAct === 'deliver' && <DeliverSvg />}
      </motion.div>

      {/* Completed Act Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-sm uppercase tracking-[0.2em] text-accent font-medium mb-2"
      >
        {completedInfo.label} Complete
      </motion.p>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-2xl md:text-3xl font-nohemi font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 mb-8"
      >
        Excellent choices.
      </motion.h2>

      {/* Summary Bento Grid */}
      {summaryItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 w-full max-w-2xl"
        >
          {summaryItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="col-span-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center text-center cursor-default hover:bg-white/[0.05] transition-colors"
            >
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase mb-2">
                {item.label}
              </p>
              <p className="text-sm font-medium text-white/90">
                {item.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Next Act Preview & Action Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-6 flex items-center justify-center gap-2 flex-wrap">
          Next: <span className="text-white/80">{nextInfo.label}</span> <span className="text-white/20">—</span> <span>{nextInfo.description}</span>
        </p>

        {/* Premium CTA Button */}
        <button
          onClick={onContinue}
          className="relative w-full h-14 rounded-xl font-medium text-base text-black bg-white overflow-hidden group transition-transform active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center gap-2 h-full">
            Continue to {nextInfo.label}
            <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
}
