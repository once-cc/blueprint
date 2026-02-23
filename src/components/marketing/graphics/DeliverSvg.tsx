import { motion } from 'framer-motion';

export function DeliverSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Downward glowing exhaust/propulsion rays */}
            <motion.div
                className="absolute bottom-[20%] w-24 h-48 bg-gradient-to-t from-[#d4a853]/40 via-[#d4a853]/10 to-transparent blur-xl transform"
                animate={{ opacity: [0.5, 0.9, 0.5], height: [150, 200, 150] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Ascension levitation wrapper */}
            <motion.div
                className="relative w-full h-full"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">

                    {/* Propulsion Lines (Bottom) - Fast Streaks */}
                    <motion.g>
                        <motion.line x1="85" y1="160" x2="85" y2="200" stroke="#d4a853" strokeWidth="2"
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: [0, 1, 0], y: 10 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        <motion.line x1="100" y1="150" x2="100" y2="200" stroke="#d4a853" strokeWidth="3"
                            initial={{ opacity: 0, y: -30 }} animate={{ opacity: [0, 1, 0], y: 15 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear', delay: 0.2 }} />
                        <motion.line x1="115" y1="160" x2="115" y2="200" stroke="#d4a853" strokeWidth="2"
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: [0, 1, 0], y: 10 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear', delay: 0.4 }} />

                        <motion.line x1="70" y1="165" x2="40" y2="195" stroke="#d4a853" strokeWidth="1" opacity="0.6"
                            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0], x: -5, y: 5 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.1 }} />
                        <motion.line x1="130" y1="165" x2="160" y2="195" stroke="#d4a853" strokeWidth="1" opacity="0.6"
                            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0], x: 5, y: 5 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', delay: 0.3 }} />
                    </motion.g>

                    {/* Central Ascending Vector Shapes */}
                    <motion.g
                        initial={{ y: 30, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, type: 'spring', stiffness: 50 }}
                    >
                        {/* Aura Glow */}
                        <motion.polygon
                            points="100,10 40,160 100,145 160,160"
                            fill="rgba(212,168,83,0.05)"
                            animate={{ opacity: [0.02, 0.1, 0.02] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Main Triangle Body Outline */}
                        <motion.path
                            d="M100 20 L50 150 L100 135 L150 150 Z"
                            stroke="#d4a853" strokeWidth="1.5" opacity="0.9" fill="rgba(20,20,25,0.8)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        />

                        {/* Energy Triggers on Wireframes */}
                        <motion.path d="M100 20 L100 135" stroke="#d4a853" strokeWidth="1" opacity="0.5" />
                        <motion.path d="M100 20 L100 135" stroke="#d4a853" strokeWidth="2" strokeDasharray="10 100"
                            initial={{ strokeDashoffset: -100 }} animate={{ strokeDashoffset: 100 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />

                        <motion.path d="M50 150 L100 100 L150 150" stroke="#d4a853" strokeWidth="1" opacity="0.5" />
                        <motion.path d="M50 150 L100 100 L150 150" stroke="#d4a853" strokeWidth="2" strokeDasharray="10 100"
                            initial={{ strokeDashoffset: -100 }} animate={{ strokeDashoffset: 100 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />

                        <motion.path d="M75 85 L125 85" stroke="#d4a853" strokeWidth="1" opacity="0.4" />

                        {/* Left Wing Support */}
                        <motion.path d="M75 85 L30 160 L50 150" stroke="#d4a853" strokeWidth="1" opacity="0.6" />
                        {/* Right Wing Support */}
                        <motion.path d="M125 85 L170 160 L150 150" stroke="#d4a853" strokeWidth="1" opacity="0.6" />

                        {/* Solid Glowing Core */}
                        <motion.polygon
                            points="100,70 85,110 100,125 115,110"
                            fill="#d4a853" stroke="#d4a853" strokeWidth="1.5"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
                            transition={{
                                opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            }}
                        />
                    </motion.g>

                </svg>
            </motion.div>
        </div>
    );
}
