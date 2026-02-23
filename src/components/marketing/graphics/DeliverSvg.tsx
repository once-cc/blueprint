import { motion } from 'framer-motion';

export function DeliverSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            {/* Upward light rays */}
            <motion.div
                className="absolute bottom-[20%] w-20 h-32 bg-gradient-to-t from-[#d4a853]/20 to-transparent blur-md"
                animate={{ opacity: [0.3, 0.7, 0.3], height: [100, 140, 100] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] relative z-10" fill="none">
                {/* Isometric Cube Base */}
                <motion.path
                    d="M100 140 L40 105 L100 70 L160 105 Z"
                    stroke="#d4a853" strokeWidth="1.5" fill="rgba(212,168,83,0.05)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
                {/* Left Face */}
                <motion.path
                    d="M40 105 L100 140 L100 210 L40 175 Z"
                    stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                />
                {/* Right Face */}
                <motion.path
                    d="M100 140 L160 105 L160 175 L100 210 Z"
                    stroke="#d4a853" strokeWidth="1.5" opacity="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                />

                {/* Rising top element to show "Delivery" */}
                <motion.path
                    d="M100 80 L60 55 L100 30 L140 55 Z"
                    stroke="#d4a853" strokeWidth="2" fill="rgba(212,168,83,0.15)"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.2, type: 'spring', bounce: 0.3 }}
                />
            </svg>
        </div>
    );
}
