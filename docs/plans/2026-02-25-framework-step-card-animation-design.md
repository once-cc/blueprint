# Design: Framework Step Card Animation Refinement

## 1. Goal
Refine the exit animation of the framework step cards (`FrameworkSection.tsx`) so that they descend ("sink" scaled down) into the background when covered by the subsequent card, minimizing upward translation while keeping a subtle upward movement towards the very end of the scroll exit curve.

## 2. Current Implementation
*   **Scale:** `1` -> `0.85`
*   **Opacity:** `1` -> `0` (mostly fades out before the end)
*   **RotateX:** `0deg` -> `8deg`
*   **Y-Translation:** `0vh` -> `30vh` (slides *downward* as it exits)

## 3. Proposed Changes

We will modify the Framer Motion `useTransform` hooks for the `descendProgress` in the `DesktopStackCard` component.

### Approach Details
1.  **Remove Downward Slide:** Change the `groupY` mapping so it no longer translates down `30vh`.
2.  **Stationary Sink -> Subtle Upward Y:** We will use a 3-step interpolation curve for `groupY`.
    *   `[0, 0.6, 1]`: For the first 60% of the exit progress, the card stays locked at `0vh` (Stationary Sink).
    *   `[0vh, 0vh, -10vh]`: For the final 40%, it gently floats upward (`-10vh`) as it disappears.
3.  **Refine Opacity:** Ensure the card fades to black (`0`) smoothly as the scale drops, ideally reaching `0` before the upward float becomes too pronounced.
4.  **RotateX:** Keep or slightly reduce the `rotateX` (e.g., `5deg`) for a subtle 3D hinge effect.

### Mappings Summary
*   `groupScale`: `[1, 0.85]`
*   `groupOpacity`: `[1, 0, 0]` (fades out by 80% progress)
*   `groupY`: `["0vh", "0vh", "-10vh"]` (mapped to `[0, 0.6, 1]`)
*   `groupRotateX`: `["0deg", "5deg"]`

## 4. Verification
1.  Implement changes in `src/components/marketing/FrameworkSection.tsx`.
2.  Run dev server and scroll through the framework cards on Desktop.
3.  Verify the card pinning and the new "sink then float" exit motion.
4.  Verify no regressions on Mobile (since this is mostly modifying the desktop variant).
