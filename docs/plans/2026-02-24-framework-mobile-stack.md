# Framework Section Mobile Stack Layout

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modify `FrameworkSection.tsx` to use a totally different layout on mobile. Instead of a scrolling right column, the mobile view will feature animated, sticky cards that stack over each other, identical in behavior to the `BenefitStackSection`.

**Architecture:**
- Create a `FrameworkMobile` component containing the `StackCard` logic.
- Create a `FrameworkDesktop` component that houses the existing grid architecture.
- Use responsive Tailwind classes (`hidden md:block` and `block md:hidden`) to selectively render the appropriate layout.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Refactor FrameworkSection into View Components

**Files:**
- Modify: `src/components/marketing/FrameworkSection.tsx`

**Step 1: Extract `FrameworkDesktop`**
- Move the entire `max-w-7xl mx-auto grid...` JSX block into a new function `FrameworkDesktop`.
- Update the main `FrameworkSection` return to conditionally render `<FrameworkDesktop />` inside an `md:block hidden` container.

**Step 2: Create `FrameworkMobile` Structure**
- Build a new `FrameworkMobile` component that replicates the `useScroll` tracking from `BenefitStackSection`.
- Apply `block md:hidden` on the container wrapping `<FrameworkMobile />`.

**Step 3: Build the Mobile `StackCard`**
- Within `FrameworkMobile`, map the `processSteps` data to a new `MobileStackCard` component.
- The `MobileStackCard` should feature `sticky top-24` behavior.
- Use `useTransform` on the scroll progress to scale down (`[1, 0.95]`) and darken (`[1, 0.4]`) the card as the next one scrolls over it.
- Ensure the card visually matches the UI requirements: dark card background, border, Phase number, Title, SVG graphic, description, and bullets. 

**Step 4: Verify visually**
- Run the dev server.
- On desktop (> 768px), verify the grid lines and sticky numbers behave exactly as they did before.
- Scale the browser window to mobile (< 768px). Verify the new stacking cards appear, stick to the top, shrink slightly as the next item covers them, and properly render the SVG graphics.

**Step 5: Commit**
```bash
git add src/components/marketing/FrameworkSection.tsx
git commit -m "feat(marketing): implement mobile stacked card layout for Framework section"
```
