# Editorial Grid Extension: Global Grid & Framework Section

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the global grid structure to look more intentional and frame the scrolling content in the `FrameworkSection` with horizontal architectural lines that scroll independently of the sticky left column.

**Architecture:** 
1. `GlobalGrid`: Modified from a strict 12-column mathematically even grid to a curated 7-line layout on desktop (center line + 3 spaced on each side). The outermost lines have increased opacity to act as strong frames.
2. `FrameworkSection`: The right-column scrolling items are wrapped to simulate `GridSection` behavior horizontally. As the content scrolls up, its containing borders and crosshairs scroll closely with it, while the left column remains anchored by the global vertical grid.

**Tech Stack:** React, Tailwind CSS

---

### Task 1: Refine GlobalGrid Layout

**Files:**
- Modify: `src/components/ui/global-grid.tsx`

**Step 1: Write the updated implementation**
Replace the generated 12-column grid with a curated 7-line symmetric layout.
```tsx
export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            <div className="relative h-full w-full max-w-screen-2xl">
                {/* Outer Strong Frames */}
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10" />

                {/* Center Axis */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/5" />

                {/* Inner Divisions (Desktop Only) */}
                {/* Left side splits (25% and 75% of left half -> 12.5% and 37.5% of total) */}
                <div className="hidden md:block absolute top-0 bottom-0 left-[16.666%] w-px bg-white/5" />
                <div className="hidden md:block absolute top-0 bottom-0 left-[33.333%] w-px bg-white/5" />
                
                {/* Right side splits (25% and 75% of right half -> 62.5% and 87.5% of total) */}
                <div className="hidden md:block absolute top-0 bottom-0 right-[33.333%] w-px bg-white/5" />
                <div className="hidden md:block absolute top-0 bottom-0 right-[16.666%] w-px bg-white/5" />
            </div>
        </div>
    );
}
```

**Step 2: Verify visually (Dev server running)**
- Ensure the center line, outer strong frames, and two intermediary lines per side exist on screens > md.
- Ensure only center and outer frames exist on mobile.

**Step 3: Commit**
```bash
git add src/components/ui/global-grid.tsx
git commit -m "feat(ui): curate GlobalGrid to 7 lines with strong bounds"
```

### Task 2: Refactor FrameworkSection for Horizontal Scrolling Grid

**Files:**
- Modify: `src/components/marketing/FrameworkSection.tsx`

**Step 1: Import Crosshair**
```tsx
import { Crosshair } from "@/components/ui/crosshair";
```

**Step 2: Wrap scrolling content items**
Inside the `.map` loop mapping over `processSteps` inside the RIGHT COLUMN `div`. Apply absolute top and bottom borders, and position crosshairs on the left edge.
```tsx
{/* RIGHT COLUMN: Scrolling Content */}
<div className="relative flex flex-col pt-[10vh] pb-[20vh] space-y-[40vh] md:space-y-[60vh]">
    {processSteps.map((step, index) => (
        <div key={step.id} className="relative min-h-[50vh] flex flex-col justify-center border-y border-white/5 py-16">
            
            {/* Horizontal Grid Anchors (Crosshairs) */}
            {/* Placed specifically on the left edge of the scrolling container to bound it against the center line */}
            <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
            <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40" />
            
            {/* Right boundary crosshairs */}
            <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
            <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40" />
            
            {/* Intersection target */}
            <SectionObserver index={index} setActiveIndex={setActiveIndex} />
            // ... (rest of the existing motion.div content)
        </div>
    ))}
</div>
```

**Step 4: Verify visually**
- Check the browser. The right-hand content should scroll up with top and bottom borders clamping it, while the left side with sticky numbers remains untouched by horizontal lines.

**Step 5: Commit**
```bash
git add src/components/marketing/FrameworkSection.tsx
git commit -m "feat(marketing): inject scrolling horizontal grids into right-hand Framework column"
```
