# 3D Curved Carousel Design

## Goal
Replace the flat, 2D `embla-carousel-react` base with a bespoke 3D cylindrical carousel using `framer-motion`, matching the provided curved carousel reference.

## Architecture

We will implement **Option A (Cylinder Rotation)**.

### Core Mechanics
- The carousel acts as a virtual 3D cylinder. We place each `TestimonialCard` around the circumference of this cylinder.
- We use a primary Framer Motion `useMotionValue` to track the cylinder's absolute global rotation (`globalRotationY`).
- The user interacts by either dragging on the container or clicking navigation arrows, which updates the `globalRotationY` value.

### Maths & Physics
- If there are `N` testimonials, each card is spaced by `360 / N` degrees (`theta`).
- The radius (`R`) of the cylinder is calculated dynamically based on the card width to ensure they don't overlap too much: `R = Math.round((cardWidth / 2) / Math.tan(Math.PI / N))`.
- Each card's static local position is set to: `rotateY(index * theta) translateZ(R)`.
- The parent container holding all the cards acts as the camera, applying the `globalRotationY` to spin the entire system.

### Interaction
- **Drag:** We wrap the scene in a Framer Motion `drag="x"` container. We map the drag `x` offset to degrees and apply it to `globalRotationY`.
- **Momentum/Snapping:** We use Framer Motion's `dragTransition={{ power: 0.2, timeConstant: 200 }}` to allow a physical "spin" feel, and intercept the drag end (`onDragEnd`) to snap `globalRotationY` to the nearest perfect multiple of `theta` using `animate()`.
- **Click:** Removed detail sheets. Clicking a specific non-center card will trigger a rotation animation that smoothly brings that card to the center (`0deg` relative to the camera).

## Components

- Modify `src/components/blueprint/TestimonialCarousel.tsx`: Remove `embla`. Add state for cards, cylinder radius, and rotation physics.
- Update `src/components/blueprint/TestimonialCard.tsx`: Ensure it visually supports 3D scaling and has no built-in click-intercept conflicting with the parent drag.

## Edge Cases
- **Mobile Width:** The mathematical radius `R` and card widths need to adjust to screen size.
- **Infinite Looping:** Because it's mathematically a circle (0-360 deg), it intrinsically loops perfectly forever.
