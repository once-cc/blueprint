# Cleland Studio: Brand Identity & Design System

## 1. Core Aesthetic & Tone
*   **Vibe:** Cinematic, Executive Editorial, Immersive, Premium
*   **Mood:** Sophisticated, deep, structured yet atmospheric. It balances the rigidity and precision of structural architecture with the narrative flow of high-end editorial design.
*   **Tone:** Confident, understated, and highly professional.

## 2. Color Palette (Cinematic Dark Mode Default)
The palette leans heavily into "Deep Cinematic Darks" contrasted with warm, luxurious accents and crisp typography.

*   **Backgrounds / Void:** Deep Navy/Charcoal (`#090A0C` / `hsl(220 15% 4%)`). Provides a vast, cinematic canvas.
*   **Foreground / Text:** Warm Ivory / Cream (`hsl(45 10% 92%)`). Softens the contrast, making reading pleasant and elegant.
*   **Accents / CTAs:** Warm Amber / Gold (`hsl(38 85% 55%)`). Serves as the primary luxury accent for interactions, rings, and focus states.
*   **Atmosphere / Surfaces:** Mid-to-dark grays (`hsl(220 12% 8%)` to `14%`) create depth without breaking the dark mode immersion.
*   **Light Mode Shift:** Clean, warm daytime palette (`hsl(45 20% 96%)` background) paired with deep charcoal primary text, retaining the amber/gold accent for continuity.

## 3. Typography System
A strict three-tier typographic hierarchy defines the functional and emotional flow of information:

*   **Structural / Orientation (Syne):** Used for large stage numbers, section headings, and spatial orientation. It brings architectural rigidity and weight.
*   **Editorial / Narrative (Cormorant Garamond):** Used for large hero text, storytelling, and elegant emphasis. Brings a luxurious, print-like quality that softens structural rigidity.
*   **Functional / System (Raela Pro):** A highly legible, engineered sans-serif for UI elements, labels, and standard body copy. Forms the utilitarian backbone.

## 4. Stylization & Textures
The project avoids flat design, opting instead for a layered, spatial approach reminiscent of high-end editorial or cinematic composition:

*   **Atmospheric Depth:** Uses an animated, slow-shifting 4-point gradient base (`opacity: 0.35 - 0.4`), layered underneath the main content to create a faintly "breathing" background.
*   **Tactility:** A subtle SVG grain texture overlay (`opacity: 0.03`, `mix-blend-mode: overlay`) provides a film-like, tactile quality to the digital space.
*   **Motion & Flow:** Elements use "Cinematic" easing (`cubic-bezier(0.22, 1, 0.36, 1)`). Hover states and transitions are smooth, deliberate, and never erratic. Micro-interactions like `drift`, `ripple`, `crt-sweep`, and slow scanlines (`scanline-flicker`) are used tastefully to reinforce the cinematic feel without overwhelming.
*   **Spacial Rhythm:** Heavy use of borders (`hsl(var(--border) / 0.3)`), fine lines (1px dividers), and carefully orchestrated padding (e.g., `space-section: 2.5rem`, `space-group: 1.5rem`) separate content sharply. The structured "Service Details Grid" acts as a pristine editorial magazine spread, complete with gold accent scale-in animations on hover.

*Analysis generated using UIUX Pro Max protocols on actual project source configuration.*
