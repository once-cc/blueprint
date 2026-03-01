# Configurator Oversized Headlines Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the oversized step headline style from the Blueprint marketing page (`FrameworkSection`) to the component titles inside the configurator, starting with the `ColorPaletteStep` as a test.

**Architecture:** Create a new reusable `ConfiguratorSectionHeader` primitive in `src/components/configurator/ui/` that encapsulates the typography and gradient styling. This ensures consistency and makes it easy to roll out to the rest of the configurator if approved. The header will use a semantic gradient (`from-background` to `to-foreground/80`) to ensure it pops cleanly against the dark configurator surface while remaining highly readable.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Create `ConfiguratorSectionHeader` Primitive

**Files:**
- Create: `src/components/configurator/ui/ConfiguratorSectionHeader.tsx`

**Step 1: Write the minimal implementation**

```tsx
import { motion } from "framer-motion";

interface ConfiguratorSectionHeaderProps {
  title: string;
}

export function ConfiguratorSectionHeader({ title }: ConfiguratorSectionHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-center pointer-events-none mb-6 mt-12 overflow-hidden"
    >
      <span
        className="font-nohemi font-bold pb-2 select-none whitespace-nowrap uppercase relative inline-block text-transparent bg-clip-text bg-gradient-to-t from-background from-[10%] via-muted-foreground/50 to-foreground/80"
        style={{
          fontSize: "clamp(2.5rem, 8vw, 120px)",
          lineHeight: 0.85
        }}
      >
        {title}
      </span>
    </motion.div>
  );
}
```

### Task 2: Apply to `ColorPaletteStep`

**Files:**
- Modify: `src/components/configurator/steps/ColorPaletteStep.tsx`

**Step 1: Replace existing labels with `ConfiguratorSectionHeader`**
1. Import `ConfiguratorSectionHeader`.
2. Replace `<Label>Colour Relationship *</Label>` with `<ConfiguratorSectionHeader title="Relationship" />`.
3. Replace `<Label>Rotate Base Hue</Label>` with `<ConfiguratorSectionHeader title="Base Hue" />`.
4. Replace `<Label>Generated Palette</Label>` with `<ConfiguratorSectionHeader title="Palette" />`.
5. For the `VoiceAxisSlider` components, add a `<ConfiguratorSectionHeader title="Refinements" />` above them, keeping their individual tiny `<Label>` elements intact so the user knows exactly what each slider does.
