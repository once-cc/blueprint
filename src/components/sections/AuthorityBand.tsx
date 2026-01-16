import React, { useRef, useState } from "react";
import { motion, useInView, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/utils";
import { SiFigma, SiNextdotjs, SiReact, SiTailwindcss, SiSupabase } from "@icons-pack/react-simple-icons";

// Inline SVG component for Relume isometric cube
function RelumeIcon({ size = 27, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Left face - darkest */}
      <path
        d="M2 16.5L12 22L12 11L2 5.5V16.5Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
      {/* Right face - medium */}
      <path
        d="M22 16.5L12 22L12 11L22 5.5V16.5Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      {/* Top face - lightest */}
      <path
        d="M2 5.5L12 11L22 5.5L12 0L2 5.5Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
}

// Inline SVG for Midjourney logo (boat/sailboat icon)
function MidjourneyIcon({ size = 27, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L8 10h8L12 2zM4 12c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" />
    </svg>
  );
}

// Inline SVG for Lovable logo (heart icon)
function LovableIcon({ size = 27, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// Tools & platforms used by Cleland Studio with client-focused descriptions
const tools = [
  {
    name: "Figma",
    icon: SiFigma,
    description: "Precision design & collaborative prototyping"
  },
  {
    name: "Relume",
    svg: RelumeIcon,
    description: "Rapid wireframing for faster project delivery"
  },
  {
    name: "Next.js",
    icon: SiNextdotjs,
    description: "High-performance web applications"
  },
  {
    name: "React",
    icon: SiReact,
    description: "Scalable, component-driven interfaces"
  },
  {
    name: "Tailwind CSS",
    icon: SiTailwindcss,
    description: "Consistent, maintainable styling systems"
  },
  {
    name: "Supabase",
    icon: SiSupabase,
    description: "Secure backend & real-time data"
  },
  {
    name: "Midjourney",
    svg: MidjourneyIcon,
    description: "AI-powered visual exploration"
  },
  {
    name: "Lovable",
    svg: LovableIcon,
    description: "Accelerated development workflows"
  },
];

function ToolItem({ tool }: { tool: typeof tools[number] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group flex flex-col items-center cursor-default min-w-[140px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - transitions from muted monochrome to brand color on hover */}
      <div className="relative transition-transform duration-500" style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {tool.icon ? (
          <tool.icon
            size={27}
            color={isHovered ? "default" : "#6b7280"}
            className="transition-all duration-500"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        ) : tool.svg ? (
          <tool.svg
            size={27}
            className={cn(
              "transition-colors duration-500",
              isHovered ? "text-foreground" : "text-muted-foreground/40"
            )}
          />
        ) : null}
      </div>

      {/* Info container - compresses downward smoothly with wash effect */}
      <div
        className="overflow-hidden max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="pt-3 text-center">
          {/* Tool name with wash effect */}
          <p
            className="text-[11px] font-medium tracking-wide uppercase relative overflow-hidden
                       text-muted-foreground/50 group-hover:text-foreground
                       scale-100 group-hover:scale-[1.03]
                       transition-all duration-700"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '50ms' }}
          >
            <span className="relative z-10">{tool.name}</span>
            {/* Wash overlay that sweeps left to right */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent
                         translate-x-[-100%] group-hover:translate-x-[100%]
                         transition-transform duration-700"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '100ms' }}
            />
          </p>

          {/* Description with wash + brighten effect */}
          <p
            className="text-[10px] mt-1 max-w-[200px] leading-tight relative overflow-hidden
                       text-muted-foreground/30 group-hover:text-muted-foreground/80
                       scale-100 group-hover:scale-[1.02]
                       transition-all duration-700"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '100ms' }}
          >
            <span className="relative z-10">{tool.description}</span>
            {/* Wash overlay for description */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent
                         translate-x-[-100%] group-hover:translate-x-[100%]
                         transition-transform duration-700"
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '150ms' }}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

interface AuthorityBandProps {
  sharedProgress: MotionValue<number>;
}

export function AuthorityBand({ sharedProgress }: AuthorityBandProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll-driven entrance - band fades in as hero exits
  // ─────────────────────────────────────────────────────────────────────────
  const bandOpacity = useTransform(sharedProgress, [0.35, 0.50], [0, 1]);
  const bandY = useTransform(sharedProgress, [0.35, 0.50], [30, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative z-50 -mt-[100vh] py-12 md:py-16 border-y border-border/30 overflow-hidden bg-background"
    >
      {/* TOP SEAM — fades upward into hero (covering effect) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 h-[96px] md:h-[120px] z-[1] animate-seam-breathe"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 100%)',
          filter: 'blur(8px)',
        }}
      />
      {/* Gradient seam - blends Hero into this section */}
      <div
        className="absolute inset-x-0 top-0 h-32 md:h-40 lg:h-48 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)'
        }}
      />
      <div className="grain-overlay opacity-[0.02]" />

      {/* Infinite marquee */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          opacity: bandOpacity,
          y: bandY,
        }}
      >
        {/* Left edge fade gradient + blur overlay */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 md:w-32 lg:w-40 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.8) 30%, transparent 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            maskImage: 'linear-gradient(to right, black 0%, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 50%, transparent 100%)'
          }}
        />

        {/* Right edge fade gradient + blur overlay */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 md:w-32 lg:w-40 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to left, hsl(var(--background)) 0%, hsl(var(--background) / 0.8) 30%, transparent 100%)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            maskImage: 'linear-gradient(to left, black 0%, black 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 0%, black 50%, transparent 100%)'
          }}
        />

        <div className="marquee-container overflow-hidden">
          <div className={cn("marquee-track flex items-center whitespace-nowrap", isNavigatingLocal && "carousel-paused")}>
            {/* First set */}
            {tools.map((tool, index) => (
              <React.Fragment key={`a-${index}`}>
                <div className="px-4 md:px-6 flex items-center justify-center">
                  <ToolItem tool={tool} />
                </div>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/20 flex-shrink-0" />
              </React.Fragment>
            ))}
            {/* Second set for seamless loop */}
            {tools.map((tool, index) => (
              <React.Fragment key={`b-${index}`}>
                <div className="px-4 md:px-6 flex items-center justify-center">
                  <ToolItem tool={tool} />
                </div>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/20 flex-shrink-0" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
