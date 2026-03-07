# Cinematic Footer Reveal

> **Date:** 2026-02-25  
> **Status:** Implemented  
> **Files:** `src/pages/Blueprint.tsx` (`FooterReveal` component)

---

## Design

### Goal
Implement a cinematic scroll-driven sequence for the fixed footer at the bottom of the Blueprint configurator, emphasizing a premium "emergence" effect for the headline and delayed sub-copy fade, while keeping the main CTA completely visible.

### Architecture
- Uses `framer-motion` with `useScroll()` and `useTransform()` to drive scroll values as the footer unmasks.
- **Masqued Headline:** The `<h2>` rests at `translate-y: 100%` when hidden. As the user reaches the bottom (`[0.8, 1]`), scroll progress maps to Y-axis (`["100%", "0%"]`), sliding upward.
- **Delayed Sub-Copy:** Starts invisible (`opacity: 0`), mapped tightly to `[0.92, 1]` → `[0, 1]` so it lands as a subtle footnote after the headline.
- **Static CTA:** The `ShinyButton` is not scroll-mapped — always visible and clickable.

### Considerations
- Scroll tracking uses `scrollYProgress` against the window (footer is `fixed`).
- Mobile: Ranges capture the final ~500px of scrolling for smooth unspool.

---

## Implementation

### `FooterReveal` Component
Extracted from `Blueprint.tsx` as a dedicated component using `useScroll` and `useTransform`.

**Key transforms:**
- `headlineY`: `scrollYProgress [0.6, 1]` → `["100%", "0%"]`
- `subcopyOpacity`: `scrollYProgress [0.85, 1]` → `[0, 1]`
- `subcopyY`: `scrollYProgress [0.85, 1]` → `["20px", "0px"]`

**Structure:** Masking container (`overflow: hidden`) wraps the headline. Sub-copy fades in after headline completes. CTA stays static at the bottom.

### Integration
Swapped static footer markup in `Blueprint.tsx` with `<FooterReveal onCtaClick={scrollToChatbox} />` inside the fixed footer section.
