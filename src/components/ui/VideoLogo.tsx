import staticLogo from '@/assets/logo-static.webp';
import animatedLogoUrl from '@/assets/logo-animation.webm';

interface VideoLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'custom';
    className?: string;
}

export function VideoLogo({ size = 'md', className = '' }: VideoLogoProps) {
    const sizeClasses = {
        sm: 'w-16 h-auto',
        md: 'w-24 h-auto',
        lg: 'w-32 h-auto',
        custom: className,
    };

    const videoClass = size === 'custom' ? className : sizeClasses[size];

    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            className={videoClass}
            aria-label="Cleland Consultancy Logo"
        >
            <source src={animatedLogoUrl} type="video/webm" />
            {/* Fallback for browsers/devices that don't support the video or fail to load */}
            <img
                src={staticLogo}
                alt="Cleland Consultancy Logo"
                className={videoClass}
            />
        </video>
    );
}
