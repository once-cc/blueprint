# Cinematic Footer Reveal Design

## Goal
Implement a cinematic scroll-driven sequence for the fixed footer at the bottom of the Blueprint configurator, emphasizing a premium "emergence" effect for the headline and delayed sub-copy fade, while keeping the main CTA completely visible.

## Components & Architecture
- Uses the `framer-motion` library and `useScroll()` combined with `useTransform()` to drive scroll values as the footer unmasks.

## Section 1: The Masqued Headline
- We will encapsulate the current `<h2>` elements inside a wrapper `div` designed with `overflow: hidden`.
- The element will rest partially out of frame (`translate-y: 100%`) when hidden by the page.
- As the user reaches the absolute bottom bounds of `useScroll` (`[0.8, 1]`), we will map that scroll progress to the text's Y-axis (`["100%", "0%"]`), resulting in the text sliding upwards out of what looks like an invisible floor (the void).

## Section 2: Delayed Sub-Copy Reveal
- The helper paragraph ("A complimentary plan...") will start completely invisible (`opacity: 0`).
- Because it needs to appear *after* the headline completes its motion, we will map its opacity tightly to the very final moments of the scroll (`[0.92, 1]` to `[0, 1]`) ensuring it lands like a subtle footnote.

## Section 3: Static CTA
- The CTA (`ShinyButton`) will **not** be mapped to any scroll triggers.
- It will remain 100% visible on the footer at all times, standing boldly over the rest of the text so that as the top page container slides away, the button is instantly clickable.

## Trade-offs and Considerations
- **Scroll Tracking Accuracy:** Measuring scroll position directly requires either the whole page (`scrollYProgress`) or an offset of a specific container ending. Because the footer is `fixed`, utilizing the standard `scrollYProgress` against the window is the most reliable approach, acting identically to an `IntersectionObserver` firing on `1.0`.
- **Mobile vs. Desktop:** The tracking percentages may feel slightly abrupt on very short screens, we will ensure the ranges capture the final ~500px of scrolling for a smooth unspool.
