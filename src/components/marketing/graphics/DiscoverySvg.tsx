import { motion } from 'framer-motion';

export function DiscoverySvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Outer Grid Rings - Rotating */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <motion.circle cx="100" cy="100" r="80" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 8" />
                    <motion.circle cx="100" cy="100" r="60" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" />
                </motion.g>

                {/* Outer Grid Rings - Counter Rotating */}
                <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <motion.circle cx="100" cy="100" r="70" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 12" />
                </motion.g>

                {/* Abstract Eye Shape */}
                <motion.path
                    d="M20 100 Q 100 30 180 100 Q 100 170 20 100 Z"
                    stroke="#d4a853" strokeWidth="1" opacity="0.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Inner Iris */}
                <motion.circle
                    cx="100" cy="100" r="30"
                    stroke="#d4a853" strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 1, type: 'spring' }}
                />

                {/* Inner Pupil Grid */}
                <circle cx="100" cy="100" r="15" stroke="#d4a853" strokeWidth="0.5" opacity="0.6" />
                <circle cx="100" cy="100" r="5" fill="#d4a853" opacity="0.8" />

                {/* Sharp Crosshairs */}
                <motion.g
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.5, ease: "easeOut" }}
                >
                    <line x1="10" y1="100" x2="190" y2="100" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="#d4a853" strokeWidth="1" opacity="0.6" />

                    {/* Diagonal Crosshairs */}
                    <line x1="40" y1="40" x2="160" y2="160" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" />
                    <line x1="40" y1="160" x2="160" y2="40" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" />
                </motion.g>

                {/* Scanning Target Nodes */}
                <motion.g
                    animate={{ rotate: 90 }}
                    transition={{ delay: 3, duration: 0.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <circle cx="100" cy="40" r="2" fill="#d4a853" />
                    <circle cx="100" cy="160" r="2" fill="#d4a853" />
                    <circle cx="40" cy="100" r="2" fill="#d4a853" />
                    <circle cx="160" cy="100" r="2" fill="#d4a853" />
                </motion.g>

            </svg>
        </div>
    );
}
