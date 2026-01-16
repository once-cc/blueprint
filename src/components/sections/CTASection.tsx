import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, MessageSquare, Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";

interface CTASectionProps {
  id?: string;
}

export function CTASection({ id }: CTASectionProps) {
  return (
    <section id={id} className="relative bg-background py-24 md:py-32 lg:py-40 px-8 md:px-16 lg:px-24">
      <div className="grain-overlay opacity-[0.02]" />
      
      {/* Editorial Grid Lines */}
      <EditorialGridLines 
        showHorizontalTop 
        showHorizontalBottom 
        horizontalTopPosition="22%" 
        horizontalBottomPosition="88%" 
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionTitle className="block mb-4">[05] Begin</SectionTitle>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Ready to build a site that
            <br />
            <span className="text-accent italic">actually converts?</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl font-serif text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Three ways to start your transformation. Choose the path that fits your readiness.
          </p>
        </motion.div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Dream Site Configurator */}
          <motion.div
            className="group relative p-8 md:p-10 bg-card border border-border/50 hover:border-accent/50 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            
            <Sparkles className="w-8 h-8 text-accent mb-6" />
            
            <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-3">
              Dream Site Configurator
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Build your vision in 5 minutes. Select features, styles, and goals. Get an instant proposal.
            </p>
            
            <button className="btn-primary w-full group/btn">
              <span>Configure Your Site</span>
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Takes ~5 minutes • No commitment
            </p>
          </motion.div>

          {/* Correspondence Studio */}
          <motion.div
            className="group relative p-8 md:p-10 bg-card border border-border/50 hover:border-accent/50 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            
            <MessageSquare className="w-8 h-8 text-accent mb-6" />
            
            <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-3">
              Correspondence Studio
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Not ready to talk? Exchange detailed briefs via our async messaging system. Respond on your time.
            </p>
            
            <button className="btn-ghost w-full group/btn">
              <span>Start Correspondence</span>
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Async communication • Your pace
            </p>
          </motion.div>

          {/* Clarity Call */}
          <motion.div
            className="group relative p-8 md:p-10 bg-card border border-border/50 hover:border-accent/50 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            
            <Calendar className="w-8 h-8 text-accent mb-6" />
            
            <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-3">
              Clarity Call
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              15 minutes with our Creative Director. Discuss your vision, get honest feedback, zero pressure.
            </p>
            
            <button className="btn-ghost w-full group/btn">
              <span>Book a Call</span>
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              15 minutes • Free • Honest advice
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
