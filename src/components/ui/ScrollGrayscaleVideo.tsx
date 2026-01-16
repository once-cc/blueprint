import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";

interface ScrollGrayscaleVideoProps {
  src: string;
  className?: string;
  videoClassName?: string;
  startOffset?: number;
  endOffset?: number;
}

export function ScrollGrayscaleVideo({
  src,
  className = "",
  videoClassName = "",
  startOffset = 0.8,
  endOffset = 0.5
}: ScrollGrayscaleVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}`, `start ${endOffset}`]
  });

  const grayscaleValue = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const grayscaleFilter = useTransform(grayscaleValue, (v) => `grayscale(${v}%)`);

  // Optimize video playback with IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        });
      },
      {
        rootMargin: "400px", // Pre-warm video
      }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      <motion.video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-cover ${videoClassName}`}
        style={{ filter: grayscaleFilter }}
      >
        <source src={src} type="video/mp4" />
      </motion.video>
    </motion.div>
  );
}
