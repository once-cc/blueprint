import { motion } from 'framer-motion';

export function DesignSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Background Grid */}
                <g opacity="0.2">
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#d4a853" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#d4a853" strokeWidth="0.5" />
                    <circle cx="100" cy="100" r="90" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="2 6" />
                </g>

                {/* Center Main Circle being drawn by compass */}
                <motion.circle
                    cx="100" cy="100" r="60"
                    stroke="#d4a853" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: "100px", originY: "100px", rotate: -90 }} // Starts drawing from the top (100, 40)
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
                        transition={{ duration: 5, times: [0, 0.1, 0.2], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Right Quadrant (1s - 2s) */}
                    <motion.path
                        d="M100 100 L160 100 A60 60 0 0 1 100 160 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 5, times: [0.2, 0.3, 0.4], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Bottom Left Quadrant (2s - 3s) */}
                    <motion.path
                        d="M100 100 L100 160 A60 60 0 0 1 40 100 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 5, times: [0.4, 0.5, 0.6], repeat: Infinity, repeatDelay: 0 }}
                    />
                    {/* Top Left Quadrant (3s - 4s) */}
                    <motion.path
                        d="M100 100 L40 100 A60 60 0 0 1 100 40 Z"
                        fill="#d4a853" stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.2, 0] }}
                        transition={{ duration: 5, times: [0.6, 0.7, 0.8], repeat: Infinity, repeatDelay: 0 }}
                    />
                </motion.g>


                {/* Highly Realistic Drafting Compass */}
                <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    {/* --- Anchor Leg (Left side, from center up to hinge) --- */}
                    {/* Center Anchor Needle */}
                    <line x1="100" y1="100" x2="108" y2="95" stroke="#d4a853" strokeWidth="1.5" />
                    <circle cx="108" cy="95" r="2" fill="#d4a853" />

                    {/* Anchor Leg Body */}
                    <line x1="108" y1="95" x2="150" y2="70" stroke="#d4a853" strokeWidth="6" strokeLinecap="round" opacity="0.15" />
                    <line x1="108" y1="95" x2="150" y2="70" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Inner cutout line */}
                    <line x1="112" y1="91" x2="145" y2="71" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />

                    {/* Anchor Leg Crossbar Joint */}
                    <circle cx="128" cy="83" r="3.5" fill="#141419" stroke="#d4a853" strokeWidth="1" />
                    <circle cx="128" cy="83" r="1" fill="#d4a853" />

                    {/* --- Drawing Leg (Right side, from tip up to hinge) --- */}
                    {/* Pencil Graphite Tip */}
                    <line x1="100" y1="40" x2="108" y2="45" stroke="#d4a853" strokeWidth="2" opacity="0.9" />
                    {/* Pencil Chuck/Clamp */}
                    <polygon points="104,42 109,47 106,49" fill="#d4a853" opacity="0.6" />
                    <circle cx="108" cy="45" r="2.5" fill="#d4a853" />

                    {/* Drawing Leg Body */}
                    <line x1="108" y1="45" x2="150" y2="70" stroke="#d4a853" strokeWidth="6" strokeLinecap="round" opacity="0.15" />
                    <line x1="108" y1="45" x2="150" y2="70" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Inner cutout line */}
                    <line x1="112" y1="49" x2="145" y2="69" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />

                    {/* Drawing Leg Crossbar Joint */}
                    <circle cx="128" cy="57" r="3.5" fill="#141419" stroke="#d4a853" strokeWidth="1" />
                    <circle cx="128" cy="57" r="1" fill="#d4a853" />

                    {/* --- Mechanism Assembly --- */}
                    {/* Threaded Crossbar */}
                    <line x1="128" y1="83" x2="128" y2="57" stroke="#d4a853" strokeWidth="1.5" strokeDasharray="1 2" />

                    {/* Adjustment Wheel */}
                    <rect x="125" y="63" width="6" height="14" fill="#141419" stroke="#d4a853" strokeWidth="1.5" rx="1.5" />
                    <line x1="125" y1="66" x2="131" y2="66" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="70" x2="131" y2="70" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                    <line x1="125" y1="74" x2="131" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.6" />

                    {/* Main Top Hinge Joint */}
                    <circle cx="150" cy="70" r="8" fill="#141419" stroke="#d4a853" strokeWidth="1.5" />
                    <circle cx="150" cy="70" r="3.5" fill="#d4a853" opacity="0.8" />
                    <circle cx="150" cy="70" r="1.5" fill="#141419" />
                    <circle cx="150" cy="70" r="11" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.5" />

                    {/* Top Handle */}
                    {/* Handle stem */}
                    <line x1="158" y1="70" x2="165" y2="70" stroke="#d4a853" strokeWidth="2.5" />
                    {/* Knurled finger grip */}
                    <rect x="165" y="66" width="18" height="8" fill="#141419" stroke="#d4a853" strokeWidth="1.5" rx="1.5" />
                    {/* Knurl details */}
                    <line x1="168" y1="66" x2="168" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.4" />
                    <line x1="171" y1="66" x2="171" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.4" />
                    <line x1="174" y1="66" x2="174" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.4" />
                    <line x1="177" y1="66" x2="177" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.4" />
                    <line x1="180" y1="66" x2="180" y2="74" stroke="#d4a853" strokeWidth="1" opacity="0.4" />

                </motion.g>

            </svg>
        </div>
    );
}
