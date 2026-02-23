import { cn } from "@/lib/utils";

export function Crosshair({ className }: { className?: string }) {
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
