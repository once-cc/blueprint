import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FoundationLayer, LAYER_ORDER, LAYER_LABELS } from '../data/foundationsData';

interface LayerProgressProps {
  currentLayer: FoundationLayer;
  onLayerClick: (layer: FoundationLayer) => void;
  completedLayers: FoundationLayer[];
}

export function LayerProgress({ currentLayer, onLayerClick, completedLayers }: LayerProgressProps) {
  const currentIndex = LAYER_ORDER.indexOf(currentLayer);

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {LAYER_ORDER.map((layer, index) => {
        const isActive = layer === currentLayer;
        const isCompleted = completedLayers.includes(layer);
        const isClickable = index !== currentIndex && (index < currentIndex || isCompleted);

        return (
          <div key={layer} className="flex items-center gap-3">
            <button
              onClick={() => isClickable && onLayerClick(layer)}
              disabled={!isClickable}
              className={cn(
                'group flex items-center gap-2 transition-all duration-200',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-default'
              )}
              title={isClickable ? `Go to ${LAYER_LABELS[layer]}` : LAYER_LABELS[layer]}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isActive
                    ? 'hsl(var(--accent))'
                    : isCompleted
                      ? 'hsl(var(--accent) / 0.5)'
                      : 'hsl(var(--muted-foreground) / 0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isClickable && 'group-hover:ring-2 group-hover:ring-accent/30 group-hover:ring-offset-2 group-hover:ring-offset-background'
                )}
              />

              {/* Show label for active layer only */}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-xs font-medium text-muted-foreground hidden sm:block"
                >
                  {LAYER_LABELS[layer]}
                </motion.span>
              )}
            </button>

            {/* Connector line */}
            {index < LAYER_ORDER.length - 1 && (
              <div
                className={cn(
                  'w-6 h-px transition-colors duration-200',
                  index < currentIndex
                    ? 'bg-accent/50'
                    : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
