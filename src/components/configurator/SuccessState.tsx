import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Phone, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Crosshair } from '@/components/ui/crosshair';
import { AnimatedButtonIcon } from '@/components/ui/AnimatedButtonIcon';
import paperplaneAnimation from '@/assets/ui/1paperplane.json';
import { useRayPause } from '@/hooks/useRayPause';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Blueprint } from '@/types/blueprint';

// ── Types ──────────────────────────────────────────────────────

interface SuccessStateProps {
  blueprintId?: string;
  blueprint?: Blueprint | null;
  scores?: { integrity: number; complexity: number; tier?: string } | null;
  deliver?: Record<string, unknown> | null;
}

// ── Animated Gold Seal ─────────────────────────────────────────

function GoldSeal() {
  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52">
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,83,0.25) 0%, rgba(212,168,83,0) 70%)',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shimmer particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const radius = 55 + (i % 3) * 10;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#d4a853]"
            style={{
              top: `${50 + Math.sin(angle) * radius * 100 / 208}%`,
              left: `${50 + Math.cos(angle) * radius * 100 / 208}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0] }}
            transition={{
              delay: i * 0.25,
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* SVG seal */}
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <motion.circle
          cx="60" cy="60" r="50"
          stroke="#d4a853" strokeWidth="2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx="60" cy="60" r="44"
          stroke="#d4a853" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity={0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
        />
        <motion.path
          d="M40 60 L54 74 L80 48"
          stroke="#d4a853" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
        />
      </svg>

      {/* Rotating outer glow ring */}
      <motion.div
        className="absolute inset-[-8px] rounded-full border border-[#d4a853]/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(212,168,83,0.08) 25%, transparent 50%, rgba(212,168,83,0.05) 75%, transparent 100%)',
        }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function SuccessState({ blueprintId, blueprint }: SuccessStateProps) {
  const { toast } = useToast();
  const raysRef = useRayPause<HTMLDivElement>();
  const [callRequested, setCallRequested] = useState(false);
  const [isCtaHovered, setIsCtaHovered] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const nextStepsRef = useRef<HTMLDivElement>(null);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Smooth scroll to "What happens next"
  const scrollToNextSteps = useCallback(() => {
    nextStepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // PDF download handler
  const handleDownloadPdf = useCallback(async () => {
    if (!blueprint) {
      toast({
        title: 'PDF not ready',
        description: 'Blueprint data is still loading. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    try {
      // Lazy load the PDF generator to reduce initial bundle size
      const { generateBlueprintPdf } = await import('@/lib/generateBlueprintPdf');
      generateBlueprintPdf(blueprint);

      toast({
        title: 'PDF downloaded',
        description: 'Your Blueprint PDF has been saved to your device.',
        className: 'bg-background/80 backdrop-blur-xl border border-[#d4a853]/20 shadow-2xl shadow-black/40',
        titleClassName: 'font-nohemi font-medium tracking-wide text-white text-sm uppercase',
        descriptionClassName: 'font-body text-muted-foreground mt-1.5'
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        title: 'PDF generation failed',
        description: 'Please try again or contact us at crafted@cleland.studio',
        variant: 'destructive',
      });
    }
    // Auto-scroll to next steps after download
    setTimeout(() => scrollToNextSteps(), 800);
  }, [blueprint, toast, scrollToNextSteps]);

  // One-click "Request Clarity Call"
  const handleRequestCall = useCallback(async () => {
    if (!blueprintId || callRequested) return;

    setIsRequesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-clarity-call', {
        body: { blueprint_id: blueprintId },
      });

      if (error || !data?.success) {
        toast({
          title: 'Something went wrong',
          description: 'Please try again or email us directly at crafted@cleland.studio',
          variant: 'destructive',
        });
        setIsRequesting(false);
        return;
      }

      setCallRequested(true);
      toast({
        title: 'Request received',
        description: "We'll be in touch within 24 hours.",
      });
    } catch {
      toast({
        title: 'Connection error',
        description: 'Please check your internet and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  }, [blueprintId, callRequested, toast]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* ═══════════════════════════════════════════════════════
          GLOBAL ATMOSPHERIC LAYERS
          ═══════════════════════════════════════════════════════ */}

      {/* Editorial Grid Substrate */}
      <div className="fixed inset-0 bg-editorial-grid pointer-events-none z-0" />

      {/* Animated Gradient Background */}
      <div className="animated-gradient-bg" aria-hidden="true" />

      {/* Volumetric Light Rays — performance-paused when off screen */}
      <div ref={raysRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[150%] bg-gradient-to-l from-transparent via-white/10 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner-reverse" />
        <div className="absolute top-[-20%] right-[10%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-700" />
      </div>

      {/* Fixed Docking Rails with Crosshairs */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-10 hidden sm:flex">
        <div className="relative h-full w-full max-w-screen-2xl">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-white/5" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-white/5" />

          <Crosshair className="absolute top-4 -left-[8.5px] text-white/40" />
          <Crosshair className="absolute top-4 -right-[8.5px] text-white/40" />
          <Crosshair className="absolute bottom-4 -left-[8.5px] text-white/40" />
          <Crosshair className="absolute bottom-4 -right-[8.5px] text-white/40" />
        </div>
      </div>

      {/* Film Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[2] opacity-[0.12] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — Hero (full viewport)
          ═══════════════════════════════════════════════════════ */}
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-hidden z-10">
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.06) 0%, transparent 60%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center relative z-10 max-w-xl"
        >
          {/* Gold Seal */}
          <div className="mb-10 md:mb-14">
            <GoldSeal />
          </div>

          <span className="font-nohemi font-medium type-structural-bold tracking-widest text-accent text-[10px] md:text-xs mb-4 uppercase">
            STRATEGIC BLUEPRINT
          </span>

          {/* Headline */}
          <h1 className="font-nohemi font-medium text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight leading-[1.15] pb-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block">
              Your Blueprint is
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block">
              <em className="italic font-medium">Crafted</em>.
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="font-body type-functional-light text-muted-foreground text-lg max-w-xl mb-3">
            Your strategic blueprint is complete—mapping the digital architecture required for your next phase of growth.
          </p>
          <p className="font-body type-functional-light text-muted-foreground text-base max-w-xl mb-8">
            The PDF artifact has been dispatched to your email.
          </p>

          {/* PDF Download Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDownloadPdf}
              className="relative overflow-hidden group gap-2.5 text-sm px-8 py-6 border-[#d4a853]/30 bg-background/40 backdrop-blur-md hover:border-[#d4a853]/60 hover:bg-[#d4a853]/10 hover:shadow-[0_0_20px_rgba(212,168,83,0.15)] text-foreground hover:text-white transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-out z-0 pointer-events-none" />
              <Download className="w-5 h-5 text-[#d4a853] relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="relative z-10 font-medium tracking-wide">Open Your Blueprint</span>
            </Button>
          </motion.div>

          {/* 48-Hour Priority Window */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2.5 mt-10 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5"
          >
            <Shield className="w-4 h-4 text-[#d4a853]/60 flex-shrink-0" />
            <p className="text-sm text-muted-foreground/80">
              Our studio will evaluate your blueprint within{' '}
              <span className="text-foreground/90 font-medium">24 hours</span>.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Editorial Slit Scroll Indicator ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 1.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 sm:h-32 w-px origin-bottom z-0 cursor-pointer overflow-hidden flex flex-col items-center"
          onClick={scrollToNextSteps}
        >
          {/* Base track */}
          <div className="absolute inset-0 bg-white/10" />

          {/* Animated pulse traveling down the slit */}
          <motion.div
            className="w-full h-1/2 bg-gradient-to-b from-transparent via-accent to-transparent"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — What Happens Next + CTA
          ═══════════════════════════════════════════════════════ */}
      <div
        ref={nextStepsRef}
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 md:py-28 relative z-10"
      >
        {/* Big bold heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-4xl lg:text-5xl font-nohemi font-medium tracking-tight text-center mb-16 md:mb-20 pb-1"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block">
            What Happens <em className="italic font-medium pr-4">Next</em>
          </span>
        </motion.h2>

        {/* Steps */}
        <div className="w-full max-w-md space-y-8 mb-16 md:mb-20">
          {[
            {
              step: '01',
              title: 'Review',
              description: 'Our team reviews your blueprint and its strategic signals within the next 24 hours.',
            },
            {
              step: '02',
              title: 'Introduction',
              description: "We'll reach out briefly to introduce ourselves and see whether a deeper strategy conversation would be valuable.",
            },
            {
              step: '03',
              title: 'Walkthrough',
              description: 'If aligned, we’ll host a Clarity Call to walk through your blueprint and prioritize next steps.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[#d4a853]/20 bg-[#d4a853]/5 flex items-center justify-center">
                <span className="text-xs font-mono font-semibold text-[#d4a853]/80">{item.step}</span>
              </div>
              <div>
                <h3 className="text-base font-nohemi font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Primary CTA — Request Clarity Call ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {!callRequested ? (
            <div className="flex flex-col items-center space-y-4">
              <ShinyButton
                onClick={handleRequestCall}
                disabled={isRequesting}
                onMouseEnter={() => setIsCtaHovered(true)}
                onMouseLeave={() => setIsCtaHovered(false)}
                className="flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] text-lg shadow-2xl shadow-accent/20"
              >
                {isRequesting ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    Request a Clarity Call
                    <AnimatedButtonIcon
                      animationData={paperplaneAnimation}
                      isActive={isCtaHovered}
                      staticFrame={90}
                      playOnVisible={true}
                      playVisibleDelay={1250}
                      className="w-7 h-7 ml-1"
                    />
                  </span>
                )}
              </ShinyButton>

              <p className="text-xs text-muted-foreground/50 text-center">
                No obligation · We'll respond within 24 hours
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Request received</p>
              <p className="text-xs text-muted-foreground">
                We'll respond within 24 hours to schedule your clarity call.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
