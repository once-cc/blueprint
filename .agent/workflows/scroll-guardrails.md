---
description: Scroll Performance & Motion Guardrails
---

# Scroll Performance & Motion Guardrails

To maintain a high-fidelity cinematic experience and avoid "scroll friction" or frame-drops, all contributors must adhere to the following architectural invariants.

## 1. Unified Scroll Authority
- **Never** add new `window.addEventListener('scroll', ...)` listeners.
- **Never** use multiple `useScroll` instances for the same viewport area if a parent authority exists.
- **Always** consume scroll progress from the nearest common ancestor or the global `useSmoothScroll()` hook.

## 2. No React State on Scroll
- **Never** call `setState()` inside a scroll listener or `useMotionValueEvent` for per-frame updates (e.g., updating visibility, progress, or positions).
- **Always** use declarative Framer Motion hooks:
  - `useTransform`: To map scroll progress to visual properties (opacity, translate, scale).
  - `useSpring`: If manual smoothing is required (use sparingly as Lenis already provides smoothing).
- **Exception**: State updates for *entering/exiting* a section (e.g., triggering a one-time entrance animation) are permitted via `useInView` or `onViewportEnter`.

## 3. Layout Purity (No Reads)
- **Never** call `getBoundingClientRect()` or any other "Layout-Reading" property during a scroll frame. These force the browser to re-calculate layout, killing performance.
- **Always** pre-measure layout on mount/resize if absolute pixel values are needed, or use Framer Motion's `target` and `offset` syntax which optimizes these reads.

## 4. GPU Promotion (will-change)
- **Always** add `will-change: transform` to sticky background layers and elements with heavy parallax transformations.
- **Never** promote every element on the page. Only promote "Cinematic Authorities" (videos, large image planes, sticky containers).

## 5. Texture & Media
- **Always** use `loading="lazy"` for off-screen images.
- **Always** use `IntersectionObserver` to `play()`/`pause()` background videos to save CPU cycles and prevent out-of-sync playback.

## Checklist for New Sections
- [ ] Uses `useTransform` for all scroll-driven UI changes?
- [ ] Zero `setState` calls in the scroll loop?
- [ ] No manual `addEventListener`?
- [ ] `will-change` hints on critical layers?
- [ ] Video playback managed by visibility?
