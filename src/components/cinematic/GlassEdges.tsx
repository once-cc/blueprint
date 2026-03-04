export function GlassEdges() {
  return (
    <>
      {/* Top glass edge — opaque gradient replaces expensive backdrop-blur */}
      <div
        className="fixed inset-x-0 top-0 z-40 pointer-events-none
                   h-16 md:h-20 lg:h-24"
        style={{
          background: 'linear-gradient(to bottom, hsl(220 15% 4% / 0.85) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom glass edge — opaque gradient replaces expensive backdrop-blur */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-none
                   h-16 md:h-20 lg:h-24"
        style={{
          background: 'linear-gradient(to top, hsl(220 15% 4% / 0.85) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
