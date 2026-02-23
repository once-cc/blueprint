export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            <div className="relative h-full w-full max-w-screen-2xl">
                {/* Outer Strong Frames */}
                <div className="absolute top-0 bottom-0 left-0 w-px bg-[hsl(var(--primary)_/_0.15)] md:bg-[hsl(var(--primary)_/_0.08)]" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-[hsl(var(--primary)_/_0.15)] md:bg-[hsl(var(--primary)_/_0.08)]" />

                {/* Center Axis */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[hsl(var(--primary)_/_0.04)]" />

                {/* Inner Divisions (Desktop Only) */}
                <div className="hidden md:block absolute top-0 bottom-0 left-[16.666%] w-px bg-[hsl(var(--primary)_/_0.03)]" />
                <div className="hidden md:block absolute top-0 bottom-0 left-[33.333%] w-px bg-[hsl(var(--primary)_/_0.03)]" />

                <div className="hidden md:block absolute top-0 bottom-0 right-[33.333%] w-px bg-[hsl(var(--primary)_/_0.03)]" />
                <div className="hidden md:block absolute top-0 bottom-0 right-[16.666%] w-px bg-[hsl(var(--primary)_/_0.03)]" />
            </div>
        </div>
    );
}
