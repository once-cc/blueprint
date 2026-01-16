/**
 * ColumnBackdrop - Editorial backdrop plate for column-width containers
 * Designed for sticky navigation columns to sit above background video
 * Matches ApproachBackdrop visual treatment with edge fades
 * 
 * Memoized for performance - props rarely change
 */

import React, { memo } from "react";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";

interface ColumnBackdropProps {
  className?: string;
}

export const ColumnBackdrop = memo(function ColumnBackdrop({ className = "" }: ColumnBackdropProps) {
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        // GPU acceleration
        contain: 'strict',
        willChange: 'auto'
      }}
    >
      {/* Solid background plate - uses sidebar color token */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'hsl(var(--sidebar-background))'
        }}
      />
      
      {/* Subtle vignette + texture combined into single layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%),
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />
      
      {/* Editorial grid overlay - vertical lines only for column context */}
      <EditorialGridLines 
        showHorizontalTop={false}
        showHorizontalCenter={false}
        showHorizontalBottom={false}
      />
      
      {/* Top edge fade - blends into video above */}
      <div 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />
      
      {/* Bottom edge fade - blends into video below */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />
    </div>
  );
});
