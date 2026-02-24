import { motion, AnimatePresence } from "framer-motion";
import { X, Quote, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialDetailSheetProps {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestimonialDetailSheet({ testimonial, isOpen, onClose }: TestimonialDetailSheetProps) {
  const navigate = useNavigate();

  if (!testimonial) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-[101] bg-card border-l border-border/30 shadow-2xl overflow-y-auto"
          >
            <div className="p-8 md:p-12">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border/40 flex items-center justify-center hover:border-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="space-y-8">
                {/* Quote icon */}
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-accent" />
                </div>

                {/* Author */}
                <div>
                  <h3 className="text-2xl font-nohemi font-medium mb-1">{testimonial.name}</h3>
                  <p className="text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>

                {/* Project */}
                <div className="bg-muted/50 rounded-xl p-6 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Project</p>
                  <h4 className="text-lg font-nohemi font-medium text-accent">{testimonial.projectTitle}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.projectDescription}</p>
                </div>

                {/* Full testimonial */}
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Their Story</p>
                  <p className="text-foreground/90 leading-relaxed text-lg">
                    "{testimonial.fullTestimonial}"
                  </p>
                </div>

                {/* Results */}
                {testimonial.results && (
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Results Achieved</p>
                    <div className="space-y-3">
                      {testimonial.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="text-foreground font-medium">{result}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-6 border-t border-border/30">
                  <Button
                    size="lg"
                    className="w-full gap-2 group"
                    onClick={() => {
                      onClose();
                      setTimeout(() => navigate("/contact"), 300);
                    }}
                  >
                    Get Your Free Blueprint
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
