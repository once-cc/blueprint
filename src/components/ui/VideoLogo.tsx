import logoVideoWebm from "@/assets/logo-animation.webm";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface VideoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'custom';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isActive?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  xxl: 'w-32 h-32',
  custom: '',
};

export function VideoLogo({
  size = 'md',
  className,
  onClick,
  style,
  onMouseEnter,
  onMouseLeave,
  isActive = true
}: VideoLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | undefined>(undefined);

  // Generate poster from first frame of video
  useEffect(() => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    const handleLoadedData = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setPosterUrl(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        // Silently fail - poster is optional
      }
      video.remove();
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.src = logoVideoWebm;
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.remove();
    };
  }, []);

  // Class B' Isolation: logo animation is a persistent spectator
  // in background contexts and must not know scroll exists.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => { });
  }, []);

  return (
    <video
      ref={videoRef}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        sizeClasses[size],
        'object-contain pointer-events-none isolation-isolate contain-paint',
        className
      )}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        ...style,
      }}
    >
      {/* WebM first - modern browsers with alpha support */}
      <source src={logoVideoWebm} type="video/webm" />
    </video>
  );
}
