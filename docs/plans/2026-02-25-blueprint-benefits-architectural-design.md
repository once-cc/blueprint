# Blueprint Benefits Architectural Redesign

## Goal
Transform the "Why Start With a Blueprint?" section into a highly technical, architectural schematic that aligns perfectly with the visual language of the `ScrollytellSection` and the `FrameworkSection` step cards.

## Architecture & Layout
1. **The Canvas (`GridSection`):** 
   The entire section will be wrapped in the `GridSection` component to inherit the top/bottom boundary lines and the corner `Crosshair` SVG elements. The background will be a subtle `bg-muted/30`.
2. **The Editorial Ramp:**
   A central, vertical 1px line (`border-l border-white/5`) will extend down the middle of the section, acting as a structural "spine" or "ramp" that visual connects the Scrolly-tell section to the Framework section below it.
3. **The Schematic Grid (Bento Replacement):**
   Instead of floating glassmorphic cards, the 4 benefits will be housed in an explicitly drawn 2x2 grid. 
   - The grid will use `border border-white/10` for its outer bounds, and `divide-y divide-white/10` / `md:divide-x` for its internal boundaries.
   - This creates a literal table or "blueprint diagram" look.
4. **Card Internals:**
   - **Step Markers:** Instead of floating numbers, we will use technical markers like `// 01` in the `font-nohemi` uppercase style, colored with the specific benefit's accent color.
   - **Typography:** The titles will remain bold Nohemi, but the descriptions will feel more like technical annotations.
   - **Icons:** The icons will be housed in strict, 1px bordered boxes (`border border-white/10`) rather than glowing abstract shapes.

## Interaction & Animation
- **Hover:** When hovering over a specific cell in the schematic, the borders of that cell will slightly illuminate (e.g., transitioning from `white/10` to `white/30`), and the `// 01` marker will glow. Minimal, precise, and technical.
- **Scroll Entrance:** The grid outline will draw itself in (opacity fade), followed by the internal content appearing like a schematic loading on a HUD. 
- The Scrolly-tell headline behavior remains unchanged as it sets the perfect tone.

## Tech Stack
- React, Tailwind CSS
- `framer-motion` for the Scrolly-tell text and grid schematic fade-ins.
- Lucide Icons
- Custom `GridSection` and `Crosshair` components.
