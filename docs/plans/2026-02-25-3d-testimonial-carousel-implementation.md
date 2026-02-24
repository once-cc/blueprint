# 3D Curved Testimonial Carousel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 2D Embla carousel with a bespoke 3D cylindrical Carousel using Framer Motion, matching a premium curved 3D design.

**Architecture:** We will use a `useMotionValue` to track the global rotation of a 3D cylinder. Each testimonial card will be placed globally around the cylinder (`rotateY`) and pushed outwards (`translateZ`). The user drags a centralized container to spin the entire cylinder. Cards rotate and shrink dynamically as they move away from the center. Clicking non-center cards rotates the carousel to snap them directly to the front.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Update TestimonialCard styles for 3D readiness

**Files:**
- Modify: `/Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config/src/components/blueprint/TestimonialCard.tsx`

**Step 1: Write minimal implementation**

We need to update the card so it doesn't intercept or conflict with the parent container's 3D transforms. We will remove the local `whileHover` and `whileTap` scaling so the 3D physics engine controls all scaling.

```tsx
import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick?: () => void;
  isActive?: boolean;
}

export function TestimonialCard({ testimonial, onClick, isActive = false }: TestimonialCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group h-full w-full transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
    >
      <div className={`relative bg-card border rounded-2xl p-8 h-full transition-all duration-300 ${isActive ? "border-accent shadow-lg shadow-accent/10" : "border-border/40"}`}>
        {/* Quote icon */}
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Quote className="w-4 h-4 text-accent" />
        </div>

        {/* Quote */}
        <p className="text-lg font-raela font-medium leading-relaxed mb-8 pr-12 line-clamp-4">
          "{testimonial.quote}"
        </p>

        {/* Project title */}
        <p className="text-sm text-accent font-medium mb-4">
          {testimonial.projectTitle}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-nohemi font-medium text-muted-foreground">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blueprint/TestimonialCard.tsx
git commit -m "refactor: simplify TestimonialCard for 3D carousel integration"
```

---

### Task 2: Implement the 3D Cylinder Physics Engine

**Files:**
- Modify: `/Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config/src/components/blueprint/TestimonialCarousel.tsx`

**Step 1: Write minimal implementation**

Replace the entire Embla setup with a Framer Motion physics engine.

```tsx
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "./TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Carousel Physics State
  const CYLINDER_RADIUS = 600; // Distance cards are pushed back in 3D space
  const theta = 360 / testimonials.length; // Degrees between each card
  
  // Track continuous global rotation (can go beyond 360 or under 0)
  const rotation = useMotionValue(0);
  
  // State for active index focusing
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active index based on rotation, handling wrap-around
  useEffect(() => {
    return rotation.onChange((val) => {
      // Normalize rotation to find which card is closest to 0deg
      // 0deg = index 0. -theta = index 1.
      const normalized = ((val % 360) + 360) % 360; 
      let closest = Math.round((360 - normalized) / theta) % testimonials.length;
      if (closest < 0) closest += testimonials.length;
      setActiveIndex(closest);
    });
  }, [rotation, theta]);

  const snapToDegree = (targetRotation: number) => {
    animate(rotation, targetRotation, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1
    });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Current un-snapped rotation based on drag
    const currentRot = rotation.get();
    
    // Add momentum factor based on velocity
    const velocityFactor = info.velocity.x * 0.05; 
    const targetWithMomentum = currentRot + velocityFactor;
    
    // Find nearest face
    const nearestFace = Math.round(targetWithMomentum / theta) * theta;
    snapToDegree(nearestFace);
  };

  const spinCarousel = (direction: -1 | 1) => {
    const currentRot = rotation.get();
    // Round to nearest integer multiple to fix tiny floating point drifts
    const roundedCurrentRot = Math.round(currentRot / theta) * theta;
    const nextRot = roundedCurrentRot + (direction * theta);
    snapToDegree(nextRot);
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) return;
    
    // Calculate the shortest path to rotate the cylinder so 'index' faces front
    const currentRot = rotation.get();
    const currentNormalized = ((currentRot % 360) + 360) % 360;
    
    // Target normalized rotation needed for this index
    const targetNormalized = (360 - (index * theta)) % 360;
    
    // Find shortest angular distance between current phase and target phase
    let diff = targetNormalized - currentNormalized;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    snapToDegree(currentRot + diff);
  };

  return (
    <div className="relative w-full overflow-hidden py-10" style={{ perspective: "1200px" }}>
      
      {/* Background Gradient Fades (Z-index high to mask cylinder clipping) */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

      {/* Navigation Controls */}
      <button
        onClick={() => spinCarousel(1)}
        className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => spinCarousel(-1)}
        className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 3D Scene Container */}
      <div 
        ref={containerRef} 
        className="flex justify-center items-center h-[350px] relative z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* The Rotatable Draggable Cylinder Viewport */}
        <motion.div
           className="relative w-full max-w-[340px] md:max-w-[420px] h-full cursor-grab active:cursor-grabbing"
           style={{
             rotateY: rotation,
             transformStyle: "preserve-3d"
           }}
           drag="x"
           dragElastic={0.4}
           // Decrease ratio so dragging maps cleanly to degrees
           onDrag={(_e, info) => {
             const currentRot = rotation.get();
             rotation.set(currentRot + info.delta.x * 0.25);
           }}
           onDragEnd={handleDragEnd}
        >
          {testimonials.map((testimonial, idx) => {
            
            // Map the layout angles for each card (Static)
            const itemRotationY = idx * theta;

            return (
               <motion.div
                 key={testimonial.id}
                 className="absolute inset-0 flex justify-center items-center"
                 style={{
                   // 1. Rotate the card to its spot on the cylinder
                   // 2. Push it outward by the radius Z
                   // 3. Since the parent container (camera) rotates, this keeps it glued to the wall
                   transform: `rotateY(${itemRotationY}deg) translateZ(${CYLINDER_RADIUS}px)`,
                   backfaceVisibility: "hidden", // Hide them when they spin around the back
                   WebkitBackfaceVisibility: "hidden"
                 }}
               >
                 <TestimonialCard 
                    testimonial={testimonial} 
                    onClick={() => handleCardClick(idx)}
                    isActive={activeIndex === idx}
                 />
               </motion.div>
            )
          })}
        </motion.div>
      </div>

    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blueprint/TestimonialCarousel.tsx
git commit -m "feat: replace embla with framer-motion 3D cylinder physics engine"
```

---

### Task 3: Cleanup deprecated components

**Files:**
- Delete: `/Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config/src/components/blueprint/TestimonialDetailSheet.tsx`

**Step 1: Write minimal implementation**

We removed the detail sheet requirement. Run command: 
```bash
rm src/components/blueprint/TestimonialDetailSheet.tsx
```

**Step 2: Uninstall Embla Dependencies (Optional but good hygiene)**

```bash
npm uninstall embla-carousel-react embla-carousel-autoplay
```

**Step 3: Commit**

```bash
git add -u
git commit -m "chore: remove deprecated testimonial detail sheet and embla dependencies"
```
