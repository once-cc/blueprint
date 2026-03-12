import { useState, useMemo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { PenLine, ArrowLeft } from 'lucide-react';
import { SITE_TOPIC_OPTIONS } from '../data/foundationsData';
import { AnimationDirection, getLayerVariants } from '../utils/layerAnimations';
import { MotionConfiguratorQuestion, MotionConfiguratorBody } from '@/components/ui/Typography';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React from 'react';

interface SiteTopicLayerProps {
  selected?: string;
  onSelect: (value: string) => void;
  direction: AnimationDirection;
}

export const SiteTopicLayer = forwardRef<HTMLDivElement, SiteTopicLayerProps>(
  function SiteTopicLayer({
    selected,
    onSelect,
    direction,
  }: SiteTopicLayerProps, ref) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('');

    const variants = getLayerVariants(direction);

    // Map site topic options to DropdownItem format
    const dropdownItems: DropdownItem[] = useMemo(() => {
      const items: DropdownItem[] = SITE_TOPIC_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        icon: option.icon,
      }));

      // Add "Other (enter custom)" option
      items.push({
        value: '__custom__',
        label: 'Other (enter custom)',
        icon: React.createElement(PenLine, { className: 'w-4 h-4' }),
      });

      return items;
    }, []);

    // Check if the selected value is a custom one (not in predefined list)
    const isCustomSelected = selected && !SITE_TOPIC_OPTIONS.find(o => o.value === selected);

    const handleDropdownChange = (value: string | string[]) => {
      const val = Array.isArray(value) ? value[0] : value;
      if (val === '__custom__') {
        setShowCustomInput(true);
      } else {
        setShowCustomInput(false);
        onSelect(val);
      }
    };

    const handleCustomSubmit = () => {
      if (customValue.trim()) {
        onSelect(customValue.trim());
        setShowCustomInput(false);
        setCustomValue('');
      }
    };

    // Determine dropdown value
    const dropdownValue = isCustomSelected ? null : (selected || null);

    return (
      <motion.div
        ref={ref}
        key="topic"
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="absolute inset-0 flex flex-col"
      >
        <div className="max-w-2xl mx-auto w-full space-y-8">
          {/* Question */}
          <div className="space-y-3 text-center px-6 md:px-0">
            <MotionConfiguratorQuestion>
              What is your platform primarily about?
            </MotionConfiguratorQuestion>
            <MotionConfiguratorBody className="max-w-md mx-auto">
              This helps us understand your industry context and tailor the blueprint that follows.
            </MotionConfiguratorBody>
          </div>

          {/* Dropdown */}
          <div className="max-w-md mx-auto w-full px-6 md:px-0">
            <ConfiguratorDropdown
              label="Industry / Topic"
              required
              value={dropdownValue}
              onChange={handleDropdownChange}
              items={dropdownItems}
              placeholder="Select or enter your topic..."
              hideUnselectedHelperText
            />

            {/* Custom input (shown when "Other" is selected) */}
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <Input
                  placeholder="Enter your topic..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomSubmit();
                    }
                  }}
                  className="h-12"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomValue('');
                    }}
                    className="flex-1 relative overflow-hidden group gap-2 bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 transition-colors duration-300"
                  >
                    <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    <ArrowLeft className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Cancel</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCustomSubmit}
                    disabled={!customValue.trim()}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Selection confirmation (subtle) */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground">
                Selected: <span className="text-foreground font-medium">
                  {SITE_TOPIC_OPTIONS.find(o => o.value === selected)?.label || selected}
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  });
