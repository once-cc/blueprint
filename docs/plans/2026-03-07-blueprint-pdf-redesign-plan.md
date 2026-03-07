# Blueprint PDF Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the programmatic PDF generator to align perfectly with the "Executive Editorial & Cinematic Dark Mode" brand identity and precisely output the newly constrained Hero Copy Structure.

**Architecture:** We will replace the generic Helvetica lines in `jspdf` with an architectural grid system layout, 2-column data grids, editorial/serif typographic headers, courier monospace labels, and a highly polished command-prompt CTA box for next steps.

**Tech Stack:** TypeScript, jsPDF

---

### Task 1: Overhaul PDF Architecture & Brand Foundations

**Files:**
- Modify: `src/lib/generateBlueprintPdf.ts`

**Step 1: Set Brand Constants & Layout Primitives**
Update the file to include the correct color configurations matching the Tailwind theme (`#0a0a0f`, `#d4a853`, `#111827` gridlines). Set margins and global page width/height variables.

**Step 2: Implement Architectural Grid Background**
Create `drawGridBackground()` that paints a 10x10mm structural grid, adds technical crosshairs to the corners, and places a persistent header/footer tag (`[ CS // BLUEPRINT COMPILER ]`).

**Step 3: Build Top-Level Typographic Systems**
Add modular layout functions: 
- `chapterHeading` (Times Italic style, size 24)
- `sectionMonoHeader` (Courier Bold string, size 8)
- `dataGrid` (2 columns that span `CONTENT_WIDTH / 2`)
- `tagsListGrid` (Rounded hollow boxes for lists of strings)

### Task 2: Implement Cover Page (Hero Copy Structure)

**Files:**
- Modify: `src/lib/generateBlueprintPdf.ts`

**Step 1: Apply The Specific Hero Copy Lines**
Update the Page 1 builder to use the exact specified text strings:
1. Eyebrow: `CLELAND STUDIOS — CRAFTED BLUEPRINT // Generated [Date]`
2. Primary Headline: `{Business Name}`
3. Secondary Line: `Prepared for {First Name} {Last Name}`
4. Micro Line: `Architectural strategy document. Confidential.`

**Step 2: Add Data Grid for Metadata**
Beneath the Hero text, incorporate a clean data grid layout to show Generation Date, Security Classification, and Author details.

### Task 3: Migrate Blueprint Content to New Layout

**Files:**
- Modify: `src/lib/generateBlueprintPdf.ts`

**Step 1: Convert Discovery (Act I)**
Replace all simple `doc.text()` mappings for Site Topic, Purposes, Brand Voice Tone/Energy, and CTA elements with `dataGrid` and `tagsListGrid`.

**Step 2: Convert Design (Act II)**
Map Typography, Color Relationships, and Visual Aesthetics. For the Generated Color Swatches, rebuild them as squared-off bounding boxes (not rounded) to look more technical.

**Step 3: Convert Delivery (Act III)**
Map Functional Scope, Timeline, and Creativity Risk elements.

### Task 4: Command-Prompt CTA 

**Files:**
- Modify: `src/lib/generateBlueprintPdf.ts`

**Step 1: Render Next Steps Block**
On the final page, draw a large black box with a gold outline. Render the following text inside:
- Headline: "Next Protocol: Architectural Analysis"
- Body: "Your strategic parameters have been catalogued and locked. To move forward with implementation, schedule a Private Strategy Session sequence below. We'll unpack this model step-by-step and map the exact mechanics of execution."
- Footer Label (Mono): "STATUS: PENDING ARCHITECT REVIEW // AWAITING BRIEFING"

### Task 5: Verify Changes (Run Dummy PDF Example)

**Files:**
- Create: `scripts/generate_current_pdf.ts` (test script)

**Step 1: Provide Mock Data**
Load dummy data matching the `Blueprint` types into the script.

**Step 2: Run PDF Generation & Output**
Execute `npx tsx scripts/generate_current_pdf.ts`, generate `example_blueprint.pdf`. Check the result to verify it fulfills all structural requirements.
