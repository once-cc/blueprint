import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SuccessState() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4"
    >
      {/* Animated Tick */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              delay: 0.5 + i * 0.1,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="absolute"
            style={{
              top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 70}%`,
              left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 70}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Sparkles className="w-5 h-5 text-accent" />
          </motion.div>
        ))}

        {/* Check Circle */}
        <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
          <motion.svg
            viewBox="0 0 24 24"
            className="w-12 h-12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-4"
      >
        Your Blueprint is Ready
      </motion.h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-lg md:text-xl text-muted-foreground max-w-md mb-8"
      >
        You've just taken the biggest step toward your dream website.
      </motion.p>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-muted/30 border border-border/30 rounded-2xl p-6 max-w-md w-full mb-8"
      >
        <h3 className="font-display font-semibold text-foreground mb-4">What happens next?</h3>
        <ul className="space-y-3 text-left">
          {[
            'We review your Blueprint within 24 hours',
            'You receive a personalized proposal',
            'We schedule a discovery call if it\'s a fit',
          ].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="flex items-start gap-3 text-sm"
            >
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-accent" />
              </div>
              <span className="text-muted-foreground">{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-4"
      >
        <Button
          size="lg"
          onClick={() => navigate('/portal')}
          className="gap-2 text-base px-8 py-6"
        >
          Enter Your Correspondence Studio
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Track progress, view documents, and communicate with us
        </p>
      </motion.div>
    </motion.div>
  );
}
