# Design Plan: Blueprint Configurator Carousel Images

**Date:** 2026-03-03
**Topic:** Hero Images for Testimonial Carousel

## Objective
Update and optimize the provided asset images for the Blueprint configurator's `TestimonialCarousel`, creating a seamless 3:4 portrait card design using a glass/blur background effect.

## Context & Constraints
*   **Target Audience:** Service-based SMEs, social-media-driven operators, creators, consultants, and founders.
*   **Aesthetic:** "Executive Editorial & Cinematic Dark Mode." 
*   **Component Structure:** The images render inside a 3:4 portrait card with a `mix-blend-screen` effect in the frontend.

## Selected Approach: The Seamless Blurred Glass Border

### 1. Canvas & Composition
*   **Dimensions/Aspect Ratio:** 1200x1600 pixels (3:4 aspect ratio) to provide high-resolution assets suitable for Retina displays.
*   **Background Layer (Thematic Border):** An oversized, zoomed-in version of the source asset filling the entire 1200x1600 canvas. This layer will have a strong Gaussian blur applied (e.g., 30px-50px radius) and be slightly darkened to create a deep, moody "glass" backdrop.
*   **Foreground Layer (Crisp Asset):** The original source asset scaled to fit within the canvas, but with substantial padding (e.g., a 120px to 160px margin on all sides). This ensures the crisp, unblurred UI fragment serves as the focal point.
*   **Separation:** A subtle drop shadow (e.g., black, 40% opacity, 30px blur) and a very faint 1px semi-transparent white border (e.g., `rgba(255, 255, 255, 0.1)`) will be applied to the foreground layer to lift it off the blurred background.

### 2. Source Materials
The base images to synthesize and adapt into this style are:
1.  `hero_creator_v3_1772506437184.png`
2.  `hero_creator_v1_1772506343751.png`
3.  `hero_consultant_v1_1772506298532.png`

*(Additional images can be processed using the same automated pipeline to fulfill the 6 cards needed for the carousel.)*

## Implementation
We will use a programmatic approach (e.g., a short Python/Pillow or Node/Sharp script) to automate the compositing. This ensures pixel-perfect consistency across all matching assets and allows us to easily run it on any future assets.
