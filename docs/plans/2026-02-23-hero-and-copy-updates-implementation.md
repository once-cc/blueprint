# Hero & Copy Updates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the "3-D Framework" copy updates, integrate the Domain Display Narrow font, update the global typography hierarchy, and prepare the structure for custom animated SVGs on the landing and success pages.

**Architecture:** We will first load the new font, then update the Tailwind configuration and root CSS to define the new typography hierarchy. Following that, we will update the React components (`Hero`, `HowItWorks`, `SuccessPage`) with the new copy and typography classes. Finally, we will build placeholders/components for the custom SVGs.

**Tech Stack:** React, Tailwind CSS, Vite

---

### Task 1: Add Domaine Display Narrow Font

**Files:**
- Modify: `src/index.css` (or `index.html` if using a web font link)
- Modify: `tailwind.config.ts`

**Step 1: Load the Font**
*Assuming the font files (`domainedispnar-medium.woff2` or similar) are provided or we are using a `@font-face` declaration.*

Add `@font-face` declaration to the top of `src/index.css`:
```css
@font-face {
  font-family: 'Domaine Display Narrow';
  src: url('/fonts/DomaineDisplayNarrow-Medium.woff2') format('woff2'); /* Adjust path as needed */
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Domaine Display Narrow';
  src: url('/fonts/DomaineDisplayNarrow-MediumItalic.woff2') format('woff2'); /* Adjust path as needed */
  font-weight: 500;
  font-style: italic;
  font-display: swap;
}
```

**Step 2: Update Tailwind Config**
Modify `tailwind.config.ts` to include the new font in the `extend.fontFamily` section:
```typescript
      fontFamily: {
        // ... existing structural fonts ...
        // Explicitly set editorial to use Domaine
        domaine: ["Domaine Display Narrow", "serif"],
        editorial: ["Domaine Display Narrow", "Cormorant Garamond", "serif"],
        // ...
      },
```

**Step 3: Update CSS Typography Classes**
Modify `src/index.css` to ensure `.heading-editorial`, `.heading-display`, and similar classes point to `var(--font-editorial)` which is now mapped to Domaine.

**Step 4: Commit**
```bash
git add src/index.css tailwind.config.ts
git commit -m "feat(typography): integrate domaine display narrow font"
```

---

### Task 2: Update Hero Component

**Files:**
- Modify: `src/components/marketing/Hero.tsx` (Path to be confirmed during execution)

**Step 1: Update Copy and Typography**
Update the Hero component to implement the new "Crafted" messaging and strict typography hierarchy.

```tsx
// Inside Hero.tsx (adjust class names based on actual component structure)
<div className="flex flex-col items-center text-center">
  <span className="font-display type-structural-bold tracking-widest text-[10px] md:text-sm text-accent mb-6">
    THE CRAFTED APPROACH
  </span>
  <h1 className="heading-editorial text-5xl md:text-7xl lg:text-8xl mb-8">
    The <em className="italic font-medium">Crafted</em> Blueprint.
  </h1>
  <p className="font-body type-functional-light text-lg md:text-xl text-muted-foreground max-w-2xl">
    An architectural foundation for high-performance digital experiences. Eliminate guesswork before development even begins.
  </p>
</div>
```

**Step 2: Add SVG Placeholder Container**
Create a container for the incoming custom animated SVG below the hero text.
```tsx
<div className="w-full max-w-4xl mx-auto mt-16 aspect-video relative bg-card/5 border border-border/30 rounded-xl overflow-hidden flex items-center justify-center">
    {/* SVG will go here. Temporary placeholder: */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <span className="font-display text-xs tracking-widest">[ CUSTOM HERO SVG ANIMATION ]</span>
    </div>
</div>
```

**Step 3: Commit**
```bash
git add src/components/marketing/Hero.tsx
git commit -m "feat(marketing): update hero copy and typography hierarchy"
```

---

### Task 3: Overhaul "How It Works" Section

**Files:**
- Modify: `src/components/marketing/HowItWorks.tsx` (Path to be confirmed during execution)

**Step 1: Update Section Header**
Change the section header to use the Syne eyebrow and Domaine headline.
```tsx
<span className="font-display type-structural-bold text-accent tracking-widest text-[10px] md:text-sm">
  A DEFINITIVE FRAMEWORK
</span>
<h2 className="heading-editorial text-4xl md:text-6xl mt-4 mb-16">
  Discovery, Design, Delivery.
</h2>
```

**Step 2: Implement 3-D Framework Data**
Update the data array mapped in the component to reflect the new 3-step process.
```tsx
const frameworkSteps = [
  {
    id: "discovery",
    title: "Discovery",
    description: "We examine your current digital infrastructure to identify where momentum is lost, auditing every touchpoint for clarity and conversion impact.",
    bullets: ["Strategic gap analysis", "Revenue leak identification", "Audience resonance audit"]
  },
  {
    id: "design",
    title: "Design",
    description: "We interpret your unique value into a visual language that commands authority, building a system-level architecture that scales with your ambition.",
    bullets: ["Brand cosmology development", "System-level interface design", "Cinematic visual production"]
  },
  {
    id: "deliver",
    title: "Deliver",
    description: "A production-ready ecosystem handed over with complete operational clarity, ensuring you can lead your market without technical overhead.",
    bullets: ["Full-stack implementation", "Performance optimization", "Operational handoff training"]
  }
];
```

**Step 3: Render Steps with New Layout and SVG Placeholders**
Refactor the render loop to accommodate the new structured bullets and placeholders for the unique SVGs. Note the use of `Raela` (functional-light) for the body text.

**Step 4: Commit**
```bash
git add src/components/marketing/HowItWorks.tsx
git commit -m "feat(marketing): implement 3-D framework in How It Works section"
```

---

### Task 4: Polish Success Page

**Files:**
- Modify: `src/components/blueprint-preview/SuccessPage.tsx` (Path to be confirmed based on actual routing setup)

**Step 1: Update Copy and Typography**
```tsx
<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
  {/* Existing animated ring component stays here */}
  
  <span className="font-display type-structural-bold tracking-widest text-accent text-xs mt-12 mb-4">
    BLUEPRINT GENERATED
  </span>
  <h1 className="heading-editorial text-4xl md:text-6xl lg:text-7xl mb-6">
    Your Roadmap is <em className="italic font-medium">Crafted</em>.
  </h1>
  <p className="font-body type-functional-light text-muted-foreground text-lg max-w-xl">
    We've received your Blueprint. A confirmation receipt + PDF has been sent to your email.
  </p>
  
  {/* Existing Download Button */}
</div>
```

**Step 2: Commit**
```bash
git add src/components/blueprint-preview/SuccessPage.tsx
git commit -m "feat(success): elevate success page typography and copy"
```
