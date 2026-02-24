# Custom Animated SVGs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create four premium, architecturally-inspired animated SVG components (Hero, Discovery, Design, Deliver) to replace the placeholders on the Blueprint landing page.

**Architecture:** Each SVG will be a standalone React component leveraging `framer-motion` for complex timeline animations (drawing paths, rotating rings, pulsating glows). They will strictly use the project's color tokens (`#d4a853` / `rgb(212,168,83)` for gold accents, muted background layers) mapped to Tailwind variables where applicable, or inline styles/hex codes matching the `GoldSeal` established in `SuccessState.tsx`. The components will be stored in `src/components/marketing/graphics/` and imported into `src/pages/Blueprint.tsx`.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Inline SVGs

---

### Task 1: Create Hero Blueprint SVG

**Files:**
- Create: `src/components/marketing/graphics/HeroBlueprintSvg.tsx`
- Modify: `src/pages/Blueprint.tsx:120-135`

**Step 1: Write Hero SVG Component**
Create a component that renders a slow-rotating, complex concentric ring structure with a subtle blueprint grid background, using `framer-motion` to animate path drawing (`pathLength`) and rotation on mount.

```tsx
import { motion } from 'framer-motion';

export function HeroBlueprintSvg() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      {/* Glow */}
      <motion.div
        className="absolute w-[80%] h-[80%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.15) 0%, rgba(212,168,83,0) 70%)' }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg viewBox="0 0 400 400" className="relative w-full max-w-[400px] h-auto p-8" fill="none">
        {/* Outer rotating dashed ring */}
        <motion.circle
          cx="200" cy="200" r="180"
          stroke="#d4a853" strokeWidth="1" strokeDasharray="4 8" opacity="0.4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />
        {/* Middle geometric paths */}
        <motion.rect
          x="60" y="60" width="280" height="280"
          stroke="#d4a853" strokeWidth="0.5" opacity="0.3" fill="none"
          initial={{ pathLength: 0, rotate: 45 }}
          animate={{ pathLength: 1, rotate: 405 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />
        {/* Inner solid ring drawing in */}
        <motion.circle
          cx="200" cy="200" r="100"
          stroke="#d4a853" strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        {/* Center reticle */}
        <motion.path
          d="M200 80 L200 120 M200 280 L200 320 M80 200 L120 200 M280 200 L320 200"
          stroke="#d4a853" strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ originX: '50%', originY: '50%' }}
        />
      </svg>
    </div>
  );
}
```

**Step 2: Inject into Blueprint.tsx**
Replace the Hero SVG placeholder in `Blueprint.tsx` with `<HeroBlueprintSvg />`.

**Step 3: Commit**
```bash
git add src/components/marketing/graphics/HeroBlueprintSvg.tsx src/pages/Blueprint.tsx
git commit -m "feat(graphics): implement animated Hero SVG component"
```

---

### Task 2: Create Discovery SVG

**Files:**
- Create: `src/components/marketing/graphics/DiscoverySvg.tsx`
- Modify: `src/pages/Blueprint.tsx:230-240`

**Step 1: Write Discovery SVG Component**
Concept: A scanning reticle or abstracted eye indicating analysis.

```tsx
import { motion } from 'framer-motion';

export function DiscoverySvg() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">
        {/* Eye/Lens Shape */}
        <motion.path
          d="M20 100 Q 100 20 180 100 Q 100 180 20 100 Z"
          stroke="#d4a853" strokeWidth="1.5" opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Iris / Inner Ring */}
        <motion.circle
          cx="100" cy="100" r="30"
          stroke="#d4a853" strokeWidth="2"
          initial={{ r: 0, opacity: 0 }}
          animate={{ r: 30, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
        />
        {/* Scanning Line */}
        <motion.line
          x1="20" y1="20" x2="180" y2="20"
          stroke="#d4a853" strokeWidth="1"
          opacity="0.8"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 160, 0], opacity: [0, 0.8, 0] }}
          transition={{ delay: 1.5, duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
```

**Step 2: Inject into Blueprint.tsx**
Conditionally render this SVG in the `processSteps` map when `step.id === 'discovery'`.

**Step 3: Commit**
```bash
git add src/components/marketing/graphics/DiscoverySvg.tsx src/pages/Blueprint.tsx
git commit -m "feat(graphics): implement animated Discovery SVG"
```

---

### Task 3: Create Design SVG

**Files:**
- Create: `src/components/marketing/graphics/DesignSvg.tsx`
- Modify: `src/pages/Blueprint.tsx:230-240`

**Step 1: Write Design SVG Component**
Concept: Interlocking geometric shapes or a drafting compass motif, drawn in with delayed paths.

```tsx
import { motion } from 'framer-motion';

export function DesignSvg() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">
        {/* Geometric intersections */}
        <motion.circle
          cx="80" cy="100" r="50"
          stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.circle
          cx="120" cy="100" r="50"
          stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
        />
        {/* Connecting architectural lines */}
        <motion.path
          d="M80 50 L120 150 M80 150 L120 50"
          stroke="#d4a853" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ delay: 1.5, duration: 1 }}
        />
        {/* Center node */}
        <motion.circle
          cx="100" cy="100" r="4" fill="#d4a853"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: 'spring' }}
        />
      </svg>
    </div>
  );
}
```

**Step 2: Inject into Blueprint.tsx**
Conditionally render this SVG in the `processSteps` map when `step.id === 'design'`.

**Step 3: Commit**
```bash
git add src/components/marketing/graphics/DesignSvg.tsx src/pages/Blueprint.tsx
git commit -m "feat(graphics): implement animated Design SVG"
```

---

### Task 4: Create Deliver SVG

**Files:**
- Create: `src/components/marketing/graphics/DeliverSvg.tsx`
- Modify: `src/pages/Blueprint.tsx:230-240`

**Step 1: Write Deliver SVG Component**
Concept: A solid, completed architectural form (like an isometric cube) with a subtle upward drift or light-ray effect.

```tsx
import { motion } from 'framer-motion';

export function DeliverSvg() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Upward light rays */}
      <motion.div
        className="absolute bottom-[20%] w-20 h-32 bg-gradient-to-t from-[#d4a853]/20 to-transparent blur-md"
        animate={{ opacity: [0.3, 0.7, 0.3], height: [100, 140, 100] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">
        {/* Isometric Cube Base */}
        <motion.path
          d="M100 140 L40 105 L100 70 L160 105 Z"
          stroke="#d4a853" strokeWidth="1.5" fill="rgba(212,168,83,0.05)"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Left Face */}
        <motion.path
          d="M40 105 L100 140 L100 210 L40 175 Z"
          stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        {/* Right Face */}
        <motion.path
          d="M100 140 L160 105 L160 175 L100 210 Z"
          stroke="#d4a853" strokeWidth="1.5" opacity="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />
        
        {/* Rising top element to show "Delivery" */}
        <motion.path
          d="M100 80 L60 55 L100 30 L140 55 Z"
          stroke="#d4a853" strokeWidth="2" fill="rgba(212,168,83,0.15)"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2, type: 'spring', bounce: 0.3 }}
        />
      </svg>
    </div>
  );
}
```

**Step 2: Inject into Blueprint.tsx**
Conditionally render this SVG in the `processSteps` map when `step.id === 'deliver'`.
Also, make sure the `processSteps` map correctly checks the step IDs and imports the graphics components. Note: the Deliver SVG path starts a bit lower so adjust the isometric math slightly or let standard scaling handle it.

**Step 3: Commit**
```bash
git add src/components/marketing/graphics/DeliverSvg.tsx src/pages/Blueprint.tsx
git commit -m "feat(graphics): implement animated Deliver SVG and inject graphics into page"
```
