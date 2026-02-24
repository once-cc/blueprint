---
name: scroll-hero-cinematic-engine
description: "Cinematic scroll-driven hero generator. Nano Banana + Flow/Veo asset generation, high-DPI canvas scroll engine, HUD messaging, and production-ready Next.js implementation. Governance-aware, performance-bound, accessibility-conscious."
version: 2.0.0
author: Cleland Studio
created: 2026-02-17
updated: 2026-02-17
platforms: [github-copilot-cli, claude-code, codex]
category: creative-engine
tags: [scroll, cinematic, nano-banana, flow, veo, canvas, animation, nextjs]
risk: moderate
---

# SCROLL HERO ENGINE

**(Nano Banana + Flow + Canvas + Scroll Orchestrator)**

## Purpose

This skill generates cinematic scroll-driven heroes. It does not replace accessibility, UX, or performance governance skills. Final output must validate against referenced authority skills.

Outputs: cinematic hero asset, frame-sequence animation, optimized WebP frame set, scroll-driven canvas hero, HUD messaging synced to scroll, production-ready Next.js implementation, mobile + reduced motion fallback.

---

## Structural Model — Layered Architecture (Non-Negotiable)

### Layer 1 — Scroll Hero Engine (Core Responsibility)

Owns: narrative capture, asset generation (Nano Banana + Flow), frame extraction strategy, scroll engine scaffold, high-DPI canvas, HUD sync, motion timing standards, frame payload budgeting, anti-pattern enforcement, pre-delivery checklist.

### Layer 2 — Governance Skills (Referenced, Not Duplicated)

Before deployment, validate against: `ui-ux-pro.md`, `accessibility-compliance`, `web-performance-optimization`, `frontend-design`.

The scroll hero engine references governance skills. It does not duplicate them.

---

## Activation Command

When user says: *"Create a scroll-driven hero"* — the skill enters **Structured Workflow Mode**.

---

## PHASE 1 — INTENT CAPTURE (MANDATORY)

Before generating anything, the skill asks:

### 1. Narrative Intent

What is the emotional arc? Arrival · Transformation · Reveal · Expansion · Collapse · Descent · Ascension

**What should the user feel at the end?**

### 2. Subject

Object · Environment · Human · Abstract · Static→Transform · Environment-only motion · Character morph

### 3. Camera Language

Locked cinematic · Slow orbital · Dolly forward · Crane rise · Parallax depth · First-person

### 4. Lens Profile

24mm (epic scale) · 35mm (neutral cinematic) · 50mm (natural) · 85mm (compression drama) · 135mm (extreme compression)

### 5. Lighting Style

Studio controlled · Overhead industrial · Golden hour · Cold diffused daylight · Volumetric shafts · Harsh contrast noir · Soft museum-grade

### 6. Environmental Transition

None · Crossfade · Day→Night · Interior→Exterior · Chaos→Order · Industrial→Natural

### 7. Brand Tone

Aggressive · Minimal · Editorial · Luxury · Brutalist · Futuristic · Institutional · Sacred · Technical

### 8. Scroll Density

`300vh` (tight) · `500vh` (cinematic standard) · `700vh` (slow burn)

### 9. First Impression

**"What should users feel in the first 3 seconds?"**

Do not proceed until all required inputs are captured.

### Scroll Hero Quality Gate (DFII Lite)

Score each 1–5 before proceeding:

| Dimension | Score |
|-----------|-------|
| Visual Differentiation | ? |
| Narrative Clarity | ? |
| Brand Alignment | ? |
| Feasibility within performance budget | ? |
| Craftsmanship potential | ? |

**If average < 3.5 → revise concept before asset generation.**

---

## PHASE 1.5 — VISUAL HIERARCHY SELECTION

User must choose one archetype:

| Archetype | Structural Intent | Narrative Fit | HUD Placement | Motion Compatibility | Performance Impact |
|-----------|-------------------|---------------|---------------|---------------------|--------------------|
| **Dominant Image + Anchored Text** | Full-bleed visual, text pinned to edge/corner | Reveal, Arrival | Corner-anchored overlay | High — full canvas motion | Standard |
| **Split Narrative** | 50/50 text/image balance | Transformation, Expansion | Adjacent panel | Medium — partial canvas | Lower frame count viable |
| **Statement-Led Hero** | Typography dominates, image supports | Collapse, Ascension | Integrated with type | Low — text drives pacing | Lightest payload |
| **Alternating Blocks** | Scroll reveals alternating content/image sections | Expansion, Descent | Per-block placement | Medium — sectioned motion | Moderate |
| **Vertical Gallery Stack** | Sequential full-width frames | Reveal, Transformation | Between frames | High — continuous sequence | Highest payload |
| **Custom** | User-defined | Any | User-defined | Varies | Varies |

---

## PHASE 2 — NANO BANANA HERO FRAME GENERATION

Auto-generates **Frame A** (Start) and **Frame B** (End).

### Nano Banana Prompt Template

```
Create an ultra-high-resolution cinematic keyframe (16:9).

Subject: {subject}
Camera movement intention: {camera_language}
Lens: {lens_profile}
Lighting: {lighting_style}
Environment: {environment_start}

Maintain: physically accurate lighting, cinematic depth of field, clean silhouette, negative space for overlay text, no distortion or surreal artifacts.

Output: single production-ready frame.
```

Frame B: same camera, lens, perspective. Different subject state. **Perspective and proportions must match Frame A exactly.**

---

## PHASE 3 — FLOW / VEO FRAME-TO-FRAME MORPH

### Flow Template

```
Generate a {duration}-second cinematic transformation video at 24–30fps.

Start frame must match reference 1 exactly.
End frame must match reference 2 exactly.

Transition: strict mechanical continuity. No melting, stretching, or abstract warping.
Camera: {camera_language}, subtle and stable.
Lighting: physically accurate evolution.
Environment: {environment_transition} must feel gradual and cinematic.

Output: 16:9, silent, production-grade realism.
```

---

## PHASE 4 — FRAME EXTRACTION STRATEGY

| Parameter | Target |
|-----------|--------|
| Optimal frame count | 120–160 |
| 200+ frames | Only if hyper-detailed |
| Mobile resolution | 50% desktop scale |
| WebP compression | 70–82 quality |
| Desktop structure | `public/images/sequence/frame_0001.webp` |
| Mobile structure | `public/images/sequence/sd/frame_0001.webp` |

---

## PHASE 5 — SCROLL ENGINE + DEPLOYMENT

Generate: Next.js App Router scaffold, single `scrollYProgress` source, `500vh` scroll container, sticky canvas viewport, high-DPI canvas scaling, contain-fit draw logic, `requestAnimationFrame` throttling, idle frame preload, reduced motion fallback, HUD overlay tied to scroll thresholds.

**Non-negotiable rules:** Only one scroll source. Canvas `aria-hidden`. Reduced motion detection required. No nested scroll containers.

---

## PHASE 6 — HUD MESSAGING ENGINE

| Scroll Range | Phase |
|-------------|-------|
| 0–30% | Presence |
| 30–75% | Peak |
| 75–100% | Resolution |

Messaging derived from **Narrative Intent** + **Brand Tone**.

| Tone | Presence | Peak | Resolution |
|------|----------|------|------------|
| Editorial | "Precision in Motion" | "Structure. Pressure. Release." | "Built for Authority." |
| Brutalist | "Mass." | "Impact." | "Dominance." |
| Luxury | "Precision." | "Engineered Movement." | "Authority in Form." |

---

## Accessibility Requirements (WCAG 2.1 AA)

- HUD overlay contrast ≥ 4.5:1
- Canvas must be `aria-hidden="true"`
- Provide hidden DOM narrative describing hero progression
- Dynamic HUD text → use `aria-live="polite"`
- Any CTA must be keyboard reachable, show visible focus state, maintain logical tab order
- `prefers-reduced-motion` fallback mandatory
- Touch targets ≥ 44×44px
- Do not rely on color alone for meaning

Final validation must pass `accessibility-compliance` skill.

---

## Performance Budget

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| CLS | < 0.1 |
| Desktop frame payload | ≤ 4MB total |
| Mobile frame payload | ≤ 2MB total |
| First 5–10 frames | `fetchpriority="high"` |
| Canvas dimensions | Pre-reserved to prevent layout shift |

Use `navigator.connection.effectiveType` for adaptive loading. Use `requestIdleCallback` for non-critical frame preload. If payload > 3MB → recommend Service Worker caching.

Validate against `web-performance-optimization` skill before deployment.

---

## HUD Typography Constraints

- 65–75 characters per line max
- Line-height: 1.5–1.75
- Presence phase = largest type scale
- Peak phase = medium
- Resolution phase = smallest
- Avoid generic system fonts unless brand mandates
- Provide backdrop or text-shadow for readability over motion

Must comply with `ui-ux-pro` and `frontend-design` typography rules.

---

## Motion Philosophy

**Sparse. Purposeful. High-impact. No animation for decoration.**

| Rule | Value |
|------|-------|
| HUD transitions | 150–300ms |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Animate only | `transform`, `opacity` |
| Never animate | `width`, `height`, `top`, `left` |

Optional: sub-frame interpolation allowed for smoother scroll mapping.

---

## Forbidden Patterns

- ❌ Scroll hijacking
- ❌ Animation overload per frame
- ❌ Desktop-only hero with no mobile fallback
- ❌ Multiple scroll sources
- ❌ Blank canvas during preload
- ❌ Layout shift from unreserved canvas
- ❌ Generic fonts without brand intent
- ❌ 200+ frame payload on mobile without adaptive strategy
- ❌ No reduced motion fallback

---

## Recommended Libraries (Optional)

| Need | Tool |
|------|------|
| Smooth scroll | Lenis |
| Scroll-linked animation | Framer Motion |
| Complex timeline | GSAP ScrollTrigger |
| Canvas rendering | Native Canvas 2D |
| Static fallback | `next/image` |

Do not mandate any specific library.

---

## Final Validation Checklist

### Accessibility
- [ ] 4.5:1 contrast verified
- [ ] Keyboard navigation tested
- [ ] Screen reader narrative verified
- [ ] Reduced motion fallback verified

### Performance
- [ ] LCP under target
- [ ] No layout shift
- [ ] Frame payload under ceiling
- [ ] Mobile memory tested

### Visual
- [ ] No flicker between frames
- [ ] No visible compression artifacts
- [ ] Canvas crisp on Retina

### Responsive
- [ ] Tested at 375, 768, 1024, 1440
- [ ] HUD readable at all sizes

---

## Scope Guardrails

Do NOT:
- Embed full WCAG doctrine
- Embed extended typography systems
- Duplicate `frontend-design` scoring framework
- Hardcode specific animation libraries
- Expand beyond 2,000-word limit

Reference governance skills instead.