import { motion } from 'framer-motion';

export function DesignSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Background Grid */}
                <g opacity="0.3">
                    {/* Radial Grid Elements */}
                    <circle cx="100" cy="100" r="90" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="2 6" />
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#d4a853" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#d4a853" strokeWidth="0.5" />
                    <line x1="29.3" y1="29.3" x2="170.7" y2="170.7" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />
                    <line x1="29.3" y1="170.7" x2="170.7" y2="29.3" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />
                </g>

                {/* Center Main Circle being drawn by compass */}
                <motion.circle
                    cx="100" cy="100" r="60"
                    stroke="#d4a853" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: "100px", originY: "100px", rotate: -90 }} // Starts drawing from the top
                />

                {/* Outer Highlight Ring that trails the compass */}
                <motion.circle
                    cx="100" cy="100" r="66"
                    stroke="#d4a853" strokeWidth="0.5" opacity="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: "100px", originY: "100px", rotate: -90 }}
                />

                {/* Drafting Compass Mechanism - Rotates with the drawing circle */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    {/* Center Pivot Anchor */}
                    <circle cx="100" cy="100" r="8" fill="#141419" stroke="#d4a853" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="3" fill="#d4a853" />

                    {/* Caliper Arm */}
                    {/* Main rigid mechanical arm extending upwards */}
                    <path d="M96 100 L96 50 L98 40 L102 40 L104 50 L104 100 Z" fill="rgba(212,168,83,0.1)" stroke="#d4a853" strokeWidth="1" />

                    {/* Internal mechanical cutouts on the arm */}
                    <line x1="100" y1="90" x2="100" y2="55" stroke="#d4a853" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

                    {/* Joint / Hinge mechanism near the tip */}
                    <rect x="94" y="45" width="12" height="6" fill="#141419" stroke="#d4a853" strokeWidth="1" />
                    <circle cx="100" cy="48" r="1.5" fill="#d4a853" />

                    {/* The Drawing Graphite/Pen Tip */}
                    <path d="M97 40 L100 30 L103 40 Z" fill="#d4a853" opacity="0.8" />

                    {/* Laser/Light guide pointing down to the drawing point at (100, 40) */}
                    <line x1="100" y1="30" x2="100" y2="20" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />
                </motion.g>

                {/* Quadrant Highlights (Synced with the compass rotation) */}
                {/* The compass draws clockwise over 4 seconds (1 quadrant per second). We light them up sequentially. */}
                <motion.g>
                    {/* Top Right Quadrant (0s - 1s) */}
                    <motion.path
                        d="M100 100 L100 40 A60 60 0 0 1 160 100 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 5, times: [0, 0.1, 0.25], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Right Quadrant (1s - 2s) */}
                    <motion.path
                        d="M100 100 L160 100 A60 60 0 0 1 100 160 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 5, times: [0.2, 0.3, 0.45], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Left Quadrant (2s - 3s) */}
                    <motion.path
                        d="M100 100 L100 160 A60 60 0 0 1 40 100 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 5, times: [0.4, 0.5, 0.65], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Top Left Quadrant (3s - 4s) */}
                    <motion.path
                        d="M100 100 L40 100 A60 60 0 0 1 100 40 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.15, 0] }}
                        transition={{ duration: 5, times: [0.6, 0.7, 0.85], repeat: Infinity, repeatDelay: 0 }}
                    />
                </motion.g>
            </svg>
        </div>
    );
}
