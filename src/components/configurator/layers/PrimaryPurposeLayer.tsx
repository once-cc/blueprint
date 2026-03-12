import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { PrimaryPurpose } from '@/types/blueprint';
import { PURPOSE_OPTIONS } from '../data/foundationsData';
import { ConfiguratorOption } from '../ui/ConfiguratorOption';
import { AnimationDirection, getLayerVariants, layerTransition } from '../utils/layerAnimations';
import { MotionConfiguratorQuestion, MotionConfiguratorBody, MotionConfiguratorHelper } from '@/components/ui/Typography';

interface PrimaryPurposeLayerProps {
  selected: PrimaryPurpose | undefined;
  onSelect: (purpose: PrimaryPurpose) => void;
  direction?: AnimationDirection;
}

export const PrimaryPurposeLayer = forwardRef<HTMLDivElement, PrimaryPurposeLayerProps>(
  function PrimaryPurposeLayer({ selected, onSelect, direction = 'forward' }, ref) {
    const variants = getLayerVariants(direction);

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={layerTransition}
        className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        <div className="w-full max-w-3xl space-y-6">
          {/* Question */}
          <div className="text-center space-y-2">
            <MotionConfiguratorQuestion
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              What is the primary purpose of your digital platform?
            </MotionConfiguratorQuestion>
            <MotionConfiguratorBody
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              This defines the core reason your site exists.
            </MotionConfiguratorBody>
          </div>

          {/* Purpose Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PURPOSE_OPTIONS.map((purpose, index) => {
              const Icon = purpose.icon;
              return (
              <motion.div
                key={purpose.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <ConfiguratorOption
                  value={purpose.value}
                  label={purpose.label}
                  description={purpose.description}
                  icon={<Icon className="w-6 h-6" />}
                  isSelected={selected === purpose.value}
                  onSelect={() => onSelect(purpose.value)}
                  variant="default"
                  indicator="border"
                />
              </motion.div>
              );
            })}
          </div>

          {/* Hint */}
          <MotionConfiguratorHelper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            Select to continue
          </MotionConfiguratorHelper>
        </div>
      </motion.div>
    );
  });
