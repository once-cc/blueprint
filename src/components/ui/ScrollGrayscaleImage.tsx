import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ScrollGrayscaleImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  // Control scroll trigger points
  startOffset?: number;  // Default: 0.8 (starts grayscale when 80% down viewport)
  endOffset?: number;    // Default: 0.5 (fully colored when 50% down viewport)
}

export function ScrollGrayscaleImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  startOffset = 0.2,
  endOffset = 0.5
}: ScrollGrayscaleImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start 0.8`, `start 0.5`]
  });

  const grayscaleValue = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const grayscaleFilter = useTransform(grayscaleValue, (v) => `grayscale(${v}%)`);

  return (
    <motion.div ref={ref} className={className} style={{ willChange: "filter, transform", transform: "translateZ(0)" }}>
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageClassName}`}
        style={{ filter: grayscaleFilter }}
      />
    </motion.div>
  );
}
