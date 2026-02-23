import { motion } from 'framer-motion';

export function DiscoverySvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Ambient Glow Background Pulse */}
                <motion.circle
                    cx="100" cy="100" r="90"
                    fill="rgba(212,168,83,0.02)"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Outer Grid Rings - Rotating & Pulsing */}
                <motion.g
                    animate={{ rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <motion.circle
                        cx="100" cy="100" r="80"
                        stroke="#d4a853" strokeWidth="0.5" strokeDasharray="4 8"
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.circle cx="100" cy="100" r="60" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" />
                </motion.g>

                {/* Outer Grid Rings - Counter Rotating with Snap */}
                <motion.g
                    animate={{ rotate: [0, -45, -45, -90, -90, -135, -135, -180, -180, -225, -225, -270, -270, -315, -315, -360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'circInOut' }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <motion.circle cx="100" cy="100" r="70" stroke="#d4a853" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 12" />
                </motion.g>

                {/* Abstract Eye Shape - Drawing & Breathing */}
                <motion.path
                    d="M20 100 Q 100 30 180 100 Q 100 170 20 100 Z"
                    stroke="#d4a853" strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0.6, 1, 0.6] }}
                    transition={{
                        pathLength: { duration: 2, ease: "easeInOut" },
                        opacity: { delay: 2, duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                />

                {/* Inner Iris - Spring Snaps */}
                <motion.circle
                    cx="100" cy="100" r="30"
                    stroke="#d4a853" strokeWidth="1.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.1, 1], opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.5, type: 'spring', stiffness: 200, damping: 10 }}
                />

                {/* Inner Pupil Grid - Radar Ping */}
                <circle cx="100" cy="100" r="15" stroke="#d4a853" strokeWidth="0.5" opacity="0.6" />
                <motion.circle
                    cx="100" cy="100" r="5" fill="#d4a853"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Sharp Crosshairs - Targeted Assembly */}
                <motion.g
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
                >
                    <line x1="10" y1="100" x2="190" y2="100" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="#d4a853" strokeWidth="1" opacity="0.6" />

                    {/* Diagonal Crosshairs */}
                    <motion.line
                        x1="40" y1="40" x2="160" y2="160" stroke="#d4a853" strokeWidth="0.5" opacity="0.4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                    />
                    <motion.line
                        x1="40" y1="160" x2="160" y2="40" stroke="#d4a853" strokeWidth="0.5" opacity="0.4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                    />
                </motion.g>

                {/* Scanning Target Nodes - Orbiting */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <motion.circle cx="100" cy="40" r="2.5" fill="#d4a853" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    <motion.circle cx="100" cy="160" r="2.5" fill="#d4a853" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, delay: 0.5, repeat: Infinity }} />
                    <motion.circle cx="40" cy="100" r="2.5" fill="#d4a853" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, delay: 0.25, repeat: Infinity }} />
                    <motion.circle cx="160" cy="100" r="2.5" fill="#d4a853" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, delay: 0.75, repeat: Infinity }} />
                </motion.g>

            </svg>
        </div>
    );
}
