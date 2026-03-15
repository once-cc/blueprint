import { forwardRef } from 'react';
import { BlueprintDiscovery, SALES_PERSONALITIES } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { ConfiguratorModuleTitle } from '@/components/ui/Typography';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import {
  Flame, Target, Focus, Radio, Gem,
  Key, Map, Crosshair, Aperture, Command,
} from 'lucide-react';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';

interface CTAEnergyStepProps {
  discovery: BlueprintDiscovery;
  onUpdate: (updates: Partial<BlueprintDiscovery>) => void;
  onBack: () => void;
  onNext: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap: Flame,
  Award: Gem,
  MessageCircle: Radio,
  Compass: Map,
  BookOpen: Focus,
  Shield: Key,
  Crown: Target,
  Mail: Command,
  PartyPopper: Aperture,
  TrendingUp: Crosshair,
};

// Map SALES_PERSONALITIES to dropdown items
const salesPersonalityItems: DropdownItem[] = SALES_PERSONALITIES.map((personality) => {
  const Icon = iconMap[personality.icon] || Flame;
  return {
    value: personality.id,
    label: personality.title,
    subtitle: personality.story,
    icon: <Icon className="w-4 h-4" />,
    renderPreview: (
      <span className="text-[11px] text-accent font-medium">
        "{personality.exampleCta}"
      </span>
    ),
  };
});

export const CTAEnergyStep = forwardRef<HTMLDivElement, CTAEnergyStepProps>(
  function CTAEnergyStep({
    discovery,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    const handlePersonalitySelect = (value: string | string[]) => {
      const personalityId = typeof value === 'string' ? value : value[0];
      const personality = SALES_PERSONALITIES.find(p => p.id === personalityId);
      if (personality) {
        onUpdate({
          salesPersonality: personalityId as BlueprintDiscovery['salesPersonality'],
          ctaPrimaryLabel: personality.exampleCta,
        });
      }
    };

    // Validation - Relaxed UX to allow defaults
    const isValid = true;

    return (
      <StepLayout
        ref={ref}
        act="discovery"
        stepNumber={3}
        title="CTA Energy"
        framing="How should your platform make the first ask?"
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-10">
          {/* Sales Personality Dropdown */}
          <div>
            <ConfiguratorDropdown
              label="Sales Personality"
              required
              value={discovery.salesPersonality ?? null}
              onChange={handlePersonalitySelect}
              items={salesPersonalityItems}
              maxHeight={400}
              hideUnselectedHelperText
            />
          </div>

          {/* Primary CTA Label */}
          <div
            className="space-y-3"
          >
            <ConfiguratorModuleTitle className="mb-3 flex items-center gap-2">
              Primary CTA Button Label <span className="text-destructive">*</span>
              {discovery.ctaPrimaryLabel?.trim() && <CheckCircle2 className="w-4 h-4 text-accent" />}
            </ConfiguratorModuleTitle>
            <Input
              value={discovery.ctaPrimaryLabel || ''}
              onChange={(e) => onUpdate({ ctaPrimaryLabel: e.target.value })}
              placeholder="e.g., Book a Call, Get Started, Shop Now"
              className="max-w-md text-sm bg-card/95 dark:bg-zinc-950/90 border-border/40 dark:border-border/50 rounded-xl px-4 py-3 h-auto"
            />
          </div>

          {/* CTA Strategy Notes */}
          <div
            className="space-y-3"
          >
            <ConfiguratorModuleTitle className="mb-3 flex items-center gap-2">
              CTA Strategy Notes
              <span className="text-muted-foreground font-normal normal-case tracking-normal ml-2">(Optional)</span>
            </ConfiguratorModuleTitle>
            <Textarea
              value={discovery.ctaStrategyNotes || ''}
              onChange={(e) => onUpdate({ ctaStrategyNotes: e.target.value })}
              placeholder="Any specific thoughts on your conversion strategy..."
              className="cfg-input min-h-[100px] resize-none text-sm bg-card/95 dark:bg-zinc-950/90 rounded-xl px-4 py-3 ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </StepLayout>
    );
  }
);
