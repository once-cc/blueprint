# Editorial Grid Design Architecture

## Overview
This document outlines the architectural approach for implementing a cinematic "Executive Editorial"-style background grid system, inspired by the structural aesthetics of Framer's Effica case studies. The goal is to provide a highly structured, premium atmospheric framework that visually anchors content while providing tactile depth.

## Core Visual Objectives
- **The Grid:** A 12-column architectural structure spanning the viewport, marked by ultra-thin (1px), low-opacity lines (e.g., `rgba(245, 245, 245, 0.07)` in dark mode).
- **The Anchors:** High-contrast, minimalist "+" (plus) crosshairs mapping the intersections of horizontal section bounds and the primary vertical columns.
- **The Atmosphere:** A global, low-opacity tactile grain/noise overlay across the entire background (`#090A0C`) to prevent the dark void from feeling flat or sterile.

## Technical Architecture (The "GridProvider" Approach)
The system will be implemented using a hybrid layout approach, combining global vertical structural lines with localized horizontal section framing.

### 1. `GlobalGrid.tsx`
A fixed, viewport-spanning container placed at the lowest `z-index` of the application.
- **Implementation:** Utilizes absolute positioning and `pointer-events: none` to ensure it never interferes with content interaction.
- **Structure:** Renders 1px vertical `div` elements representing the primary columns of a 12-column CSS Grid. On mobile, this will simplify to fewer columns.
- **Texture Overlay:** Integrates the global SVG noise/grain pattern.

### 2. `GridSection.tsx`
A localized wrapper component designed to replace standard `<section>` tags for prominent blocks (e.g., Scrollytell, Benefit Stacks).
- **Function:** Injects crisp 1px top and bottom horizontal borders that span the full container width.
- **Anchoring:** Automatically absolute-positions instances of the `Crosshair` component exactly where the horizontal borders intersect the outermost grid lines of the container.
- **Content Alignment:** Enforces padding (`py-24` to `py-32`) to ensure typography and core content maintain an elegant, print-like distance from the framing lines. 

### 3. `Crosshair.tsx`
A reusable UI primitive.
- **Implementation:** A simple, precise SVG `+` icon (16x16px or 24x24px).
- **Styling:** Styled with a soft, warm white (`hsl(45 10% 92%)`) or muted foreground color to stand out sharply against the lower-opacity grid lines.

## Next Steps
This approved design transitions into the `writing-plans` phase to generate a step-by-step implementation blueprint.
