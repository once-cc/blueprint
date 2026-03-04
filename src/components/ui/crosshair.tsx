import { cn } from "@/lib/utils";

interface CrosshairProps {
    className?: string;
    topColor?: string;
    bottomColor?: string;
}

export function Crosshair({ className, topColor, bottomColor }: CrosshairProps) {
    // Split-color mode: top half and bottom half of the vertical line use different colors
    if (topColor && bottomColor) {
        return (
            <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn("text-muted-foreground", className)}
            >
                {/* Vertical: top half */}
                <path d="M8.5 0V8.5" stroke={topColor} strokeWidth="1" />
                {/* Vertical: bottom half */}
                <path d="M8.5 8.5V17" stroke={bottomColor} strokeWidth="1" />
                {/* Horizontal: left half */}
                <path d="M0 8.5H8.5" stroke={topColor} strokeWidth="1" />
                {/* Horizontal: right half */}
                <path d="M8.5 8.5H17" stroke={topColor} strokeWidth="1" />
            </svg>
        );
    }

    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-muted-foreground", className)}
        >
            <path d="M8.5 0V17" stroke="currentColor" strokeWidth="1" />
            <path d="M0 8.5H17" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}
