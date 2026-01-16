import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  value: string;
  label: string;
  subtitle?: string;
  fontFamily?: string;
  fontWeight?: number;
  renderPreview?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface ConfiguratorDropdownProps {
  label: string;
  required?: boolean;
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
  items: DropdownItem[];
  placeholder?: string;
  maxHeight?: number;
  className?: string;
  multiSelect?: boolean;
  renderItemContent?: (item: DropdownItem, isSelected: boolean) => React.ReactNode;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

export function ConfiguratorDropdown({
  label,
  required = false,
  value,
  onChange,
  items,
  placeholder = "Select an option...",
  maxHeight = 320,
  className,
  multiSelect = false,
  renderItemContent,
}: ConfiguratorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Normalize value to array for multi-select
  const selectedValues = multiSelect 
    ? (Array.isArray(value) ? value : []) 
    : [];
  
  const selectedItem = !multiSelect 
    ? items.find(item => item.value === value) 
    : null;
  
  const selectedCount = multiSelect ? selectedValues.length : 0;
  const hasSelection = multiSelect ? selectedCount > 0 : !!selectedItem;

  const handleSelect = (itemValue: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(itemValue)
        ? selectedValues.filter(v => v !== itemValue)
        : [...selectedValues, itemValue];
      onChange(newValues);
      // Keep dropdown open for multi-select
    } else {
      onChange(itemValue);
      setIsOpen(false);
    }
  };

  // Get display text for trigger
  const getTriggerText = () => {
    if (multiSelect) {
      if (selectedCount === 0) return placeholder;
      if (selectedCount === 1) {
        const item = items.find(i => i.value === selectedValues[0]);
        return item?.label || placeholder;
      }
      return `${selectedCount} selected`;
    }
    return selectedItem?.label ?? placeholder;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {required && (
          <span className="text-xs text-muted-foreground">(required)</span>
        )}
        {hasSelection && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springConfig}
          >
            <Check className="w-4 h-4 text-accent" />
          </motion.div>
        )}
      </div>

      {/* Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button
            type="button"
            whileHover={{ scale: 1.005, y: -1 }}
            whileTap={{ scale: 0.995 }}
            transition={springConfig}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-xl text-left',
              'transition-all duration-[220ms] ease-out cfg-surface',
              'border bg-card/80 backdrop-blur-sm',
              hasSelection
                ? 'border-accent/50 cfg-surface-selected'
                : 'border-border/40 dark:border-border/50 hover:border-border'
            )}
          >
            <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {hasSelection ? (multiSelect ? `${selectedCount} selected` : 'Selected') : placeholder}
              </span>
              <span
                className="text-lg text-foreground truncate w-full"
                style={{
                  fontFamily: selectedItem?.fontFamily,
                  fontWeight: selectedItem?.fontWeight,
                }}
              >
                {getTriggerText()}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={springConfig}
              className="ml-3 flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 border-border/50 bg-card/95 backdrop-blur-md cfg-surface-elevated rounded-xl"
          align="start"
          sideOffset={8}
        >
          {/* Native scrollable container - fixes trackpad/mouse wheel scrolling */}
          {/* data-lenis-prevent tells Lenis to NOT intercept wheel events here */}
          <div
            data-lenis-prevent
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight, WebkitOverflowScrolling: 'touch' }}
          >
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {items.map((item, index) => {
                  const isSelected = multiSelect 
                    ? selectedValues.includes(item.value) 
                    : item.value === value;

                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      onClick={() => handleSelect(item.value)}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left transition-all duration-150',
                        isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-transparent hover:bg-muted/40 hover:border-border/30'
                      )}
                    >
                      {renderItemContent ? (
                        renderItemContent(item, isSelected)
                      ) : (
                        <DefaultItemContent 
                          item={item} 
                          isSelected={isSelected} 
                          multiSelect={multiSelect}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DefaultItemContentProps {
  item: DropdownItem;
  isSelected: boolean;
  multiSelect?: boolean;
}

function DefaultItemContent({ item, isSelected, multiSelect }: DefaultItemContentProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Checkbox indicator for multi-select */}
      {multiSelect && (
        <div className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
          isSelected ? 'border-accent bg-accent' : 'border-border'
        )}>
          {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
        </div>
      )}
      
      {/* Icon if provided */}
      {item.icon && !multiSelect && (
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
          isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
        )}>
          {item.icon}
        </div>
      )}

      {/* Icon for multi-select (inline) */}
      {item.icon && multiSelect && (
        <div className={cn(
          'flex-shrink-0 transition-colors',
          isSelected ? 'text-accent' : 'text-muted-foreground'
        )}>
          {item.icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium text-foreground"
            style={{
              fontFamily: item.fontFamily,
              fontWeight: item.fontWeight,
            }}
          >
            {item.label}
          </span>
          {!multiSelect && isSelected && (
            <Check className="w-4 h-4 text-accent flex-shrink-0" />
          )}
        </div>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.subtitle}</p>
        )}
        {item.renderPreview && (
          <div className="mt-2">{item.renderPreview}</div>
        )}
      </div>
    </div>
  );
}
