export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            {/* Exactly matches the padding and max-widths of our standard <section> containers */}
            <div className="h-full w-full container mx-auto px-6">
                {/* Grid overlay: 4 on mobile/tablet, 8 on laptop/desktop */}
                <div
                    className="h-full w-full grid grid-cols-4 lg:grid-cols-8 border-x border-[hsl(var(--primary)_/_0.4)] md:border-[hsl(var(--primary)_/_0.3)] pointer-events-none"
                    style={{ maskImage: "linear-gradient(to right, black 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.02) 80%, black 100%)", WebkitMaskImage: "linear-gradient(to right, black 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.02) 80%, black 100%)" }}
                >

                    {/* Render the internal column dividers */}
                    {Array.from({ length: 9 }).map((_, i) => {
                        // Determine visibility based on active columns
                        // Mobile/Tablet (4 cols): shows first 3 dividers
                        // Laptop / Desktop (8 cols): shows 7 dividers
                        let displayClass = "hidden";
                        if (i < 3) displayClass = "block";
                        else if (i < 7) displayClass = "hidden lg:block";
                        else displayClass = "hidden"; // Never show the 8th and 9th dividers (enforce max 8 columns overall)

                        return (
                            <div
                                key={i}
                                className={`h-full border-r border-[hsl(var(--primary)_/_0.2)] ${displayClass}`}
                            />
                        );
                    })}

                    {/* The final column filler for the grid structure */}
                    <div className="h-full hidden lg:block" />
                </div>
            </div>
        </div>
    );
}
