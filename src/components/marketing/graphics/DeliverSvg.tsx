import { motion } from 'framer-motion';

export function DeliverSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Downward glowing exhaust/propulsion rays */}
            <motion.div
                className="absolute bottom-[20%] w-16 h-40 bg-gradient-to-t from-[#d4a853]/30 via-[#d4a853]/10 to-transparent blur-md transform"
                animate={{ opacity: [0.4, 0.8, 0.4], height: [120, 160, 120] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">

                {/* Propulsion Lines (Bottom) */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                    <line x1="85" y1="160" x2="85" y2="190" stroke="#d4a853" strokeWidth="2" />
                    <line x1="100" y1="150" x2="100" y2="195" stroke="#d4a853" strokeWidth="2.5" />
                    <line x1="115" y1="160" x2="115" y2="190" stroke="#d4a853" strokeWidth="2" />

                    <line x1="70" y1="165" x2="50" y2="185" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                    <line x1="130" y1="165" x2="150" y2="185" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                </motion.g>

                {/* Central Ascending Vector Shapes */}
                <motion.g
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    {/* Main Triangle Body Outline */}
                    <motion.path
                        d="M100 20 L50 150 L100 135 L150 150 Z"
                        stroke="#d4a853" strokeWidth="1.5" opacity="0.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />

                    {/* Internal Wireframe Triangles */}
                    <motion.path
                        d="M100 20 L100 135"
                        stroke="#d4a853" strokeWidth="1" opacity="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    />
                    <motion.path
                        d="M50 150 L100 100 L150 150"
                        stroke="#d4a853" strokeWidth="1" opacity="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    />
                    <motion.path
                        d="M75 85 L125 85"
                        stroke="#d4a853" strokeWidth="1" opacity="0.4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    />

                    {/* Left Wing Support */}
                    <motion.path
                        d="M75 85 L30 160 L50 150"
                        stroke="#d4a853" strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    />

                    {/* Right Wing Support */}
                    <motion.path
                        d="M125 85 L170 160 L150 150"
                        stroke="#d4a853" strokeWidth="1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                    />

                    {/* Solid Glowing Core */}
                    <motion.polygon
                        points="100,60 85,100 100,120 115,100"
                        fill="#d4a853" opacity="0.15" stroke="#d4a853" strokeWidth="1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 1 }}
                        transition={{ delay: 1.5, duration: 1, type: 'spring' }}
                    />
                </motion.g>

            </svg>
        </div>
    );
}
