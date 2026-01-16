export function GlassEdges() {
  return (
    <>
      {/* Top glass edge */}
      <div 
        className="fixed inset-x-0 top-0 z-40 pointer-events-none
                   h-16 md:h-20 lg:h-24
                   backdrop-blur-[10px] md:backdrop-blur-[12px]
                   bg-black/[0.18]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      
      {/* Bottom glass edge */}
      <div 
        className="fixed inset-x-0 bottom-0 z-40 pointer-events-none
                   h-16 md:h-20 lg:h-24
                   backdrop-blur-[10px] md:backdrop-blur-[12px]
                   bg-black/[0.18]"
        style={{
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
