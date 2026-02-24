# Cinematic Footer Reveal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Formulate the UI update for the `Blueprint.tsx` footer to execute a cinematic "emergence" effect for the headline and subheadline using `framer-motion` scroll-driven values, while keeping the main CTA completely visible.

**Architecture:** Use `useScroll` locally in a new component `FooterReveal` to measure scroll distance inside the fixed footer and map it via `useTransform` to translate/fade the elements as the user scrolls to the absolute bottom of the page.

**Tech Stack:** React, Tailwind CSS, Framer Motion

---

### Task 1: Create the Animated FooterReveal Component

**Files:**
- Modify: `/Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config/src/pages/Blueprint.tsx`

**Step 1: Write the implementation**

Extract the `motion.div` content inside the `<footer>` tag into its own component `FooterReveal` at the top or bottom of `Blueprint.tsx`, injecting `useScroll` and `useTransform`.

```tsx
function FooterReveal({ onCtaClick }: { onCtaClick: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Headline slides up slowly from behind a mask
  const headlineY = useTransform(scrollYProgress, [0.6, 1], ["100%", "0%"]);
  
  // Subcopy fades in after headline has moved
  const subcopyOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const subcopyY = useTransform(scrollYProgress, [0.85, 1], ["20px", "0px"]);

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto text-center space-y-8 py-32 h-[80vh] flex flex-col items-center justify-end overflow-hidden">
      
      {/* The Masking Container for the Headline */}
      <div className="overflow-hidden pb-4">
        <motion.h2 
          style={{ y: headlineY }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-nohemi font-medium tracking-tighter leading-[0.95]"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-950 block pb-1">
            <em className="italic pr-2">Clarity</em> Before
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-950 block">
            Commitment.
          </span>
        </motion.h2>
      </div>

      <motion.p 
        style={{ opacity: subcopyOpacity, y: subcopyY }}
        className="text-xl text-muted-foreground"
      >
        A complimentary plan for your next site — before you invest in the build.
      </motion.p>

      {/* Static CTA Container */}
      <div className="relative z-10 pt-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springConfig}>
          <ShinyButton
            size="lg"
            className="group"
            onClick={onCtaClick}
          >
            <span className="flex items-center gap-2">
              Begin My Blueprint
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1/4" />
            </span>
          </ShinyButton>
        </motion.div>
        
        <p className="text-sm text-muted-foreground mt-8">
          No commitment required • Response within 24 hours
        </p>
      </div>

    </div>
  );
}
```

**Step 2: Swap the static markup in the footer for the new Component**

```tsx
      {/* Final CTA Section (Pinned Reveal Footer) */}
      <footer 
        ref={footerRef}
        className="fixed bottom-0 left-0 w-full bg-muted/30 -z-10 h-[60vh]"
      >
        <section className="text-foreground w-full h-full flex items-end pb-24">
          <div className="container mx-auto px-6">
            <FooterReveal onCtaClick={scrollToChatbox} />
          </div>
        </section>
      </footer>
```

### Task 2: Refine Component Alignment

**Step 1: Validate**
Run the site in the browser to ensure the `FooterReveal` mapping syncs flawlessly with the scrolling action opening the `marginBottom` offset.

**Step 2: Commit**

```bash
git add src/pages/Blueprint.tsx
git commit -m "feat: animate footer reveal sequence using framer-motion"
```
