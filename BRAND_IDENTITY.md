# Cleland Studio: Brand Identity & Creative Direction

## 1. Core Aesthetic & Creative Direction
*   **Vibe:** Cinematic, Executive Editorial, Immersive, Premium, Minimalist.
*   **Mood:** Sophisticated, deep, structured yet atmospheric. The design bridges the gap between the rigid precision of structural architecture (wireframes, grids, data) and the narrative elegance of high-end editorial magazines. It is a "digital studio space."
*   **Tone:** Confident, understated, and highly professional. It implies authority without shouting.

## 2. Colorways & Theming (Cinematic Dark Mode Default)
The palette leans heavily into "Deep Cinematic Darks" contrasted with warm, luxurious accents and crisp ivory typography. It is an immersive environment, eschewing pure black or pure white in favor of softer, richer tones that reduce eye strain and feel premium.

### Primary Tokens
*   **Void (Background):** Deep Navy/Charcoal (`hsl(220 15% 4%)` / `#090A0C`). Provides a vast, cinematic canvas.
*   **Surfaces (Cards/Popovers):** Mid-to-dark cinematic grays (`hsl(220 12% 7%)` to `8%`). Creates elevation and depth without breaking the dark mode immersion.
*   **Foreground (Text):** Warm Ivory / Cream (`#edece9ff`). Softens the contrast, making reading pleasant, elegant, and editorial.
*   **Primary Accent:** Warm Amber / Gold (`#f5a524ff`). Serves as the primary luxury accent for interactions, glowing CTA rings, and focus states. It acts as the "light in the dark."
*   **Atmosphere / Environment:** Deep space grays (`hsl(220 12% 8%)`) for underlying contextual layers and ghosted typography.

### Light Mode Strategy
*   *Light mode acts as a "daytime studio" variation.*
*   **Background:** Clean, warm ivory (`hsl(45 20% 96%)`).
*   **Foreground / Text:** Deep charcoal (`hsl(220 15% 15%)`).
*   **Accent:** Retains the Warm Amber / Gold (`#f5a524ff`) for brand continuity across themes.

## 3. Typography System
A strict, three-tier typographic hierarchy defines the functional and emotional flow of information across the site.

### 1. Structural / Orientation (Syne)
*   **Role:** Used for large stage numbers, section headings, and spatial orientation.
*   **Vibe:** Architectural rigidity, weight, and modern precision.
*   **Application:** Uppercase, slight tracking (letter-spacing), bold weights (`tracking-wide`, `tracking-tight` for massive headings).

### 2. Editorial / Narrative (Domaine Display Narrow & Cormorant Garamond)
*   **Role:** Used for large hero text, storytelling, and elegant emphasis.
*   **Vibe:** Luxurious, print-like quality that softens structural rigidity. It brings the "human" and "creative" touch to the technological space.
*   **Application:** Standard casing, tight line-heights (`line-height: 0.9` for hero text), carefully kerned.

### 3. Functional / System (Raela Pro & Nohemi)
*   **Role:** Highly legible, engineered sans-serifs for UI elements, buttons, labels, and standard body copy.
*   **Vibe:** Utilitarian, clear, and system-driven.
*   **Application:** Regular weights for body text, uppercase with wide tracking for tags and micro-labels.

## 4. Stylization, Texture, & Motion
The Blueprint Configurator avoids flat design, opting instead for a layered, spatial approach reminiscent of high-end cinematic composition.

*   **Atmospheric Depth:** Heavy reliance on dark gradients (`gradient-vignette`, `gradient-fade-up`) to feather edges and blend sections seamlessly.
*   **Tactility & Artifacts:** Subtle textures and "glitch-adjacent" artifacts like `crt-sweep` and a 4-second `scanline-flicker` provide a digital, film-like quality to the space.
*   **Volumetric Lighting:** Abstract "light rays" (`light-ray-corner`, `light-ray-edge`) slowly rotate and shift behind content to give the illusion of an illuminated, physical environment.
*   **Motion & Easing:** All motion aligns with a 'Cinematic' easing curve (`cubic-bezier(0.22, 1, 0.36, 1)`). Transitions are smooth, deliberate, and never erratic. Hover states utilize 300ms transitions.
*   **Spacial Rhythm:** Heavy use of precise borders (`border-border/50`), fine 1px dividers, and carefully orchestrated padding (e.g., `space-section: 2.5rem`, `space-group: 1.5rem`) to separate content cleanly. Features like the "Service Details Grid" utilize editorial center-line dividers to mimic magazine spreads.
*   **Focus & CTA:** The "Shiny Input Container" uses conic gradients, internal shimmers, and subtle masks to create a premium, glowing interaction point that demands attention without feeling gaudy.
