# Blueprint PDF Redesign - Design Document

## 1. Context & Objective
The existing PDF generator outputs a document that feels detached from the Cleland Studio brand identity. The goal is to overhaul this programmatic PDF to align perfectly with the "museum-grade", architectural aesthetics rather than software dashboard exports.

*Update (March 7, v6): Massive strategic pivot. We are stripping away the heavy architectural drafting grids and left-rail systems. The document must not feel like a "design-theatrical report." Instead, it will be a clean, studio-professional white paper. It will carry quiet authority through extreme restraint, severe typographic contrast, and pure whitespace.*

## 2. Brand Identity Audit (Quiet Authority / Studio Artifact)
- **Core Aesthetic**: Premium Strategic Consulting Dossier, Minimalist White Paper, Studio Artifact.
- **Color Tokens**: 
  - Background Paper: `#fcfcfc` (Clean, crisp white)
  - Primary Text: `#111111` (Deep charcoal, highest contrast)
  - Secondary Text: `#888888` (Lighter grey for metadata and labels)
  - Structural Lines: `#e5e5e5` (Incredibly faint dividers)
- **Visual Tropes**: Absence of design gimmicks. Deep, intentional whitespace. Severe typographic contrast separating quiet labels from loud data. 

## 3. Recommended Approach (Design Choices)
We are rebuilding the layout logic using `jspdf` to emphasize pure reading rhythm:

### A. The Complete Elimination of Grids
- The background is pure `#fcfcfc`.
- **NO blueprint grids. NO crosshairs. NO left rail. NO watermarks.** 
- The document relies entirely on alignment, spacing, and typography to structure the page.

### B. Single-Column Editorial Rhythm
All content flows in a constrained, rhythmic single column centered on the page.
- **Act Headers**: Appear only once per page (e.g., `ACT I — Discovery`) in large Times Italic, driving the narrative.
- **System Dividers**: Beneath the Act header, systems flow naturally. Each system (`[ SYS.01 ]`) is separated by an extremely light, minimal horizontal divider (`#e5e5e5`).
- **Typographic Contrast**: 
  - Labels are `Helvetica Normal, Size 8, Tracked Out` in light grey. They whisper.
  - Values are `Times Roman, Size 14` in deep charcoal. They speak loudly.
- **Vertical Spacing**: Identical spacing is banned. There is tight spacing between Label and Value, but significant, generous whitespace between entirely distinct data modules to create breathing room.

### C. Rebuilt Cover Page (The Artifact)
The cover page no longer feels like a software export. It is an artifact.
1. **Subheading**: `CRAFTED BLUEPRINT` (Helvetica, Size 16, heavily tracked out).
2. **Hero Title**: Massive `Times Italic` (Size 44) text holding the `{Business Name}`, acting as the primary layout framing element.
3. **Descriptor**: `Architectural Strategy Document` (Helvetica, small).
4. **Metadata Blocks**: Dropped deep down the page in a clean, stacked layout (`PREPARED FOR` -> `Client Name`).

### D. Next Action / CTA Strategy: The "Magic Link" Booking
The final page contains a clean, restrained structural box dedicated to initiating the execution phase.
**Visual Layout:**
- Very simple text framing the intent: `INITIATE EXECUTION PHASE`.
- A clean, un-filled button outline: `REQUEST STRATEGY SESSION`. 

**The Magic Link Routing (Engineering Strategy):**
The button acts as a hyperlink pointing to a unique routing URL: `https://cleland.studio/strategy?id=[blueprint_id]`. This executes the zero-friction tracking and pre-filled Calendly routing described in previous iterations, ensuring the user experience matches the high-end restraint of the document.

## 4. Implementation Strategy
1. Strip all `drawBaseArchitecture` rail and grid logic from the PDF generation script.
2. Refactor `editorialSection` to stack vertically rather than forcing a 12-column split, applying the new severe typographic contrast (`Helvetica 8` vs `Times 14`).
3. Replace the chip/tag logic with clean, bulleted inline text (e.g., `Brand Authority • Education`) to remove unnecessary bounding boxes.

## 5. Mockup / Artifact
A dummy PDF script (`scripts/generate_current_pdf.ts`) has been run to generate `example_blueprint.pdf` showcasing this quiet, authoritative layout.
