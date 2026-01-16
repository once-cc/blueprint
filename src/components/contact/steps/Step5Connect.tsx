import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

interface Step5ConnectProps {
  name: string;
  phone: string;
  email: string;
  additionalNotes: string;
  onChange: (field: string, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: springConfig }
};

// Animated SVG Checkmark component
function AnimatedCheckmark() {
  return (
    <div className="relative mx-auto w-32 h-32">
      {/* Outer pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [1, 1.5, 1.8],
          opacity: [0.6, 0.3, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeOut",
          repeatDelay: 0.5
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/15"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [1, 1.3, 1.6],
          opacity: [0.5, 0.2, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeOut",
          delay: 0.3,
          repeatDelay: 0.5
        }}
      />
      
      {/* Main circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/10 border-2 border-accent/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      />
      
      {/* Inner glow */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-accent/30 to-accent/10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      />
      
      {/* SVG Checkmark */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
      >
        {/* Circle path */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{ 
            strokeDasharray: "1",
            strokeDashoffset: "0"
          }}
        />
        {/* Checkmark path */}
        <motion.path
          d="M30 52 L45 67 L70 37"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
          style={{ 
            strokeDasharray: "1",
            strokeDashoffset: "0"
          }}
        />
      </svg>
      
      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-accent"
          initial={{ 
            scale: 0,
            x: 64,
            y: 64,
          }}
          animate={{ 
            scale: [0, 1, 0],
            x: 64 + Math.cos((i * 60) * Math.PI / 180) * 70,
            y: 64 + Math.sin((i * 60) * Math.PI / 180) * 70,
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 1,
            delay: 1.2 + i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

export function Step5Connect({
  name,
  phone,
  email,
  additionalNotes,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  isSuccess,
}: Step5ConnectProps) {
  const navigate = useNavigate();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = name.trim() && isValidEmail;

  if (isSuccess) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center py-8 space-y-10"
      >
        {/* Animated Checkmark */}
        <motion.div variants={itemVariants}>
          <AnimatedCheckmark />
        </motion.div>

        {/* Celebratory Headline */}
        <motion.div variants={itemVariants} className="space-y-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
          >
            You Did It! 🎉
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            You're officially one step closer to the
          </motion.p>
          <motion.p 
            className="text-2xl font-display font-semibold text-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9 }}
          >
            website your business deserves
          </motion.p>
        </motion.div>

        {/* What happens next */}
        <motion.div 
          variants={itemVariants}
          className="bg-muted/50 rounded-2xl p-6 text-left max-w-md mx-auto"
        >
          <p className="text-sm text-muted-foreground mb-2">What happens next?</p>
          <p className="text-foreground">
            We'll review your responses and reach out within <span className="font-semibold text-accent">24 hours</span> to 
            schedule your free blueprint session.
          </p>
        </motion.div>

        {/* Blueprint CTA Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border/50 rounded-2xl p-8 space-y-6 text-left"
        >
          <div className="flex items-start gap-4">
            <motion.div 
              className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <FileText className="w-7 h-7 text-accent" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-semibold">
                Your Free Website Blueprint
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A personalised strategic roadmap that maps out your site's structure, 
                user journeys, and conversion pathways — <span className="text-foreground font-medium">before any design begins</span>.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid gap-3 pt-2">
            {[
              "Eliminate guesswork from the design process",
              "Reduce costly revisions and back-and-forth",
              "Fast-track your project from idea to launch"
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.2 + i * 0.15 }}
                className="flex items-center gap-3 text-sm"
              >
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-foreground/80">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springConfig}
          >
            <Button 
              size="lg" 
              className="w-full gap-2 text-base py-6 group"
              onClick={() => navigate('/blueprint')}
            >
              Learn More About Your Blueprint
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Social Proof */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground tracking-wide uppercase"
        >
          Join 50+ businesses who've transformed their online presence
        </motion.p>

        {/* Secondary Action */}
        <motion.div variants={itemVariants}>
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            Return to homepage
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Let's connect</h2>
        <p className="text-muted-foreground">We'll reach out within 24 hours</p>
      </div>

      {/* Name */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      {/* Phone */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+64 21 234 567"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      {/* Email */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      {/* Additional Notes */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Label htmlFor="additionalNotes">Anything else you'd like us to know?</Label>
        <Textarea
          id="additionalNotes"
          placeholder="Tell us more about your vision…"
          value={additionalNotes}
          onChange={(e) => onChange('additionalNotes', e.target.value)}
          rows={4}
          className="transition-all focus:scale-[1.005]"
        />
      </motion.div>

      {/* Navigation */}
      <motion.div 
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
          <Button variant="ghost" onClick={onBack} className="gap-2" disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onSubmit} disabled={!isValid || isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Complete'
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
