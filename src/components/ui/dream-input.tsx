import React, { KeyboardEvent, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface DreamInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export function DreamInput({
  value,
  onChange,
  onSubmit,
  placeholder = "What are we building together?",
  className = ""
}: DreamInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit();
    }
  };

  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }

        @property --gradient-shine {
          syntax: "<color>";
          initial-value: white;
          inherits: false;
        }

        .shiny-input-container {
          --shiny-cta-bg: #000000;
          --shiny-cta-bg-subtle: #1a1818;
          --shiny-cta-fg: #ffffff;
          --shiny-cta-highlight: #F5A623; /* Brand Amber */
          --shiny-cta-highlight-subtle: #FDE68A; /* Lighter Amber for shine */
          --animation: gradient-angle linear infinite;
          --duration: 3s;
          --shadow-size: 2px;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          
          isolation: isolate;
          position: relative;
          overflow: hidden;
          padding: 0.5rem;
          border-radius: 360px;
          background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle), 0 10px 40px -10px rgba(0,0,0,0.5);
          transition: var(--transition);
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, filter, transform;
        }

        .shiny-input-container::before,
        .shiny-input-container::after {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        /* Dots pattern */
        .shiny-input-container::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            white calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(
            from calc(var(--gradient-angle) + 45deg),
            black,
            transparent 10% 90%,
            black
          );
          border-radius: inherit;
          opacity: 0.2; /* Subtler than button */
          z-index: -1;
        }

        /* Inner shimmer */
        .shiny-input-container::after {
          --animation: shimmer linear infinite;
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(
            -50deg,
            transparent,
            var(--shiny-cta-highlight),
            transparent
          );
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.3; /* Subtler than button */
        }

        /* Focus states applied via container hover for consistency, 
           plus active focus-within from Tailwind classes below */
        
        /* Animate */
        .shiny-input-container,
        .shiny-input-container::before,
        .shiny-input-container::after {
          animation: var(--animation) var(--duration),
            var(--animation) calc(var(--duration) / 0.4) reverse paused;
          animation-composition: add;
        }

        .shiny-input-container:is(:hover, :focus-within) {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
          transform: translateY(-2px);
        }

        .shiny-input-container:is(:hover, :focus-within),
        .shiny-input-container:is(:hover, :focus-within)::before,
        .shiny-input-container:is(:hover, :focus-within)::after {
          animation-play-state: running;
        }

        @keyframes gradient-angle {
          to {
            --gradient-angle: 360deg;
          }
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }
      `}</style>

      <div
        className={`shiny-input-container flex flex-row items-center w-full min-w-[300px] border border-transparent shadow-2xl backdrop-blur-md group ${className}`}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          id="dream-intent-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 font-body type-functional text-lg md:text-xl py-3 px-6 lg:py-4 lg:px-8 outline-none focus:outline-none focus:ring-0 active:outline-none w-full"
          autoComplete="off"
          autoFocus
        />
        <button
          onClick={() => value.trim() && onSubmit()}
          disabled={!value.trim()}
          className="mr-2 lg:mr-3 p-3 lg:p-4 rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:bg-zinc-800"
          aria-label="Submit dream intent"
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </>
  );
}
