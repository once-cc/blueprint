# Dream Intent Chatbox Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the dream intent modal with an inline chatbox in the Scattered Logos section, styled with the Hero's shiny button aesthetic.

**Architecture:** A new `DreamInput` component will use CSS properties for a conic-gradient animated border, wrapping a standard text input. Form submission will write to `localStorage` and route the user to `/configurator`.

**Tech Stack:** React, TailwindCSS, Framer Motion (for entry/exit animations if necessary), React Router.

---

### Task 1: Create the DreamInput Component

**Files:**
- Create: `src/components/ui/dream-input.tsx`

**Step 1: Write minimal implementation**
Create the component borrowing the `.shiny-cta` CSS logic from `shiny-button.tsx`, but shape it into a wide horizontal container `max-w-xl`. Replace the inner button with a transparent `<input type="text">` and a submit button icon.

**Step 2: Commit**
```bash
git add src/components/ui/dream-input.tsx
git commit -m "feat: add DreamInput component"
```

### Task 2: Integrate into ScatteredLogos

**Files:**
- Modify: `src/components/marketing/ScatteredLogos.tsx`

**Step 1: Modify layout**
Remove the `<h2>` block "Seamless AI integration..." and replace it with `<DreamInput />`. Ensure z-indexing allows interaction with the input while logos float around it. Handle the submit callback to save to `localStorage` and `navigate("/configurator")`. 

**Step 2: Commit**
```bash
git add src/components/marketing/ScatteredLogos.tsx
git commit -m "feat: replace scrollytell text with DreamInput"
```

### Task 3: Clean up Blueprint Landing Page

**Files:**
- Modify: `src/pages/Blueprint.tsx`

**Step 1: Remove Modal State**
Remove `<DreamIntentModal />` and all `useState` hooks controlling it.
Change the Hero section's `ShinyButton` `onClick` handler to navigate directly to `/configurator`. 
Change the final CTA section's `<Button>` to do the same.

**Step 2: Commit**
```bash
git add src/pages/Blueprint.tsx
git commit -m "refactor: remove dream intent modal from blueprint page"
```
