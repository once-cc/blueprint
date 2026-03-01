# Blueprint Configurator Comprehensive Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surgically prune the Blueprint Configurator, deduplicate UI primitives, lazy-load steps via code-splitting, and memoize expensive renders to achieve a premium 60FPS architecture.

**Architecture:** A 4-phase transformation that starts by eliminating unused dead code, moves into creating and deploying a universal solid-acrylic semantic card format (`ConfiguratorCardSurface`), introduces `React.lazy()` for code-splitting routes past Step 3, and finalizes with robust `useMemo`/`useCallback` wrapping on heavy interactive sliders.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Vite rollup chunking.  

---

### Task 1: Dead Code Elimination

**Files:**
- Delete: `src/components/configurator/steps/ColourImageryStep.tsx`
- Modify: `src/components/configurator/BlueprintConfigurator.tsx` (ensure it has no lingering mentions)

**Step 1: Check if anything uses `ColourImageryStep.tsx`**

Run: `npm run lint` or visually inspect router flow.
Expected: The file is completely orphaned as `ColorPaletteStep` was observed at step 6.

**Step 2: Delete the dead file**

Run bash: `rm src/components/configurator/steps/ColourImageryStep.tsx`

**Step 3: Commit**

```bash
git rm src/components/configurator/steps/ColourImageryStep.tsx
git commit -m "chore: remove deprecated ColourImageryStep to reduce bloat"
```

---

### Task 2: Implement Unified Configurator Card Primitive

**Files:**
- Modify/Create Base Form: `src/components/configurator/ui/ConfiguratorCardSurface.tsx`

**Step 1: Identify existing generic card layout**

Since many files currently use `p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm border-border/40 dark:border-border/50`, create a semantic wrapper.

**Step 2: Modify primitive to accept dynamic classes and a simple `hasHover` boolean.**

```tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ConfiguratorCardSurfaceProps extends HTMLMotionProps<"div"> {
  hasHover?: boolean;
}

export const ConfiguratorCardSurface = forwardRef<HTMLDivElement, ConfiguratorCardSurfaceProps>(
  function ConfiguratorCardSurface({ className, hasHover = false, children, ...props }, ref) {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface',
          'border bg-card/80 backdrop-blur-sm border-border/40 dark:border-border/50',
          hasHover && 'hover:border-border hover:bg-card/90 group',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
```

**Step 3: Commit**

```bash
git add src/components/configurator/ui/ConfiguratorCardSurface.tsx
git commit -m "feat: implement universal ConfiguratorCardSurface primitive UI component"
```

---

### Task 3: Lazy-Load Configurator Acts II and III + Review

**Files:**
- Modify: `src/components/configurator/BlueprintConfigurator.tsx`

**Step 1: Replace static imports with React.lazy**

From step 4 onwards, wrap in `React.lazy()` so the initial bundle shrinks dramatically. Keep Act I statically imported so it renders instantly during the entry transition.

```tsx
import { Suspense, lazy } from 'react';

// Keep Act I (Steps 1-3) static for immediate load
import { BusinessFoundationsStep } from './steps/BusinessFoundationsStep';
import { BrandVoiceStep } from './steps/BrandVoiceStep';
import { CTAEnergyStep } from './steps/CTAEnergyStep';

// Lazy Load Act II, III, Review
const VisualStyleStep = lazy(() => import('./steps/VisualStyleStep').then(m => ({ default: m.VisualStyleStep })));
const TypographyMotionStep = lazy(() => import('./steps/TypographyMotionStep').then(m => ({ default: m.TypographyMotionStep })));
const ColorPaletteStep = lazy(() => import('./steps/ColorPaletteStep').then(m => ({ default: m.ColorPaletteStep })));
const FunctionalityStep = lazy(() => import('./steps/FunctionalityStep').then(m => ({ default: m.FunctionalityStep })));
const CreativeRiskStep = lazy(() => import('./steps/CreativeRiskStep').then(m => ({ default: m.CreativeRiskStep })));
const ReferencesStep = lazy(() => import('./steps/ReferencesStep').then(m => ({ default: m.ReferencesStep })));
const ReviewStep = lazy(() => import('./steps/ReviewStep').then(m => ({ default: m.ReviewStep })));
```

**Step 2: Add Suspense boundary to the step router**

Inside `renderStep()`, wrap the `case > 3` returns internally or wrap the entire switch statement inside the `<Suspense>` boundary in `BlueprintConfigurator.tsx`. Let's wrap `renderStep()` in `BlueprintConfigurator`:

```tsx
<div className="max-w-4xl mx-auto">
  <AnimatePresence mode="wait">
     <Suspense fallback={
       <div className="min-h-[400px] flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-accent/50" />
       </div>
     }>
       {renderStep()}
     </Suspense>
  </AnimatePresence>
</div>
```

**Step 3: Verify the Build is Chunked Successfully**

Run: `npm run build`
Expected: Output showing numerous JS chunks being split off from the main entry file (`index-[hash].js`), representing the configurator steps.

**Step 4: Commit**

```bash
git add src/components/configurator/BlueprintConfigurator.tsx
git commit -m "perf: lazy-load configurator routes for Act 2, Act 3, and Review to slash initial JS bundle size"
```

---

### Task 4: Memoize Heavy Interactive Components 

**Files:**
- Modify: `src/components/configurator/ui/VoiceAxisSlider.tsx`

**Step 1: Wrap VoiceAxisSlider entirely in React.memo()**

Since it leverages Framer Motion deeply, every parent re-render (e.g. tooltips) forces the slider's `useSpring` and pointer events to reconcile.

**Step 2: Update VoiceAxisSlider.tsx**

```tsx
import { useState, useRef, useEffect, useCallback, forwardRef, memo } from 'react';
// ... existing imports ...

export const VoiceAxisSlider = memo(forwardRef<HTMLDivElement, VoiceAxisSliderProps>(
  function VoiceAxisSlider({ zones, value, onChange, leftLabel, rightLabel }, ref) {
// ... existing logic ...
  }
));
```

**Step 3: Verify performance behavior**

Run: `npm run dev`
Expected: `VoiceAxisSlider` interactions are 60fps and only re-render when its specific `onChange` parent prop changes its `value`.

**Step 4: Commit**

```bash
git add src/components/configurator/ui/VoiceAxisSlider.tsx
git commit -m "perf: memoize VoiceAxisSlider to prevent heavy framer motion reconciliations on parent context updates"
```
