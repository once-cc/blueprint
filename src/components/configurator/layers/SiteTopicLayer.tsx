import { useState, useMemo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SITE_TOPIC_OPTIONS } from '../data/foundationsData';
import { AnimationDirection, getLayerVariants } from '../utils/layerAnimations';
import { MotionConfiguratorQuestion, MotionConfiguratorBody } from '@/components/ui/Typography';

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
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const variants = getLayerVariants(direction);

    // Filter options based on search
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return SITE_TOPIC_OPTIONS;
      const query = searchQuery.toLowerCase();
      return SITE_TOPIC_OPTIONS.filter(
        (option) => option.label.toLowerCase().includes(query)
      );
    }, [searchQuery]);

    // Get display label for selected value
    const getDisplayLabel = () => {
      if (!selected) return 'Select or enter your topic...';
      const found = SITE_TOPIC_OPTIONS.find((o) => o.value === selected);
      return found ? found.label : selected;
    };

    const handleSelectOption = (value: string) => {
      onSelect(value);
      setOpen(false);
      setSearchQuery('');
      setShowCustomInput(false);
    };

    const handleCustomSubmit = () => {
      if (customValue.trim()) {
        onSelect(customValue.trim());
        setOpen(false);
        setShowCustomInput(false);
        setCustomValue('');
      }
    };

    const handleShowCustom = () => {
      setShowCustomInput(true);
    };

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

          {/* Searchable Combobox */}
          <div className="flex justify-center">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full max-w-md justify-between h-12 text-left font-normal',
                    'border-border/50 hover:border-accent/50 transition-colors',
                    !selected && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate">{getDisplayLabel()}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] max-w-md p-0"
                align="start"
              >
                <div className="flex flex-col">
                  {/* Search input */}
                  <div className="flex items-center border-b border-border/50 px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                    />
                  </div>

                  {/* Options list */}
                  <div className="max-h-[240px] overflow-y-auto p-1">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelectOption(option.value)}
                          className={cn(
                            'relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-colors',
                            'hover:bg-accent/10 hover:text-accent',
                            selected === option.value && 'bg-accent/10 text-accent'
                          )}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4 shrink-0',
                              selected === option.value ? 'opacity-100 text-accent' : 'opacity-0'
                            )}
                          />
                          <span>{option.label}</span>
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No matching topics found
                      </div>
                    )}

                    {/* Divider */}
                    <div className="my-1 h-px bg-border/50" />

                    {/* Custom input option */}
                    {showCustomInput ? (
                      <div className="p-2 space-y-2">
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
                          className="h-10"
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
                            className="flex-1"
                          >
                            Cancel
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
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleShowCustom}
                        className={cn(
                          'relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-colors',
                          'text-muted-foreground hover:bg-accent/10 hover:text-accent'
                        )}
                      >
                        <span className="mr-2 text-xs">✎</span>
                        <span>Other (enter custom)</span>
                      </button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selection confirmation (subtle) */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground">
                Selected: <span className="text-foreground font-medium">{getDisplayLabel()}</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  });
