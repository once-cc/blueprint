import { motion } from 'framer-motion';

export function DesignSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">

                {/* Background Grid */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {/* Vertical Lines */}
                    <line x1="40" y1="20" x2="40" y2="180" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" />
                    <line x1="100" y1="20" x2="100" y2="180" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />
                    <line x1="160" y1="20" x2="160" y2="180" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" />

                    {/* Horizontal Lines */}
                    <line x1="20" y1="40" x2="180" y2="40" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" />
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#d4a853" strokeWidth="0.5" opacity="0.5" />
                    <line x1="20" y1="160" x2="180" y2="160" stroke="#d4a853" strokeWidth="0.5" opacity="0.3" />
                </motion.g>

                {/* Perfect Quadrant Circles */}
                <motion.g
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                >
                    {/* Top Left */}
                    <motion.circle cx="40" cy="40" r="30" stroke="#d4a853" strokeWidth="1.5" opacity="0.8" />
                    {/* Top Right */}
                    <motion.circle cx="160" cy="40" r="30" stroke="#d4a853" strokeWidth="1.5" opacity="0.8" />
                    {/* Bottom Left */}
                    <motion.circle cx="40" cy="160" r="30" stroke="#d4a853" strokeWidth="1.5" opacity="0.8" />
                    {/* Bottom Right */}
                    <motion.circle cx="160" cy="160" r="30" stroke="#d4a853" strokeWidth="1.5" opacity="0.8" />
                </motion.g>

                {/* Drafting Compass - Top Node */}
                <motion.g
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8, type: 'spring' }}
                >
                    <circle cx="100" cy="60" r="10" stroke="#d4a853" strokeWidth="1.5" />
                    <circle cx="100" cy="60" r="4" fill="#d4a853" />
                    <rect x="97" y="35" width="6" height="15" stroke="#d4a853" strokeWidth="1" fill="none" />
                </motion.g>

                {/* Compass Left Arm */}
                <motion.path
                    d="M93 67 L60 160 L65 160 L98 67"
                    stroke="#d4a853" strokeWidth="1" fill="rgba(212,168,83,0.1)"
                    initial={{ rotate: -15, originX: "100px", originY: "60px", opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                />

                {/* Compass Right Arm */}
                <motion.path
                    d="M107 67 L140 160 L135 160 L102 67"
                    stroke="#d4a853" strokeWidth="1" fill="rgba(212,168,83,0.1)"
                    initial={{ rotate: 15, originX: "100px", originY: "60px", opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                />

                {/* Compass Crossbar */}
                <motion.line
                    x1="75" y1="120" x2="125" y2="120"
                    stroke="#d4a853" strokeWidth="1.5"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.5 }}
                    style={{ originX: "100px" }}
                />
            </svg>
        </div>
    );
}
