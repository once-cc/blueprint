import React, { memo } from "react";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";

// Memoized - purely visual backdrop with no dynamic props
export const ApproachBackdrop = memo(function ApproachBackdrop() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{
        // GPU acceleration
        contain: 'strict',
        willChange: 'transform'
      }}
    >
      {/* Solid background plate - uses sidebar color token */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'hsl(var(--sidebar-background))'
        }}
      />

      {/* Subtle vignette for depth - combined with texture layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%),
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Editorial grid overlay - very subtle blueprint texture */}
      <EditorialGridLines
        showHorizontalTop={true}
        showHorizontalCenter={true}
        showHorizontalBottom={true}
        horizontalTopPosition="20%"
        horizontalCenterPosition="50%"
        horizontalBottomPosition="80%"
      />

      {/* Top edge fade - blends into video above */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />

      {/* Bottom edge fade - blends into video below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />
    </div>
  );
});
