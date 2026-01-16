import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Compass, Target, Rocket, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCarousel } from "@/components/blueprint/TestimonialCarousel";
import { useChamberGate } from "@/hooks/useChamberGate";
import { DreamIntentModal } from "@/components/configurator/DreamIntentModal";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const processSteps = [
  {
    icon: Compass,
    title: "Discovery",
    description: "We dive deep into your business, audience, and goals to understand what success looks like for you."
  },
  {
    icon: Target,
    title: "Strategy",
    description: "We map out user journeys, conversion pathways, and content hierarchy to maximize impact."
  },
  {
    icon: FileText,
    title: "Blueprint",
    description: "You receive a comprehensive visual roadmap showing exactly how your website will work."
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "With the blueprint as our guide, we build and launch with confidence and precision."
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
  const { triggerGateNavigation } = useChamberGate();
  const [showDreamIntentModal, setShowDreamIntentModal] = useState(false);

  // Force scroll to top on mount - ensures fresh page entry behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDreamIntentSave = (intent: string) => {
    // Store in localStorage for the configurator to pick up
    localStorage.setItem('blueprint_dream_intent', intent);
    setShowDreamIntentModal(false);
    triggerGateNavigation("/configurator");
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
          {/* Back link */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => triggerGateNavigation("/")}
            className="mb-12 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            ← Back to home
          </motion.button>

          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Strategic Foundation
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight"
            >
              The Crafted
              <br />
              <span className="text-accent">Blueprint</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              A strategic roadmap that maps your site's structure, user journeys, and conversion pathways — 
              <span className="text-foreground"> before any design begins</span>.
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
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our proven four-step process ensures your website is built on a solid strategic foundation.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center space-y-4"
                >
                  {/* Step number */}
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                      <step.icon className="w-8 h-8 text-accent" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
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
