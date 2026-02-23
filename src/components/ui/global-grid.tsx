export function GlobalGrid() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
            <div className="h-full w-full max-w-screen-2xl grid grid-cols-4 md:grid-cols-12 gap-0 border-x border-white/5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-full border-r border-white/5 ${i >= 4 ? 'hidden md:block' : ''} ${i === 11 ? 'border-r-0' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
}
