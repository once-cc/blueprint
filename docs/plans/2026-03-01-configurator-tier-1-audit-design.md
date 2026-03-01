# Blueprint Configurator - Comprehensive Tier-1 Audit Design

## Goal
To optimize the `BlueprintConfigurator` to be as lightweight as possible for developers to navigate, while achieving premium 60FPS cinematic performance and rapid load times for end users.

## 1. Dead Code Elimination & Pruning
- **Audit Steps**: Ensure all current components imported in `BlueprintConfigurator.tsx` represent the active steps.
- **Identify Orphans**: Delete unused steps such as `ColourImageryStep.tsx` if it's completely deprecated.
- **Clean Imports**: Remove unused Framer Motion imports, icons, or unused hooks inside existing TSX files.

## 2. Component De-duplication (Primitives Strategy)
- **Problem**: 20+ different cards across 10 steps repeat identical Tailwind class strings (`cfg-surface border bg-card/80 backdrop-blur-sm transition-all duration-[220ms] ease-out hover:border-border hover:bg-card/90`).
- **Solution**: Create a `ConfiguratorCardSurface.tsx` primitive component. Or expand existing primitives. Ensure consistent usage of the "frosted solid" aesthetic we implemented on the references page.

## 3. Asynchronous Lazy Loading
- **Problem**: Act 1, 2, and 3 steps are all statically imported in the configurator, bloating the initial JS chunk payload.
- **Solution**:
  - Dynamically import (`React.lazy()`) steps starting from Act II (Step 4 onwards). 
  - Add a lightweight `<Suspense>` fallback or keep the current router structure intact while chunking the files so the network prioritizes Act I files.
  - *Trade-off*: A subtle fetch delay when un-suspending a chunk. We will leverage hover- prefetching or invisible mounting if necessary, though typical Vite code-splitting is fast enough.

## 4. Render Optimization (Jank Prevention)
- **Problem**: The overarching `useBlueprint` context drives all data. Heavy sliders or deeply nested grids recompute too frequently.
- **Solution**: 
  - Instrument `React.memo` for visually intensive layers like `LayerProgress.tsx`, the `VoiceAxisSlider`, and the Reference grid items.
  - Apply `useMemo` and `useCallback` inside step components to ensure prop equality prevents unnecessary reconciliation.
