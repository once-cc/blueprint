import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Phone, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateBlueprintPdf } from '@/lib/generateBlueprintPdf';
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
  const [callRequested, setCallRequested] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const nextStepsRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to "What happens next"
  const scrollToNextSteps = useCallback(() => {
    nextStepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // PDF download handler
  const handleDownloadPdf = useCallback(() => {
    if (!blueprint) {
      toast({
        title: 'PDF not ready',
        description: 'Blueprint data is still loading. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    try {
      generateBlueprintPdf(blueprint);
      toast({
        title: 'PDF downloaded',
        description: 'Your Blueprint PDF has been saved to your device.',
      });
    } catch {
      toast({
        title: 'PDF generation failed',
        description: 'Please try again or contact us at blueprints@cleland.studio',
        variant: 'destructive',
      });
    }
    // Auto-scroll to next steps after download
    setTimeout(() => scrollToNextSteps(), 800);
  }, [blueprint, toast, scrollToNextSteps]);

  // One-click "Request Strategy Call"
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
          description: 'Please try again or email us directly at blueprints@cleland.studio',
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
    <div className="relative">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — Hero (full viewport)
          ═══════════════════════════════════════════════════════ */}
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
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

          <span className="font-display type-structural-bold tracking-widest text-accent text-[10px] md:text-xs mb-4 uppercase">
            BLUEPRINT GENERATED
          </span>

          {/* Headline */}
          <h1 className="heading-editorial text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight leading-[1.15]">
            Your Roadmap is <em className="italic font-medium">Crafted</em>.
          </h1>

          {/* Sub-copy */}
          <p className="font-body type-functional-light text-muted-foreground text-lg max-w-xl mb-8">
            We've received your Blueprint. A confirmation receipt + PDF has been sent to your email.
          </p>

          {/* PDF Download Button */}
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownloadPdf}
            className="gap-2.5 text-sm px-8 py-5 border-[#d4a853]/30 hover:border-[#d4a853]/50 hover:bg-[#d4a853]/5 text-foreground cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#d4a853]" />
            Download Blueprint PDF
          </Button>

          {/* 48-Hour Priority Window */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-2.5 mt-10"
          >
            <Shield className="w-4 h-4 text-[#d4a853]/60 flex-shrink-0" />
            <p className="text-sm text-muted-foreground/80">
              As a Blueprint holder, we've reserved a{' '}
              <span className="text-foreground/90 font-medium">48-hour priority review window</span>{' '}
              for your project.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Scroll enticer — faded summit ─────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0, 0.6, 0], y: [0, 8, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
          onClick={scrollToNextSteps}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#d4a853]/60"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — What Happens Next + CTA
          ═══════════════════════════════════════════════════════ */}
      <div
        ref={nextStepsRef}
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 md:py-28"
      >
        {/* Big bold heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground text-center mb-16 md:mb-20"
        >
          What Happens Next
        </motion.h2>

        {/* Steps */}
        <div className="w-full max-w-md space-y-8 mb-16 md:mb-20">
          {[
            {
              step: '01',
              title: 'Blueprint Review',
              description: 'Our team reviews your Blueprint within 24 hours, mapping your goals to actionable next steps.',
            },
            {
              step: '02',
              title: 'Personalised Strategy',
              description: "You\u2019ll receive a tailored proposal outlining scope, timeline, and investment \u2014 no generic templates.",
            },
            {
              step: '03',
              title: 'Strategy Call',
              description: 'We jump on a focused call to walk through your roadmap and answer every question before you commit.',
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
                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Primary CTA — Request Strategy Call ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {!callRequested ? (
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleRequestCall}
                disabled={isRequesting}
                className="w-full gap-2.5 text-base py-6 bg-[#d4a853] hover:bg-[#c49a45] text-[#0a0a0f] font-medium transition-colors cursor-pointer"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Request a Strategy Call
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground/50 text-center">
                One click · We'll reach out within 24 hours · No obligation
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
                We'll be in touch within 24 hours to schedule your strategy call.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
