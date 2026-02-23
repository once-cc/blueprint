import { motion } from 'framer-motion';

export function DiscoverySvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden rounded-2xl">
            {/* Atmospheric Shifting Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#d4a853]/5 via-transparent to-[#d4a853]/5 blur-3xl"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%', '0% 0%'],
                    opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute inset-x-0 h-full bg-gradient-to-t from-transparent via-[#d4a853]/10 to-transparent blur-2xl"
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">

                {/* Outer Grid Rings - Slow Atmospheric Rotation */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <circle cx="100" cy="100" r="80" stroke="#d4a853" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 10" />
                    <circle cx="100" cy="100" r="60" stroke="#d4a853" strokeWidth="0.5" opacity="0.1" />
                </motion.g>

                <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <circle cx="100" cy="100" r="70" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 5" />
                </motion.g>

                {/* The Blinking Eye */}
                {/* We use two paths (top lid, bottom lid) to cleanly animate a blink without morphing complex polygons */}

                {/* Top Lid */}
                <motion.path
                    d="M20 100 Q 100 30 180 100"
                    stroke="#d4a853" strokeWidth="1.5"
                    animate={{ d: ["M20 100 Q 100 30 180 100", "M20 100 Q 100 100 180 100", "M20 100 Q 100 30 180 100"] }}
                    transition={{ duration: 6, times: [0, 0.05, 0.1], repeat: Infinity, repeatDelay: 2 }}
                />

                {/* Bottom Lid */}
                <motion.path
                    d="M20 100 Q 100 170 180 100"
                    stroke="#d4a853" strokeWidth="1.5"
                    animate={{ d: ["M20 100 Q 100 170 180 100", "M20 100 Q 100 100 180 100", "M20 100 Q 100 170 180 100"] }}
                    transition={{ duration: 6, times: [0, 0.05, 0.1], repeat: Infinity, repeatDelay: 2 }}
                />

                {/* Inner Iris */}
                <motion.g
                    animate={{ scaleY: [1, 0, 1] }}
                    transition={{ duration: 6, times: [0, 0.05, 0.1], repeat: Infinity, repeatDelay: 2 }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <circle cx="100" cy="100" r="30" stroke="#d4a853" strokeWidth="1" opacity="0.8" />
                    <circle cx="100" cy="100" r="15" stroke="#d4a853" strokeWidth="0.5" opacity="0.6" />
                    <circle cx="100" cy="100" r="5" fill="#d4a853" opacity="0.9" />
                </motion.g>

                {/* Sharp Crosshairs */}
                <g opacity="0.5">
                    <line x1="10" y1="100" x2="190" y2="100" stroke="#d4a853" strokeWidth="0.5" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="#d4a853" strokeWidth="0.5" />
                </g>

            </svg>
        </div>
    );
}
