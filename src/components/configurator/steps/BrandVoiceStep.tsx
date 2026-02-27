import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDiscovery } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { VoiceAxisSlider } from '../ui/VoiceAxisSlider';

interface BrandVoiceStepProps {
  discovery: BlueprintDiscovery;
  onUpdate: (updates: Partial<BlueprintDiscovery>) => void;
  onBack: () => void;
  onNext: () => void;
}

// Slider zone definitions
const TONE_ZONES = ['Formal', 'Professional', 'Neutral', 'Approachable', 'Friendly'] as const;
const PRESENCE_ZONES = ['Subtle', 'Minimal', 'Balanced', 'Confident', 'Bold'] as const;
const PERSONALITY_ZONES = ['Elegant', 'Calm', 'Authentic', 'Playful', 'Rebellious'] as const;
const ENERGY_ZONES = ['Peaceful', 'Calm', 'Balanced', 'Energized', 'Electric'] as const;

export const BrandVoiceStep = forwardRef<HTMLDivElement, BrandVoiceStepProps>(
  function BrandVoiceStep({
    discovery,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    // Extract values from brandVoice or use legacy fields as fallback
    const brandVoice = discovery.brandVoice || {};

    const handleToneChange = (value: string) => {
      onUpdate({
        brandVoice: { ...brandVoice, tone: value },
        tonePrimary: value, // Keep legacy field in sync
      });
    };

    const handlePresenceChange = (value: string) => {
      onUpdate({
        brandVoice: { ...brandVoice, presence: value },
      });
    };

    const handlePersonalityChange = (value: string) => {
      onUpdate({
        brandVoice: { ...brandVoice, personality: value },
        personalityTags: [value], // Keep legacy field in sync
      });
    };

    const handleEnergyChange = (value: string) => {
      onUpdate({
        brandVoice: {
          ...brandVoice,
          visitorFeeling: { energy: value },
        },
        targetFeelings: [value],
      });
    };

    // Validation - at least tone must be set
    const isValid = !!(brandVoice.tone || discovery.tonePrimary);

    return (
      <StepLayout
        ref={ref}
        act="discovery"
        stepNumber={2}
        title="Brand Voice"
        framing="Tune your brand's emotional signature."
        helperText={!isValid ? "Adjust the sliders to define your brand voice" : undefined}
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-12 max-w-2xl mx-auto">
          {/* Custom controls spacing since authority text was removed */}

          {/* Tone Balance Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-medium text-foreground">Tone Balance</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                How should your brand communicate?
              </p>
            </div>
            <VoiceAxisSlider
              zones={TONE_ZONES}
              value={brandVoice.tone || discovery.tonePrimary}
              onChange={handleToneChange}
              leftLabel="Formal"
              rightLabel="Friendly"
            />
          </motion.div>

          {/* Brand Presence Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-medium text-foreground">Brand Presence</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                How visually assertive should your brand feel?
              </p>
            </div>
            <VoiceAxisSlider
              zones={PRESENCE_ZONES}
              value={brandVoice.presence}
              onChange={handlePresenceChange}
              leftLabel="Minimal"
              rightLabel="Bold"
            />
          </motion.div>

          {/* Brand Personality Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-medium text-foreground">Brand Personality</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                What's your dominant character trait?
              </p>
            </div>
            <VoiceAxisSlider
              zones={PERSONALITY_ZONES}
              value={brandVoice.personality || discovery.personalityTags?.[0]}
              onChange={handlePersonalityChange}
              leftLabel="Reserved"
              rightLabel="Expressive"
            />
          </motion.div>

          {/* Visitor Emotional Outcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="space-y-1 text-center">
              <h3 className="text-sm font-medium text-foreground">Visitor Emotional Outcome</h3>
              <p className="text-xs text-muted-foreground hidden sm:block">
                How should visitors feel after experiencing your brand?
              </p>
            </div>

            <VoiceAxisSlider
              zones={ENERGY_ZONES}
              value={brandVoice.visitorFeeling?.energy || discovery.targetFeelings?.[0]}
              onChange={handleEnergyChange}
              leftLabel="Calm"
              rightLabel="Energized"
            />
          </motion.div>

          {/* Summary Preview */}
          {isValid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-border/30 text-center"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Your Brand Voice
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                A <span className="text-accent font-medium">{brandVoice.tone || 'Neutral'}</span> brand
                with <span className="text-accent font-medium">{brandVoice.presence || 'Balanced'}</span> presence,
                expressing <span className="text-accent font-medium">{brandVoice.personality || 'Authentic'}</span> personality
                {brandVoice.visitorFeeling?.energy && (
                  <>, leaving visitors feeling <span className="text-accent font-medium">{brandVoice.visitorFeeling.energy}</span></>
                )}.
              </p>
            </motion.div>
          )}
        </div>
      </StepLayout>
    );
  }
);
