import React, { memo } from "react";

interface EditorialGridLinesProps {
  showHorizontalTop?: boolean;
  showHorizontalCenter?: boolean;
  showHorizontalBottom?: boolean;
  horizontalTopPosition?: string;
  horizontalCenterPosition?: string;
  horizontalBottomPosition?: string;
}

// Memoized to prevent re-renders - this component is purely visual and static
export const EditorialGridLines = memo(function EditorialGridLines({
  showHorizontalTop = false,
  showHorizontalCenter = false,
  showHorizontalBottom = false,
  horizontalTopPosition = "15%",
  horizontalCenterPosition = "50%",
  horizontalBottomPosition = "85%",
}: EditorialGridLinesProps) {
  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ 
        // GPU acceleration hints
        willChange: 'auto',
        transform: 'translateZ(0)',
        contain: 'strict'
      }}
    >
      {/* ===== MOBILE (< 640px): 3 vertical lines ===== */}
      {/* Mobile: Left gutter */}
      <div 
        className="block sm:hidden absolute top-0 bottom-0 w-px"
        style={{
          left: '16px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.025) 20%, rgba(255,255,255,0.025) 80%, transparent 100%)'
        }}
      />
      {/* Mobile: Center */}
      <div 
        className="block sm:hidden absolute top-0 bottom-0 w-px"
        style={{
          left: '50%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 15%, rgba(255,255,255,0.03) 85%, transparent 100%)'
        }}
      />
      {/* Mobile: Right gutter */}
      <div 
        className="block sm:hidden absolute top-0 bottom-0 w-px"
        style={{
          right: '16px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.025) 20%, rgba(255,255,255,0.025) 80%, transparent 100%)'
        }}
      />

      {/* ===== TABLET (640px - 1023px): 4 vertical lines ===== */}
      {/* Tablet: Left column edge */}
      <div 
        className="hidden sm:block lg:hidden absolute top-0 bottom-0 w-px"
        style={{
          left: 'calc(25% - 12px)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 15%, rgba(255,255,255,0.03) 85%, transparent 100%)'
        }}
      />
      {/* Tablet: Center */}
      <div 
        className="hidden sm:block lg:hidden absolute top-0 bottom-0 w-px"
        style={{
          left: '50%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.035) 15%, rgba(255,255,255,0.035) 85%, transparent 100%)'
        }}
      />
      {/* Tablet: Right column edge */}
      <div 
        className="hidden sm:block lg:hidden absolute top-0 bottom-0 w-px"
        style={{
          left: 'calc(75% + 12px)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 15%, rgba(255,255,255,0.03) 85%, transparent 100%)'
        }}
      />

      {/* ===== DESKTOP (≥ 1024px): 3 vertical lines ===== */}
      {/* Desktop: Left column edge (Col 1 boundary) */}
      <div 
        className="hidden lg:block absolute top-0 bottom-0 w-px"
        style={{
          left: 'calc(8.33% + 24px)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.04) 85%, transparent 100%)'
        }}
      />
      {/* Desktop: Center (Col 6 boundary) */}
      <div 
        className="hidden lg:block absolute top-0 bottom-0 w-px"
        style={{
          left: '50%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.035) 20%, rgba(255,255,255,0.035) 80%, transparent 100%)'
        }}
      />
      {/* Desktop: Right column edge (Col 12 boundary) */}
      <div 
        className="hidden xl:block absolute top-0 bottom-0 w-px"
        style={{
          right: 'calc(8.33% + 24px)',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 75%, transparent 100%)'
        }}
      />
      
      {/* ===== HORIZONTAL LINES (all breakpoints) ===== */}
      {/* Horizontal: Top position */}
      {showHorizontalTop && (
        <div 
          className="absolute left-0 right-0 h-px"
          style={{
            top: horizontalTopPosition,
            background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent 100%)'
          }}
        />
      )}
      
      {/* Horizontal: Center position */}
      {showHorizontalCenter && (
        <div 
          className="absolute left-0 right-0 h-px"
          style={{
            top: horizontalCenterPosition,
            background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent 100%)'
          }}
        />
      )}
      
      {/* Horizontal: Bottom position */}
      {showHorizontalBottom && (
        <div 
          className="absolute left-0 right-0 h-px"
          style={{
            top: horizontalBottomPosition,
            background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent 100%)'
          }}
        />
      )}
    </div>
  );
});
