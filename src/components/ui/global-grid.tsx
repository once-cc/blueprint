export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            {/* Exactly matches the padding and max-widths of our standard <section> containers */}
            <div className="h-full w-full container mx-auto px-6">
                {/* 12 Column Grid overlay */}
                <div className="h-full w-full grid grid-cols-4 md:grid-cols-12 gap-6 border-x border-[hsl(var(--primary)_/_0.2)] md:border-[hsl(var(--primary)_/_0.15)]">

                    {/* Render the internal column dividers */}
                    {Array.from({ length: 11 }).map((_, i) => (
                        <div
                            key={i}
                            // Only show 3 inner borders on mobile (4 cols), all 11 on desktop (12 cols)
                            className={`h-full border-r border-[hsl(var(--primary)_/_0.1)] ${i >= 3 ? 'hidden md:block' : ''}`}
                        />
                    ))}

                    {/* The 12th column doesn't need a right border because the parent container handles it */}
                    <div className="h-full hidden md:block" />
                </div>
            </div>
        </div>
    );
}
