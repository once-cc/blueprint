# 3D Curved Testimonial Carousel

> **Date:** 2026-02-25  
> **Status:** Implemented  
> **Files:** `src/components/blueprint/TestimonialCarousel.tsx`, `src/components/blueprint/TestimonialCard.tsx`

---

## Design

### Goal
Replace the flat, 2D `embla-carousel-react` with a bespoke 3D cylindrical carousel using `framer-motion`.

### Core Mechanics
- The carousel acts as a virtual 3D cylinder. Each `TestimonialCard` is placed around the circumference.
- A primary `useMotionValue` tracks absolute global rotation (`globalRotationY`).
- User interacts by dragging the container or clicking navigation arrows.

### Maths & Physics
- `N` testimonials spaced by `theta = 360 / N` degrees.
- Radius: `R = Math.round((cardWidth / 2) / Math.tan(Math.PI / N))`.
- Each card: `rotateY(index * theta) translateZ(R)`.
- Parent container rotates the entire system via `globalRotationY`.

### Interaction
- **Drag:** `drag="x"` maps drag offset to degrees on `globalRotationY`.
- **Momentum/Snapping:** Spring physics snap to nearest `theta` multiple on drag end.
- **Click:** Non-center cards rotate the carousel to bring them front-center.

---

## Implementation

### TestimonialCard
- Simplified for 3D: removed local `whileHover`/`whileTap` (3D physics controls all scaling).
- Accepts `onClick` and `isActive` props for carousel integration.

### TestimonialCarousel (3D Cylinder Engine)
- `CYLINDER_RADIUS = 600`, `theta = 360 / N`.
- Each card absolute-positioned with `rotateY(idx * theta) translateZ(R)` and `backfaceVisibility: hidden`.
- `handleDragEnd` adds momentum factor from velocity, snaps to nearest face.
- `handleCardClick` calculates shortest angular path for smooth rotation.
- Gradient edge fades mask the cylinder clipping on left/right.
- ChevronLeft/ChevronRight navigation controls.

### Cleanup
- Deleted `TestimonialDetailSheet.tsx` (deprecated).
- Uninstalled `embla-carousel-react` and `embla-carousel-autoplay`.
