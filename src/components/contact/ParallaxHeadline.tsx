import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxHeadlineProps {
  line1?: string;
  line2?: string;
  subtitle?: string;
}

export function ParallaxHeadline({
  line1 = "Let's Build",
  line2 = "Something Great",
  subtitle = "Tell us about your project"
}: ParallaxHeadlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
    >
      <div className="container mx-auto px-6 text-center">
        <motion.div
          style={{ y: y1, opacity }}
          className="space-y-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="heading-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight"
          >
            <span className="block">{line1}</span>
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="heading-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-foreground/60"
          >
            <span className="block">{line2}</span>
          </motion.h2>
        </motion.div>

        <motion.p
          style={{ y: y2, opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-md mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
