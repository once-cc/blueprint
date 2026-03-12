import { forwardRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDeliver, PAGE_OPTIONS, FEATURE_OPTIONS } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  Home, User, Briefcase, FolderOpen, FileText,
  Mail, ShoppingCart, Users, MessageSquare, HelpCircle,
  Calendar, Store, UserCircle, Newspaper, Send,
  Bot, BarChart, Globe, Languages, FormInput, Rocket, CheckCircle2,
  Compass, Palette, TrendingUp
} from 'lucide-react';
import { ConfiguratorOption } from '../ui/ConfiguratorOption';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';
import { ConfiguratorModuleTitle, ConfiguratorBody } from '@/components/ui/Typography';

interface FunctionalityStepProps {
  deliver: BlueprintDeliver;
  onUpdate: (data: Partial<BlueprintDeliver>) => void;
  onBack: () => void;
  onNext: () => void;
}

const pageIcons: Record<string, React.ElementType> = {
  'Home': Home,
  'About': User,
  'Services': Briefcase,
  'Portfolio': FolderOpen,
  'Blog': FileText,
  'Contact': Mail,
  'Shop': ShoppingCart,
  'Team': Users,
  'Testimonials': MessageSquare,
  'FAQ': HelpCircle,
};

const featureIcons: Record<string, React.ElementType> = {
  'Booking System': Calendar,
  'E-commerce': Store,
  'Client Portal': UserCircle,
  'CMS / Blog': Newspaper,
  'Email Marketing': Send,
  'Chat-bot': Bot,
  'Analytics Dashboard': BarChart,
  'SEO Tools': Globe,
  'Multi-language': Languages,
  'Custom Forms': FormInput,
  'Lead or Sales Funnel': Rocket,
  'Other': HelpCircle,
};

const timelineOptions = [
  { id: 'urgent', label: 'Urgent', description: '<7 days' },
  { id: '4_6_weeks', label: 'Standard', description: '2-4 weeks' },
  { id: '6_10_weeks', label: 'Extended', description: '6-10 weeks' },
  { id: 'flexible', label: 'Flexible', description: 'No rush' },
];

const budgetOptions = [
  { id: 'under_5k', label: 'Under $5K', description: 'Essential build' },
  { id: '5_10k', label: '$5K - $10K', description: 'Full platform' },
  { id: '10_25k', label: '$10K - $25K', description: 'Premium experience' },
  { id: 'flexible', label: 'Flexible', description: "For the right outcome, let's discuss" },
];

// Map FEATURE_OPTIONS to dropdown items
const featureItems: DropdownItem[] = FEATURE_OPTIONS.map((feature) => {
  const Icon = featureIcons[feature] || HelpCircle;
  return {
    value: feature,
    label: feature,
    icon: <Icon className="w-4 h-4" />,
  };
});

// System domains for non-interactive framing
const systemDomains = [
  {
    id: 'strategy',
    title: 'Strategy & Direction',
    icon: Compass,
    items: ['Positioning', 'Messaging', 'Audience clarity']
  },
  {
    id: 'design',
    title: 'Design & Build',
    icon: Palette,
    items: ['Visual system', 'Platform architecture', 'Performance & structure']
  },
  {
    id: 'growth',
    title: 'Growth & Continuity',
    icon: TrendingUp,
    items: ['Conversion paths', 'Measurement', 'Iteration readiness']
  }
];

export const FunctionalityStep = forwardRef<HTMLDivElement, FunctionalityStepProps>(
  function FunctionalityStep({ deliver, onUpdate, onBack, onNext }, ref) {
    const selectedPages = deliver.pages || [];
    const selectedFeatures = deliver.features || [];

    // Track which system domains have been "acknowledged" (for subtle interactivity)
    const [acknowledgedDomains, setAcknowledgedDomains] = useState<Set<string>>(new Set());

    const togglePage = (page: string) => {
      const newPages = selectedPages.includes(page)
        ? selectedPages.filter(p => p !== page)
        : [...selectedPages, page];
      onUpdate({ pages: newPages });
    };

    const handleFeaturesChange = (value: string | string[]) => {
      const features = Array.isArray(value) ? value : [value];
      onUpdate({ features });
    };

    const handleDomainClick = (domainId: string) => {
      setAcknowledgedDomains(prev => {
        const next = new Set(prev);
        if (next.has(domainId)) {
          next.delete(domainId);
        } else {
          next.add(domainId);
        }
        return next;
      });
    };

    // Validation
    const isValid = true;

    return (
      <StepLayout
        ref={ref}
        act="deliver"
        stepNumber={7}
        title="Functionality & Scope"
        framing="What does your platform need to do?"
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-10">
          {/* Pages Grid */}
          <div>
            <Label className="mb-4 text-sm font-medium flex items-center gap-2 text-foreground">
              Pages Required <span className="text-destructive">*</span>
              {selectedPages.length > 0 && <CheckCircle2 className="w-4 h-4 text-accent" />}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PAGE_OPTIONS.map((page, index) => {
                const Icon = pageIcons[page] || Home;
                const isSelected = selectedPages.includes(page);
                return (
                  <ConfiguratorOption
                    key={page}
                    value={page}
                    label={page}
                    icon={<Icon className="w-5 h-5 flex-shrink-0" />}
                    isSelected={isSelected}
                    onSelect={() => togglePage(page)}
                    variant="chip"
                    indicator="none"
                    index={index}
                  />
                );
              })}
            </div>
          </div>

          {/* Features & Integrations Dropdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ConfiguratorDropdown
              label="Features & Integrations"
              value={selectedFeatures}
              onChange={handleFeaturesChange}
              items={featureItems}
              maxHeight={360}
              multiSelect
              hideUnselectedHelperText
            />
          </motion.div>

          {/* System Domains - Subtle Interactive Framing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <ConfiguratorModuleTitle className="text-foreground block text-center">
                Delivery Focus Areas
              </ConfiguratorModuleTitle>
              <ConfiguratorBody className="text-center">
                These domains guide how we structure execution.
                Specific inclusions are confirmed after strategy alignment.
              </ConfiguratorBody>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {systemDomains.map((domain, index) => {
                const Icon = domain.icon;
                const isAcknowledged = acknowledgedDomains.has(domain.id);

                return (
                  <ConfiguratorOption
                    key={domain.id}
                    value={domain.id}
                    label={domain.title}
                    description={(
                      <ul className="space-y-1 ml-1 mt-1">
                        {domain.items.map((item, itemIndex) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index + 0.05 * itemIndex }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <motion.span
                              animate={{
                                opacity: isAcknowledged ? 1 : 0.6,
                                x: isAcknowledged ? 2 : 0
                              }}
                              transition={{ duration: 0.2 }}
                              className={cn(
                                'transition-colors',
                                isAcknowledged && 'text-accent/70'
                              )}
                            >
                              •
                            </motion.span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                    icon={<Icon className="w-4 h-4" />}
                    isSelected={isAcknowledged}
                    onSelect={() => handleDomainClick(domain.id)}
                    variant="default"
                    indicator="check"
                    index={index}
                  />
                );
              })}
            </div>

            {/* Subtle feedback when all acknowledged */}
            {acknowledgedDomains.size === systemDomains.length && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-accent/70 text-center pt-2"
              >
                All domains acknowledged ✓
              </motion.p>
            )}
          </motion.div>

          {/* Timeline & Budget */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Timeline */}
            <div>
              <ConfiguratorModuleTitle className="mb-4 block">
                Timeline
              </ConfiguratorModuleTitle>
              <RadioGroup
                value={deliver.timeline || ''}
                onValueChange={(value) => onUpdate({ timeline: value as BlueprintDeliver['timeline'] })}
                className="space-y-2"
              >
                {timelineOptions.map((option, index) => (
                  <ConfiguratorOption
                    key={option.id}
                    value={option.id}
                    label={option.label}
                    description={option.description}
                    isSelected={deliver.timeline === option.id}
                    onSelect={(id) => onUpdate({ timeline: id as BlueprintDeliver['timeline'] })}
                    variant="compact"
                    indicator="check"
                    index={index}
                  />
                ))}
              </RadioGroup>
            </div>

            {/* Budget */}
            <div>
              <ConfiguratorModuleTitle className="mb-4 block">
                Budget Range
              </ConfiguratorModuleTitle>
              <RadioGroup
                value={deliver.budget || ''}
                onValueChange={(value) => onUpdate({ budget: value as BlueprintDeliver['budget'] })}
                className="space-y-2"
              >
                {budgetOptions.map((option, index) => (
                  <ConfiguratorOption
                    key={option.id}
                    value={option.id}
                    label={option.label}
                    description={option.description}
                    isSelected={deliver.budget === option.id}
                    onSelect={(id) => onUpdate({ budget: id as BlueprintDeliver['budget'] })}
                    variant="compact"
                    indicator="check"
                    index={index}
                  />
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
