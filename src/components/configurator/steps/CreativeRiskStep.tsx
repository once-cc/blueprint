import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlueprintDeliver } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { VoiceAxisSlider } from '../ui/VoiceAxisSlider';
import { cn } from '@/lib/utils';
import { Shield, Sparkles, Rocket } from 'lucide-react';

interface CreativeRiskStepProps {
  deliver: BlueprintDeliver;
  onUpdate: (data: Partial<BlueprintDeliver>) => void;
  onBack: () => void;
  onNext: () => void;
}

const RISK_ZONES = ['Safe', 'Cautious', 'Balanced', 'Bold', 'Experimental'] as const;

const zoneToRisk = (zone: string): number => {
  const map: Record<string, number> = {
    'Safe': 2,
    'Cautious': 4,
    'Balanced': 5,
    'Bold': 7,
    'Experimental': 9
  };
  return map[zone] ?? 5;
};

export const riskToZone = (value: number): string => {
  if (value <= 2) return 'Safe';
  if (value <= 4) return 'Cautious';
  if (value <= 6) return 'Balanced';
  if (value <= 8) return 'Bold';
  return 'Experimental';
};

const riskLevels = [
  {
    min: 1,
    max: 2,
    label: 'Play It Safe',
    zone: 'Safe',
    description: 'Clean, conventional design that feels familiar and trustworthy. Proven patterns, minimal surprises.',
    icon: Shield,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
  },
  {
    min: 3,
    max: 4,
    label: 'Cautious',
    zone: 'Cautious',
    description: 'Tested design concepts with slight modern embellishments. Reliable but not completely rigid.',
    icon: Shield,
    gradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/50',
  },
  {
    min: 5,
    max: 6,
    label: 'Balanced',
    zone: 'Balanced',
    description: 'Modern and professional with tasteful creative touches. Stand out without being polarizing.',
    icon: Sparkles,
    gradient: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/50',
  },
  {
    min: 7,
    max: 8,
    label: 'Bold',
    zone: 'Bold',
    description: 'Striking visuals and engaging micro-interactions. A confident stance that captures attention.',
    icon: Rocket,
    gradient: 'from-accent/20 to-accent/10',
    borderColor: 'border-accent/50',
  },
  {
    min: 9,
    max: 10,
    label: 'Push Boundaries',
    zone: 'Experimental',
    description: 'Bold, experimental, memorable. Unconventional layouts, surprising interactions, statement design.',
    icon: Rocket,
    gradient: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/50',
  },
];

const getRiskLevel = (value: number) => {
  return riskLevels.find(level => value >= level.min && value <= level.max) || riskLevels[1];
};

export const CreativeRiskStep = forwardRef<HTMLDivElement, CreativeRiskStepProps>(
  function CreativeRiskStep({ deliver, onUpdate, onBack, onNext }, ref) {
    const riskTolerance = deliver.riskTolerance || 5;
    const currentLevel = getRiskLevel(riskTolerance);
    const currentZone = riskToZone(riskTolerance);

    const handleZoneChange = (zone: string) => {
      onUpdate({ riskTolerance: zoneToRisk(zone) });
    };

    return (
      <StepLayout
        ref={ref}
        act="deliver"
        stepNumber={8}
        title="Creative Risk"
        framing="How bold should we be with your design?"
        onBack={onBack}
        onNext={onNext}
      >
        <div className="space-y-8">
          {/* Risk Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Current Level Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLevel.label}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  'p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border backdrop-blur-sm bg-gradient-to-br',
                  currentLevel.gradient,
                  currentLevel.borderColor
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center bg-background/50 backdrop-blur-sm',
                    currentLevel.borderColor,
                    'border'
                  )}>
                    <currentLevel.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-nohemi font-medium text-foreground">
                        {currentLevel.label}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-background/50 text-xs font-medium text-foreground">
                        {currentZone}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {currentLevel.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* VoiceAxisSlider */}
            <div className="px-4">
              <VoiceAxisSlider
                zones={RISK_ZONES}
                value={currentZone}
                onChange={handleZoneChange}
                leftLabel="Conservative"
                rightLabel="Experimental"
              />
            </div>
          </motion.div>

          {/* What This Means */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border border-border/40 dark:border-border/50 bg-card/80 backdrop-blur-sm"
          >
            <h4 className="text-sm font-medium text-foreground mb-2">What This Means</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              {[
                {
                  label: 'Layout',
                  getValue: () => {
                    if (riskTolerance <= 3) return 'Standard grid layouts, familiar navigation patterns';
                    if (riskTolerance <= 6) return 'Modern layouts with creative section breaks';
                    return 'Experimental layouts, asymmetry, bold compositions';
                  }
                },
                {
                  label: 'Typography',
                  getValue: () => {
                    if (riskTolerance <= 3) return 'Clean, readable system fonts or classics';
                    if (riskTolerance <= 6) return 'Modern typefaces with personality';
                    return 'Statement typography, experimental pairings';
                  }
                },
                {
                  label: 'Animation',
                  getValue: () => {
                    if (riskTolerance <= 3) return 'Subtle transitions, minimal motion';
                    if (riskTolerance <= 6) return 'Smooth scroll animations, tasteful reveals';
                    return 'Bold interactions, parallax, dramatic reveals';
                  }
                }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <p className="font-medium text-foreground/80 mb-1">{item.label}</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${item.label}-${riskTolerance}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.getValue()}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
