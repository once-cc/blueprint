# Unified Master Editorial Grid & Framework Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replicate the exact, highly-structured "row-based" editorial layout from the Effica case studies reference. This requires resolving the underlying disconnect between the background `GlobalGrid` and the foreground content containers to ensure vertical lines run full-height and perfectly intersect with content alignment.

**Architecture:**
- **GlobalGrid**: Transition from arbitrary percentages on a fluid container to a strict 12-column CSS grid wrapped in the standard `container mx-auto px-6` bounds. This guarantees the background lines scale down perfectly in sync with the foreground content.
- **FrameworkDesktop**: Scrap the asymmetric sticky-scroll layout. Build a sequential row layout mapped directly to the 12-column grid:
    - Number (`01`): `col-span-2`
    - Phase Title: `col-span-4`
    - Content (SVG + Description + Bullets): `col-span-6`

**Tech Stack:** React, Tailwind CSS

---

### Task 1: Unify GlobalGrid with Content Container

**Files:**
- Modify: `src/components/ui/global-grid.tsx`

**Step 1: Write the updated implementation**
Switch the container to perfectly match the site's content boundaries, and draw border columns to represent the strict 12-column grid.
```tsx
export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            {/* Exactly matches the padding and max-widths of our standard <section> containers */}
            <div className="h-full w-full container mx-auto px-6">
                {/* 12 Column Grid overlay */}
                <div className="h-full w-full grid grid-cols-4 md:grid-cols-12 gap-6 border-x border-[hsl(var(--primary)_/_0.2)] md:border-[hsl(var(--primary)_/_0.15)]">
                    
                    {/* Render the internal column dividers */}
                    {Array.from({ length: 11 }).map((_, i) => (
                        <div 
                            key={i} 
                            // Only show 3 inner borders on mobile (4 cols), all 11 on desktop (12 cols)
                            className={`h-full border-r border-[hsl(var(--primary)_/_0.1)] ${i >= 3 ? 'hidden md:block' : ''}`}
                        />
                    ))}
                    
                    {/* The 12th column doesn't need a right border because the parent container handles it */}
                    <div className="h-full hidden md:block" />
                </div>
            </div>
        </div>
    );
}
```

**Step 2: Verify visually**
- Ensure the background grid lines perfectly hug the left and right padded bounds of the content.

**Step 3: Commit**
```bash
git add src/components/ui/global-grid.tsx
git commit -m "feat(ui): unify GlobalGrid with standard container bounds"
```

### Task 2: Rebuild FrameworkDesktop to Effica Layout

**Files:**
- Modify: `src/components/marketing/FrameworkSection.tsx`

**Step 1: Refactor `FrameworkDesktop` JSX**
Ditch the left/right split and use strictly defined 12-column rows for each phase.
```tsx
function FrameworkDesktop() {
    return (
        <div className="hidden md:flex flex-col w-full pb-32">
            {processSteps.map((step, index) => (
                <div key={step.id} className="relative w-full border-y border-white/10 py-24 -mt-px">
                    
                    {/* Horizontal Grid Anchors (Crosshairs) - Bound to the full row outer edges */}
                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40 z-20" />

                    <div className="grid grid-cols-12 gap-6 items-start">
                        
                        {/* Column 1: Number (Span 2) */}
                        <div className="col-span-2">
                            <span className="font-display type-structural-bold text-5xl text-transparent block mt-1" style={{ WebkitTextStroke: "1px hsl(var(--border) / 0.8)" }}>
                                /{(index + 1).toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* Column 2: Title (Span 4) */}
                        <div className="col-span-4 pr-12">
                            <h3 className="heading-editorial text-4xl lg:text-5xl uppercase tracking-tight">{step.title}</h3>
                        </div>

                        {/* Column 3: Detailed Content (Span 6) */}
                        <div className="col-span-6 flex flex-col pl-6 border-l border-white/5">
                            {/* SVG Asset */}
                            <div className="relative w-full aspect-[21/9] bg-card/20 border border-border/10 rounded-2xl flex items-center justify-center overflow-hidden mb-8 shadow-lg">
                                <step.SvgComponent />
                            </div>

                            {/* Body Copy */}
                            <p className="font-body type-functional-light text-xl text-muted-foreground leading-relaxed mb-8">
                                {step.description}
                            </p>

                            {/* Bullet Points */}
                            <ul className="grid grid-cols-2 gap-4">
                                {step.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex flex-row items-center gap-3">
                                        <span className="font-body type-functional text-sm text-muted-foreground">#{(bullet.replace(/\s+/g, '').toUpperCase())}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
```

**Step 2: Verify visually**
- Check the browser. The layout should look heavily architectural, matching the 3-column split (`/01`, `TITLE`, `Content`) of the Effica design perfectly.
- Ensure the vertical grid lines from `GlobalGrid` run full-height behind the horizontal section dividers, with the `+` crosshairs snapping directly onto those intersections at the edges.

**Step 3: Commit**
```bash
git add src/components/marketing/FrameworkSection.tsx
git commit -m "feat(marketing): perfectly map FrameworkDesktop to Effica 12-col layout"
```
