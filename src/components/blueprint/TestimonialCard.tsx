import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick?: () => void;
  isActive?: boolean;
}

export function TestimonialCard({ testimonial, onClick, isActive = false }: TestimonialCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer group h-full w-full transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
    >
      <div className={`relative bg-card border rounded-2xl p-8 h-full transition-all duration-300 ${isActive ? "border-accent shadow-lg shadow-accent/10" : "border-border/40"}`}>
        {/* Quote icon */}
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Quote className="w-4 h-4 text-accent" />
        </div>

        {/* Quote */}
        <p className="text-lg font-raela font-medium leading-relaxed mb-8 pr-12 line-clamp-4">
          "{testimonial.quote}"
        </p>

        {/* Project title */}
        <p className="text-sm text-accent font-medium mb-4">
          {testimonial.projectTitle}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-nohemi font-medium text-muted-foreground">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
