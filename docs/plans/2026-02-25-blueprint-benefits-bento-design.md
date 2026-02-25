# Blueprint Benefits Bento Grid Design

## Goal
Replace the existing sticky stacking cards in the "Why Start With a Blueprint?" section with a modern, glassmorphic 2x2 Bento Grid layout, combining it with a Scrolly-tell entrance animation for the section headline.

## Architecture & Layout
1. **Scrolly-tell Entrance:** 
   The headline and sub-copy will utilize the exact same `ScrollytellSection` aesthetic. Words illuminate on scroll to build anticipation and maintain narrative consistency across the site.
2. **The Bento Grid (Desktop):**
   Below the intro, a 2x2 CSS Grid will house the 4 benefit cards. 
3. **The Vertical Stack (Mobile):**
   On smaller viewports (`md` breakpoint and below), the grid collapses into a standard 1-column vertical stack.
4. **Card Design:**
   Cards will feature a dark translucent background (`bg-card/50`), subtle borders, and a soft backdrop blur (glassmorphism). Inside, the existing Lucide icons will be housed in glowing, accent-colored bounding boxes.

## Data Flow & State
- Existing `benefits` array in `BenefitStackSection.tsx` will be reused.
- Framer Motion's `useScroll` and `useTransform` hooks will drive entrance animations. Since the sticky behavior is removed, we only need simple `whileInView` or staggered viewport entrance animations.

## Interaction & Animation
- **Entrance:** The grid as a whole fades up when sliding into view. Individual cards might have a slight stagger in their initial opacity/Y-translation.
- **Hover State:** Hovering over a card gently illuminates the border with the card's specific accent color (`benefit.color`) and slightly scales up the inner icon.

## Implementation Implications
- The 400vh artificial scroll height container in `BenefitStackSection.tsx` will be completely removed.
- Complex scroll-range calculations (`startSquish`, `endSquish`) are no longer needed.
- We will replace `StackCard` with a new `BentoCard` component.

## Testing & Verification
- Manually test scroll behavior on desktop to ensure Scrolly-tell resolves before the Bento Grid fully enters.
- Verify 2x2 grid alignment on `min-width: 1024px`.
- Verify 1-column vertical stack on mobile devices.
- Confirm hover interactions feel premium and don't introduce layout shifts.
