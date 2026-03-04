# Cleland Studio Typography System

This document outlines the complete typography system used in the Cleland Studio ecosystem. It serves as a guide for transferring and replicating the "Executive Editorial" and "Cinematic Dark Mode" typography theme to other projects.

---

## 1. Font Families & Assets

The typography system relies on three primary font archetypes, categorizing fonts by their role: Structural, Editorial, and Functional.

### Google Fonts (Web Fonts)
Required imports for standard styling and fallbacks. Add these to your `<head>` or via CSS `@import`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Primary Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- Supplemental Google Fonts used in ecosystem -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Local/Custom Fonts
Premium fonts that must be hosted locally (e.g., in the `/public/fonts` directory). Ensure you have the proper licenses to use these.

```html
<link rel="preload" href="/fonts/LTS-Raela-Pro-Regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="/fonts/LTS-Raela-Pro-Light.ttf" as="font" type="font/ttf" crossorigin>
```
*Note: `Domaine Display Narrow` is also specified in the styling as a premium editorial font. If you do not have it, the system falls back seamlessly to `Cormorant Garamond`.*

---

## 2. Tailwind Configuration (`tailwind.config.ts`)

To replicate the font families in Tailwind CSS, extend the `theme.fontFamily` object in your Tailwind configuration file:

```typescript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Structural — Syne (orientation, architecture)
        display: ["Syne", "sans-serif"],
        
        // Editorial — Domaine Display Narrow (narrative, headings)
        domaine: ["Domaine Display Narrow", "serif"],
        editorial: ["Domaine Display Narrow", "Cormorant Garamond", "Georgia", "serif"],
        serif: ["Domaine Display Narrow", "Cormorant Garamond", "Georgia", "serif"],
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        
        // Functional — Raela Pro (body, UI, system)
        body: ["Raela Pro", "system-ui", "sans-serif"],
        raela: ["Raela Pro", "system-ui", "sans-serif"],
        sans: ["Raela Pro", "system-ui", "sans-serif"],
        
        // Tech — Nohemi (precision, framework)
        nohemi: ["Nohemi", "sans-serif"],
      }
    }
  }
}
```

---

## 3. Typography Styles & Utility Classes

The project uses custom CSS layer classes to maintain strict visual consistency. These should be placed in your main CSS file (e.g., `typography.css`) within `@layer base` and `@layer components`.

### Base Layer (`@layer base`)

#### Structural classes (using `Syne`)
Provides architectural rigidity, modern precision, and weight.
- `.type-structural` — `font-weight: 400`, `letter-spacing: 0.02em`, `text-transform: uppercase`
- `.type-structural-bold` — `font-weight: 500`, `letter-spacing: 0.04em`, `text-transform: uppercase`
- `.type-stage-number` — Large stage orientators; `font-weight: 500`, `letter-spacing: -0.02em`, `line-height: 1`

#### Editorial classes (using `Domaine Display Narrow` or `Cormorant Garamond`)
Provides narrative elegance, an editorial feel, and luxurious emphasis.
- `.type-editorial` — `font-weight: 400`, `line-height: 1.35` (Responsive: `1.25` on mobile)
- `.type-editorial-medium` — `font-weight: 500`, `line-height: 1.35` (Responsive: `1.25` on mobile)
- `.type-editorial-heading` — `font-weight: 500`, `line-height: 1.2` (Responsive: `1.1` on mobile)

#### Functional classes (using `Raela Pro`)
Engineered sans-serif for UI elements, labels, buttons, and clear body copy.
- `.type-functional` — `font-weight: 400`, `line-height: 1.5` (Responsive: `1.4` on mobile)
- `.type-functional-light` — `font-weight: 300`, `line-height: 1.5` (Responsive: `1.4` on mobile)
- `.type-label` — `font-size: 0.75rem`, `letter-spacing: 0.02em`, `text-transform: uppercase`

### Components Layer (`@layer components`)

#### Hero & Display structural
- `.heading-hero` — Massive structural text; bold, uppercase, tracking-tight, leading-none, size `clamp(4rem, 15vw, 14rem)`
- `.heading-display` — Large structural text; bold, uppercase, tracking-tight, leading-none, size `clamp(2.5rem, 8vw, 7rem)`
- `.heading-section` — Section dividers; semibold, uppercase, size `clamp(0.75rem, 1vw, 0.875rem)`, `letter-spacing: 0.15em`

#### Hero & Display editorial
- `.heading-editorial` — Elegant hero text; `letter-spacing: 0.02em`, `line-height: 0.9`
  - `.heading-editorial-primary` — `font-weight: 500`
  - `.heading-editorial-secondary` — `font-weight: 400`, `opacity: 0.65`

#### Standard Body
- `.body-large` — Serif body text; `text-xl md:text-2xl`, `leading-relaxed` (`line-height: 1.4` on mobile)
- `.body-regular` — Generic text; `text-base`, `leading-relaxed` (`line-height: 1.4` on mobile)

---

## 4. Mobile Typography Tightening

When transferring these styles, it is **critical** to tighten line heights for mobile devices to prevent the typography from looking disconnected. Ensure your CSS includes the following global media query adjustments:

```css
@media (max-width: 768px) {
  .type-editorial, .type-editorial-medium {
    line-height: 1.25;
  }
  .type-editorial-heading {
    line-height: 1.1;
  }
  .type-functional, .type-functional-light, .body-large, .body-regular {
    line-height: 1.4;
  }
}
```

## 5. Summary Rules for transferring

1. **Host Local Fonts**: Extract `LTS-Raela-Pro-*` and `Domaine Display Narrow` (if available) and place them in the new project's public fonts folder. Update the preload links in `index.html`.
2. **Update Tailwind**: Copy the `fontFamily` block into the `extend` property of `tailwind.config.ts`.
3. **Copy Custom CSS**: Transfer the base and component layers from this document directly into the global CSS or as imported partials.
4. **Adhere to the Hierarchy**: Never mix fonts outside their defined roles (`Syne` for structure, `Domaine/Cormorant` for editorial, `Raela Pro` for functional text).
