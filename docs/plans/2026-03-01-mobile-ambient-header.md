# Ambient Mobile Step Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the oversized, ambient typography effect specifically to the mobile breakpoint of the primary Step Headline in the Configurator. 

**Architecture:** To achieve this, we need to inject the massive text behind the `StepLayout`'s header container, but *only* visible on mobile (`block md:hidden`). Because the Step Header sits at the top of the viewport, the ambient text should be anchored absolutely behind it, fading up from the background color to create depth.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Refactor `StepLayout.tsx`

**Files:**
- Modify: `src/components/configurator/StepLayout.tsx`

**Step 1: Inject Mobile Ambient Header**
1. Locate the `#step-header-anchor` `motion.div` in `StepLayout.tsx` (around line 83).
2. Inside this container (or as an absolute sibling behind it), inject a new `motion.div` that is `block md:hidden`.
3. This new div will hold the massive typography representing the current step's `title`.
4. The styling should match the `ConfiguratorSectionHeader` logic:
   - `absolute top-0 right-0 pointer-events-none z-[-1] overflow-hidden w-full h-full`
   - The text itself should use `font-nohemi font-bold absolute top-0 right-[-10%] opacity-40 select-none whitespace-nowrap uppercase text-transparent bg-clip-text bg-gradient-to-t from-background from-[20%] via-white/5 to-white/10`.
   - Scale the text massive, like `text-[8rem] leading-[0.8]`.
   
**Step 2: Add `relative` positioning and `z-10` to the actual text content**
1. Ensure the container holding the visible Act title, Step title, and Framing text has `relative z-10` so it correctly renders *over* the ambient backdrop text we just injected.
