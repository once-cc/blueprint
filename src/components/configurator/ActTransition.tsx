import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    if (discovery.brandArchetype) {
      items.push({ label: 'Brand Archetype', value: formatValue(discovery.brandArchetype) });
    }
    if (discovery.salesPersonality) {
      items.push({ label: 'CTA Style', value: formatValue(discovery.salesPersonality) });
    }
    return items;
  }

  if (act === 'design' && design) {
    const items: { label: string; value: string }[] = [];
    if (design.visualStyle) {
      items.push({ label: 'Visual Style', value: formatValue(design.visualStyle) });
    }
    if (design.typographyStyle) {
      items.push({ label: 'Typography', value: formatValue(design.typographyStyle) });
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
      className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-16rem)] text-center px-4"
    >
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              delay: 0.3 + i * 0.1,
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute"
            style={{
              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
              left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 60}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
          </motion.div>
        ))}

        {/* Check Icon */}
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-10 h-10 text-accent" />
          </motion.div>
        </div>
      </motion.div>

      {/* Completed Act Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-2"
      >
        {completedInfo.label} Complete
      </motion.p>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground mb-6"
      >
        Excellent choices.
      </motion.h2>

      {/* Summary */}
      {summaryItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-muted/30 rounded-2xl border border-border/30 p-6 mb-8 max-w-md w-full"
        >
          <div className="space-y-3">
            {summaryItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground font-medium">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next Act Preview */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground mb-6"
      >
        Next: <span className="text-foreground">{nextInfo.label}</span> — {nextInfo.description}
      </motion.p>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button onClick={onContinue} size="lg" className="gap-2">
          Continue to {nextInfo.label}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
