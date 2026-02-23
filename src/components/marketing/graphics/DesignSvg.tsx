import { motion } from 'framer-motion';

export function DesignSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Background Grid */}
                <g opacity="0.2">
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#d4a853" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#d4a853" strokeWidth="0.5" />
                </g>

                {/* Center Main Circle being drawn by compass */}
                <motion.circle
                    cx="100" cy="100" r="60"
                    stroke="#d4a853" strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                    style={{ originX: "100px", originY: "100px", rotate: -90 }}
                />

                {/* Quadrant Highlights (Synced with the compass rotation) */}
                {/* The compass draws clockwise over 4 seconds (1 quadrant per second). We light them up sequentially. */}
                <motion.g>
                    {/* Top Right Quadrant (0s - 1s) */}
                    <motion.path
                        d="M100 100 L100 40 A60 60 0 0 1 160 100 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 6, times: [0, 0.08, 0.2], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Right Quadrant (1s - 2s) */}
                    <motion.path
                        d="M100 100 L160 100 A60 60 0 0 1 100 160 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 6, times: [0.16, 0.25, 0.33], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Left Quadrant (2s - 3s) */}
                    <motion.path
                        d="M100 100 L100 160 A60 60 0 0 1 40 100 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 6, times: [0.33, 0.41, 0.5], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Top Left Quadrant (3s - 4s) */}
                    <motion.path
                        d="M100 100 L40 100 A60 60 0 0 1 100 40 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 6, times: [0.5, 0.58, 0.66], repeat: Infinity, repeatDelay: 0 }}
                    />
                </motion.g>


                {/* Drafting Compass Parent - Rotates with the drawing circle */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    {/* The Compass structure anchored to center */}
                    {/* Center Point Node */}
                    <circle cx="100" cy="100" r="4" fill="#d4a853" />
                    <circle cx="100" cy="100" r="8" stroke="#d4a853" strokeWidth="1" fill="none" />

                    {/* Arm extending to the radius (60px) */}
                    <motion.line
                        x1="100" y1="100" x2="100" y2="40"
                        stroke="#d4a853" strokeWidth="1.5"
                    />

                    {/* Drawing Tip Mechanism */}
                    <rect x="96" y="30" width="8" height="10" stroke="#d4a853" strokeWidth="1" fill="#141419" />
                    <line x1="100" y1="30" x2="100" y2="20" stroke="#d4a853" strokeWidth="2" />

                </motion.g>

            </svg>
        </div>
    );
}
