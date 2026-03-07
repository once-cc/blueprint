# Carousel Hero Images

> **Date:** 2026-03-03  
> **Status:** Implemented  
> **Files:** `scripts/process_carousel_images.py`, `src/data/testimonials.ts`, `src/assets/carousel-images/`

---

## Design

### Objective
Process UI fragment images into 1200×1600 (3:4) carousel assets with a blurred glass border effect for the `TestimonialCarousel`.

### Selected Approach: Seamless Blurred Glass Border
- **Canvas:** 1200×1600px (3:4), Retina-ready.
- **Background Layer:** Oversized, Gaussian-blurred (30–50px) version of the source, darkened.
- **Foreground Layer:** Crisp original with substantial padding (120–160px), subtle drop shadow, faint 1px white border.
- **Separation:** Drop shadow (black, 40% opacity, 30px blur) + `rgba(255,255,255,0.1)` border.

### Source Materials
1. `hero_creator_v3_1772506437184.png`
2. `hero_creator_v1_1772506343751.png`
3. `hero_consultant_v1_1772506298532.png`

---

## Implementation

### Image Processing Script
Python/Pillow script at `scripts/process_carousel_images.py`:
- Reads source images, creates blurred background layer, composites crisp foreground with padding.
- Adds drop shadow and subtle white border.
- Outputs `_optimized.jpg` variants at 90% JPEG quality.

### Integration
- Updated `image` properties in the `capabilityShowcase` array in `src/data/testimonials.ts`.

### Running on New Images
```bash
python3 scripts/process_carousel_images_new.py
```
