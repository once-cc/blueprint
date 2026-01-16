import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pipette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColourPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const defaultPresets = [
  '#1a1a2e', '#16213e', '#0f3460', '#e94560', // Dark theme
  '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', // Light grays
  '#2d3436', '#636e72', '#b2bec3', '#dfe6e9', // Neutral
  '#d63031', '#e17055', '#fdcb6e', '#00b894', // Accents
  '#0984e3', '#6c5ce7', '#a29bfe', '#fd79a8', // Vibrant
];

export function ColourPicker({ label, value, onChange, presets = defaultPresets }: ColourPickerProps) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      
      {/* Current Color Display */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl border-2 border-border shadow-inner"
          style={{ backgroundColor: value || '#1a1a2e' }}
        />
        <div className="flex-1">
          <p className="text-sm font-mono text-foreground">{value || '#1a1a2e'}</p>
          <p className="text-xs text-muted-foreground">Current selection</p>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Enter custom color"
        >
          <Pipette className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Input */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <Input
            type="color"
            value={value || '#1a1a2e'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#1a1a2e"
            className="flex-1 font-mono text-sm"
          />
        </motion.div>
      )}

      {/* Preset Grid */}
      <div className="grid grid-cols-5 gap-2">
        {presets.map((color) => (
          <motion.button
            key={color}
            onClick={() => onChange(color)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
              value === color
                ? 'border-accent shadow-lg shadow-accent/20'
                : 'border-transparent hover:border-border'
            }`}
            style={{ backgroundColor: color }}
          >
            {value === color && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-accent" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
