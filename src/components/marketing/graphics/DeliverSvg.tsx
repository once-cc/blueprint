import { motion } from 'framer-motion';

export function DeliverSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden rounded-2xl">

            {/* Background Starfield passing fast during blastoff */}
            <motion.div
                className="absolute inset-0"
                animate={{ y: ['-100%', '0%'] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                style={{ opacity: 0.2 }}
            >
                <div className="w-1 h-1 bg-[#d4a853] absolute top-10 left-10 rounded-full" />
                <div className="w-0.5 h-0.5 bg-[#d4a853] absolute top-20 left-40 rounded-full" />
                <div className="w-1.5 h-1.5 bg-[#d4a853] absolute top-40 left-20 rounded-full" />
                <div className="w-0.5 h-0.5 bg-[#d4a853] absolute top-10 left-80 rounded-full" />
                <div className="w-1 h-3 bg-[#d4a853] absolute top-50 left-60 rounded-full opacity-50" />
            </motion.div>

            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">

                {/* Main Animation Sequence Container */}
                <motion.g
                    animate={{
                        // Phase 1: Fold inwards (scaleX 1 -> 0)
                        // Phase 2: Fold outwards to Rocket (scaleX 0 -> 1)
                        // Phase 3: Blast off (y 0 -> -200)
                        // Phase 4: Reset
                        scaleX: [1, 1, 0, 1, 1, 1, 1],
                        y: [0, 0, 0, 0, 0, -300, 0],
                        opacity: [0, 1, 1, 1, 1, 1, 0]
                    }}
                    transition={{ duration: 6, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], repeat: Infinity, ease: 'easeInOut' }}
                    style={{ originX: "100px", originY: "100px" }}
                >

                    {/* THE PAPER PLANE (Visible from 0 to 0.3) */}
                    <motion.g
                        animate={{ opacity: [1, 1, 0, 0, 0, 0, 1] }}
                        transition={{ duration: 6, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], repeat: Infinity, ease: "linear" }}
                    >
                        <path d="M100 40 L40 140 L100 110 L160 140 Z" stroke="#d4a853" strokeWidth="1.5" />
                        <line x1="100" y1="40" x2="100" y2="130" stroke="#d4a853" strokeWidth="1" />
                        <line x1="40" y1="140" x2="100" y2="130" stroke="#d4a853" strokeWidth="0.5" />
                        <line x1="160" y1="140" x2="100" y2="130" stroke="#d4a853" strokeWidth="0.5" />
                    </motion.g>

                    {/* THE ROCKET (Visible from 0.3 onwards) */}
                    <motion.g
                        animate={{ opacity: [0, 0, 1, 1, 1, 1, 0] }}
                        transition={{ duration: 6, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], repeat: Infinity, ease: "linear" }}
                    >
                        {/* Rocket Body Outline */}
                        <path d="M100 30 L70 120 L130 120 Z" stroke="#d4a853" strokeWidth="1.5" fill="rgba(212,168,83,0.1)" />
                        {/* Nose Cone */}
                        <line x1="85" y1="75" x2="115" y2="75" stroke="#d4a853" strokeWidth="1" />
                        {/* Cockpit Window */}
                        <circle cx="100" cy="90" r="5" stroke="#d4a853" strokeWidth="1" />

                        {/* Fins */}
                        <path d="M70 120 L50 150 L75 120 Z" stroke="#d4a853" strokeWidth="1" />
                        <path d="M130 120 L150 150 L125 120 Z" stroke="#d4a853" strokeWidth="1" />
                        {/* Engine Bell */}
                        <path d="M85 120 L80 135 L120 135 L115 120 Z" stroke="#d4a853" strokeWidth="1.5" />

                        {/* Blast Thruster Flames (Activate at 0.7) */}
                        <motion.g
                            animate={{ opacity: [0, 0, 0, 0, 1, 1, 0], scaleY: [0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 0.5] }}
                            transition={{ duration: 6, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], repeat: Infinity, ease: "easeOut" }}
                            style={{ originY: "135px" }}
                        >
                            <path d="M85 135 L100 180 L115 135 Z" fill="#d4a853" opacity="0.8" />
                            <path d="M92 135 L100 160 L108 135 Z" fill="#fff" opacity="0.9" />
                        </motion.g>
                    </motion.g>

                </motion.g>

                {/* Global Particle Exhaust Trails (Only visible during blastoff 0.7 to 0.9) */}
                <motion.g
                    animate={{ opacity: [0, 0, 0, 0, 1, 0, 0] }}
                    transition={{ duration: 6, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1], repeat: Infinity, ease: "linear" }}
                >
                    <line x1="100" y1="135" x2="100" y2="250" stroke="#d4a853" strokeWidth="6" opacity="0.1" />
                    <line x1="80" y1="135" x2="40" y2="250" stroke="#d4a853" strokeWidth="2" opacity="0.2" />
                    <line x1="120" y1="135" x2="160" y2="250" stroke="#d4a853" strokeWidth="2" opacity="0.2" />
                </motion.g>

            </svg>
        </div>
    );
}
