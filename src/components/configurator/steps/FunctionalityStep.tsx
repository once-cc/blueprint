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
import { springConfig, cardHover, cardTap, getContentShift, getIconAnimation } from '../ui/animationConfig';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';

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
  { id: '5_10k', label: '$5K - $10K', description: 'Full website' },
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
    items: ['Visual system', 'Website architecture', 'Performance & structure']
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
        framing="What does your website need to do?"
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-10">
          {/* Pages Grid */}
          <div>
            <Label className={cn(
              "text-sm font-medium mb-4 block flex items-center gap-2",
              selectedPages.length > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Pages Required <span className="text-destructive">*</span>
              {selectedPages.length > 0 && <CheckCircle2 className="w-4 h-4 text-accent" />}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {PAGE_OPTIONS.map((page, index) => {
                const Icon = pageIcons[page] || Home;
                const isSelected = selectedPages.includes(page);
                return (
                  <motion.button
                    key={page}
                    type="button"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...springConfig, delay: index * 0.03 }}
                    whileHover={{ ...cardHover, transition: springConfig }}
                    whileTap={{ ...cardTap, transition: springConfig }}
                    onClick={() => togglePage(page)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm group',
                      isSelected
                        ? 'border-accent/50 cfg-surface-selected text-accent shadow-[0_0_20px_hsl(var(--accent)/0.15)]'
                        : 'border-border/40 dark:border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card/90'
                    )}
                  >
                    <motion.div
                      animate={getIconAnimation(isSelected)}
                      transition={springConfig}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <motion.span
                      animate={getContentShift(isSelected)}
                      transition={springConfig}
                      className="text-xs font-medium"
                    >
                      {page}
                    </motion.span>
                  </motion.button>
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
              <Label className="text-sm font-medium text-foreground">
                Delivery Focus Areas
              </Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                These domains guide how we structure execution.
                Specific inclusions are confirmed after strategy alignment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {systemDomains.map((domain, index) => {
                const Icon = domain.icon;
                const isAcknowledged = acknowledgedDomains.has(domain.id);

                return (
                  <motion.button
                    key={domain.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDomainClick(domain.id)}
                    className={cn(
                      'p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm text-left group',
                      isAcknowledged
                        ? 'border-accent/50 cfg-surface-selected shadow-[0_0_12px_hsl(var(--accent)/0.08)]'
                        : 'border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90'
                    )}
                  >
                    {/* Header with Icon */}
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div
                        animate={{
                          scale: isAcknowledged ? 1.1 : 1,
                          rotate: isAcknowledged ? 5 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isAcknowledged
                            ? 'bg-accent/10 text-accent'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      <h4 className={cn(
                        "text-sm font-medium transition-colors flex-1",
                        isAcknowledged ? 'text-accent' : 'text-foreground'
                      )}>
                        {domain.title}
                      </h4>
                    </div>

                    {/* Domain Items */}
                    <ul className="space-y-1.5 ml-1">
                      {domain.items.map((item, itemIndex) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index + 0.05 * itemIndex }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
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
                  </motion.button>
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
              <Label className="text-sm font-medium text-foreground mb-4 block">
                Timeline
              </Label>
              <RadioGroup
                value={deliver.timeline || ''}
                onValueChange={(value) => onUpdate({ timeline: value as BlueprintDeliver['timeline'] })}
                className="space-y-2"
              >
                {timelineOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm cursor-pointer group',
                      deliver.timeline === option.id
                        ? 'border-accent/50 cfg-surface-selected'
                        : 'border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90'
                    )}
                    onClick={() => onUpdate({ timeline: option.id as BlueprintDeliver['timeline'] })}
                  >
                    <RadioGroupItem value={option.id} id={`timeline-${option.id}`} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({option.description})</span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Budget */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-4 block">
                Budget Range
              </Label>
              <RadioGroup
                value={deliver.budget || ''}
                onValueChange={(value) => onUpdate({ budget: value as BlueprintDeliver['budget'] })}
                className="space-y-2"
              >
                {budgetOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm cursor-pointer group',
                      deliver.budget === option.id
                        ? 'border-accent/50 cfg-surface-selected'
                        : 'border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90'
                    )}
                    onClick={() => onUpdate({ budget: option.id as BlueprintDeliver['budget'] })}
                  >
                    <RadioGroupItem value={option.id} id={`budget-${option.id}`} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">({option.description})</span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
