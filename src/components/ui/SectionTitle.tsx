import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      {/* Top editorial line — cap-height guide */}
      <div 
        className="absolute left-0 right-0 h-px -top-3"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.07) 70%, transparent 100%)'
        }}
        aria-hidden="true"
      />
      
      {/* Section title */}
      <span className="heading-section text-muted-foreground">
        {children}
      </span>
      
      {/* Bottom editorial line — baseline guide */}
      <div 
        className="absolute left-0 right-0 h-px -bottom-3"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
