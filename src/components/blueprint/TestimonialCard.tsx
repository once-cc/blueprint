import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick: () => void;
}

export function TestimonialCard({ testimonial, onClick }: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative bg-card border border-border/40 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-accent/50 group-hover:shadow-lg group-hover:shadow-accent/5">
        {/* Quote icon */}
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Quote className="w-4 h-4 text-accent" />
        </div>

        {/* Quote */}
        <p className="text-lg font-display font-medium leading-relaxed mb-8 pr-12">
          "{testimonial.quote}"
        </p>

        {/* Project title */}
        <p className="text-sm text-accent font-medium mb-4">
          {testimonial.projectTitle}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-display font-semibold text-muted-foreground">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-6 right-6 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Click to read more →
        </div>
      </div>
    </motion.div>
  );
}
