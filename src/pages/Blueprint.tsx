import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Compass, Target, Rocket, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCarousel } from "@/components/blueprint/TestimonialCarousel";
import { useNavigate } from "react-router-dom";
import { DreamIntentModal } from "@/components/configurator/DreamIntentModal";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const processSteps = [
  {
    id: "discovery",
    icon: Compass,
    title: "Discovery",
    description: "We examine your current digital infrastructure to identify where momentum is lost, auditing every touchpoint for clarity and conversion impact.",
    bullets: ["Strategic gap analysis", "Revenue leak identification", "Audience resonance audit"]
  },
  {
    id: "design",
    icon: Target,
    title: "Design",
    description: "We interpret your unique value into a visual language that commands authority, building a system-level architecture that scales with your ambition.",
    bullets: ["Brand cosmology development", "System-level interface design", "Cinematic visual production"]
  },
  {
    id: "deliver",
    icon: Rocket,
    title: "Deliver",
    description: "A production-ready ecosystem handed over with complete operational clarity, ensuring you can lead your market without technical overhead.",
    bullets: ["Full-stack implementation", "Performance optimization", "Operational handoff training"]
  }
];

const benefits = [
  "Eliminate guesswork from the design process",
  "Reduce costly revisions and back-and-forth",
  "Fast-track your project from idea to launch",
  "Align your team with a shared visual reference",
  "Identify conversion opportunities early",
  "Build with confidence, not assumptions"
];

export default function Blueprint() {
  const navigate = useNavigate();
  const [showDreamIntentModal, setShowDreamIntentModal] = useState(false);

  // Force scroll to top on mount - ensures fresh page entry behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDreamIntentSave = (intent: string) => {
    // Store in localStorage for the configurator to pick up
    localStorage.setItem('blueprint_dream_intent', intent);
    setShowDreamIntentModal(false);
    navigate("/configurator");
  };

  return (
    <>
      {/* Dream Intent Modal */}
      <DreamIntentModal
        isOpen={showDreamIntentModal}
        onClose={() => setShowDreamIntentModal(false)}
        onSave={handleDreamIntentSave}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-6 relative z-10">


            <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-8">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display type-structural-bold tracking-widest text-[10px] md:text-sm text-accent mb-2 uppercase"
              >
                The Crafted Approach
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="heading-editorial text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none"
              >
                The <em className="italic font-medium">Crafted</em>
                <br />
                Blueprint.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-body type-functional-light text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                An architectural foundation for high-performance digital experiences. Eliminate guesswork before development even begins.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="gap-2 text-base px-8 py-6 group"
                  onClick={() => setShowDreamIntentModal(true)}
                >
                  Get Your Free Blueprint
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* Custom SVG Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-16 aspect-video relative bg-card/5 border border-border/30 rounded-xl overflow-hidden flex items-center justify-center max-w-4xl"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <span className="font-display type-structural text-[10px] tracking-widest text-muted-foreground uppercase">[ CUSTOM HERO SVG ANIMATION ]</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What It Is Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                {/* Visual */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-border/30 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-card border border-border/50 shadow-2xl flex items-center justify-center">
                        <FileText className="w-16 h-16 md:w-24 md:h-24 text-accent" />
                      </div>
                      {/* Floating elements */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-6 -right-6 w-16 h-16 rounded-xl bg-accent/20 backdrop-blur-sm border border-accent/30 flex items-center justify-center"
                      >
                        <Target className="w-8 h-8 text-accent" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-4 -left-8 w-14 h-14 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center"
                      >
                        <Compass className="w-7 h-7 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                    What is the Blueprint?
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    The Crafted Blueprint is more than a sitemap or wireframe. It's a comprehensive strategic document
                    that defines every aspect of your website before development begins.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Think of it as the architectural plans for your digital home — complete with user pathways,
                    content strategies, and conversion touchpoints all mapped out in precise detail.
                  </p>

                  {/* Benefits list */}
                  <div className="grid gap-3 pt-4">
                    {benefits.slice(0, 3).map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center flex flex-col items-center mb-16"
            >
              <span className="font-display type-structural-bold tracking-widest text-accent text-[10px] md:text-sm uppercase mb-4">
                A DEFINITIVE FRAMEWORK
              </span>
              <h2 className="heading-editorial text-4xl md:text-6xl tracking-tight mb-4">
                Discovery, Design, Delivery.
              </h2>
            </motion.div>

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center desktop:text-left space-y-6"
                  >
                    {/* Unique SVG Asset Placeholder */}
                    <div className="relative w-full aspect-[4/3] bg-card/30 border border-border/20 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <span className="font-display type-structural text-[10px] tracking-widest text-muted-foreground uppercase text-center px-4">
                          [ {step.title.toUpperCase()} SVG ANIMATION ]
                        </span>
                      </div>
                    </div>

                    {/* Step number and Title */}
                    <div className="flex flex-col items-center desktop:items-start space-y-2">
                      <span className="font-display type-structural-bold text-accent text-xs">
                        PHASE 0{index + 1}
                      </span>
                      <h3 className="heading-editorial text-3xl">{step.title}</h3>
                    </div>

                    <p className="font-body type-functional-light text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Bullet Points */}
                    <ul className="space-y-3 pt-2 text-left w-full inline-block">
                      {step.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex flex-row items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-1 opacity-70" />
                          <span className="font-body type-functional-light text-sm text-foreground/80 tracking-wide">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                Why Start With a Blueprint?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The blueprint eliminates the biggest risks in web development.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                What Our Clients Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Hear from businesses who've transformed their online presence with the Blueprint approach.
              </p>
            </motion.div>
          </div>

          {/* Full-width carousel */}
          <TestimonialCarousel />
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                Ready to build with
                <br />
                <span className="text-accent">confidence?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Get your free Website Blueprint and discover exactly how your new site will drive results.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springConfig}>
                <Button
                  size="lg"
                  className="gap-2 text-lg px-10 py-7 group"
                  onClick={() => setShowDreamIntentModal(true)}
                >
                  Get Your Free Blueprint
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                No commitment required • Response within 24 hours
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
