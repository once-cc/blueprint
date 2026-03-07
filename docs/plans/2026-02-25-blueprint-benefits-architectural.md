# Blueprint Benefits — Architectural Schematic

> **Date:** 2026-02-25  
> **Status:** Implemented  
> **Files:** `src/components/marketing/BenefitStackSection.tsx`

---

## Design

### Goal
Transform the "Why Start With a Blueprint?" section into a technical, architectural schematic aligned with `ScrollytellSection` and `FrameworkSection` visual language.

### Architecture
1. **GridSection wrapper** — inherits top/bottom boundary lines and corner Crosshair SVGs, `bg-muted/30`.
2. **Editorial Ramp** — central vertical 1px line acting as a structural "spine" connecting sections.
3. **Schematic Grid** — 2×2 grid with explicit `border border-white/10` and `divide` rules (replaces glassmorphic cards).
4. **Card Internals** — Technical markers (`// 01`), Nohemi titles, annotation-style descriptions, icons in strict bordered boxes.

### Interaction
- **Hover:** Cell borders illuminate (`white/10` → `white/30`), marker glows.
- **Scroll Entrance:** Grid outline opacity fades in, content appears like a HUD loading.
- **Scrolly-tell headline:** Words illuminate on scroll for the intro text.

---

## Implementation

### Rewrite of `BenefitStackSection.tsx`
Complete replacement with:
- `GridSection` wrapper with central spine (`absolute` vertical line).
- `Word` component for scrolly-tell text reveal (same pattern as `ScrollytellSection`).
- 4 benefits in a `grid grid-cols-1 md:grid-cols-2` layout with `border border-white/5` and internal dividers.
- Horizontal + vertical dividers via absolute `div` elements.
- Hover states: background illumination (`bg-white/[0.02]`), icon box border brightening.
- Icons in strict bordered boxes instead of glowing shapes.
- Technical markers (`// 01`) with per-benefit accent colors.
