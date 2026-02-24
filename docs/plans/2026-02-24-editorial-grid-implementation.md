# Editorial Grid Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a 12-column architectural background grid system with horizontal section framing and crosshair anchors.

**Architecture:** A `GlobalGrid` component provides the vertical column structure globally. A `GridSection` component replaces standard sections to provide horizontal framing borders and `Crosshair` intersection markers.

**Tech Stack:** React, Tailwind CSS

---

### Task 1: Create Crosshair UI Primitive

**Files:**
- Create: `src/components/ui/crosshair.tsx`

**Step 1: Write the minimal implementation**
```tsx
import { cn } from "@/lib/utils";

export function Crosshair({ className }: { className?: string }) {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-muted-foreground", className)}
        >
            <path d="M8.5 0V17" stroke="currentColor" strokeWidth="1" />
            <path d="M0 8.5H17" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}
```

**Step 2: Verify visually (Dev server running)**
- No direct usage yet, ensuring build compiles cleanly.

**Step 3: Commit**
```bash
git add src/components/ui/crosshair.tsx
git commit -m "feat(ui): add crosshair UI primitive"
```

### Task 2: Create GlobalGrid Component

**Files:**
- Create: `src/components/ui/global-grid.tsx`
- Modify: `src/App.tsx` 

**Step 1: Write `global-grid.tsx`**
```tsx
export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            <div className="h-full w-full max-w-screen-2xl grid grid-cols-4 md:grid-cols-12 gap-0 border-x border-white/5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-full border-r border-white/5 ${i >= 4 ? 'hidden md:block' : ''} ${i === 11 ? 'border-r-0' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
```

**Step 2: Add to `App.tsx`**
- Import `GlobalGrid` from `@/components/ui/global-grid`
- Insert `<GlobalGrid />` near the top of the main layout (e.g., as the first child of the main `<main className="min-h-screen bg-background text-foreground ...">` wrapper).

**Step 3: Verify visually**
- Check the browser. You should see faint vertical lines spanning the screen. Ensure they do not block interactions.

**Step 4: Commit**
```bash
git add src/components/ui/global-grid.tsx src/App.tsx
git commit -m "feat(ui): add GlobalGrid system"
```

### Task 3: Create GridSection Component

**Files:**
- Create: `src/components/ui/grid-section.tsx`

**Step 1: Write `grid-section.tsx`**
```tsx
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Crosshair } from "./crosshair";

interface GridSectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    showCrosshairs?: boolean;
}

export const GridSection = forwardRef<HTMLElement, GridSectionProps>(
    ({ children, className, showCrosshairs = true, ...props }, ref) => {
        return (
            <section ref={ref} className={cn("relative w-full border-y border-white/5", className)} {...props}>
                {showCrosshairs && (
                    <div className="absolute inset-0 pointer-events-none flex justify-center h-full w-full">
                        <div className="relative w-full max-w-screen-2xl">
                            {/* Top Crosshairs */}
                            <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
                            <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
                            
                            {/* Bottom Crosshairs */}
                            <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40" />
                            <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40" />
                        </div>
                    </div>
                )}
                {children}
            </section>
        );
    }
);
GridSection.displayName = "GridSection";
```

**Step 2: Verify visually**
- Ensure the build succeeds.

**Step 3: Commit**
```bash
git add src/components/ui/grid-section.tsx
git commit -m "feat(ui): add GridSection wrapper"
```

### Task 4: Implement on ScrollytellSection

**Files:**
- Modify: `src/components/marketing/ScrollytellSection.tsx`

**Step 1: Apply GridSection**
- Import `GridSection`
- Replace `<section ref={containerRef} className="relative py-24 md:py-32 bg-muted/30">` with `<GridSection ref={containerRef} className="relative py-24 md:py-32 bg-muted/30">`
- Update closing `</section>` to `</GridSection>`

**Step 2: Run dev server & Verify**
- Verify `ScrollytellSection` has top and bottom borders.
- Verify crosshairs precisely align with the outermost vertical lines of `GlobalGrid`.

**Step 3: Commit**
```bash
git add src/components/marketing/ScrollytellSection.tsx
git commit -m "feat(marketing): apply GridSection to Scrollytell content"
```
