import { motion } from 'framer-motion';

export function DesignSvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">
                {/* Geometric intersections */}
                <motion.circle
                    cx="80" cy="100" r="50"
                    stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.circle
                    cx="120" cy="100" r="50"
                    stroke="#d4a853" strokeWidth="1.5" opacity="0.6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                />
                {/* Connecting architectural lines */}
                <motion.path
                    d="M80 50 L120 150 M80 150 L120 50"
                    stroke="#d4a853" strokeWidth="1" strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ delay: 1.5, duration: 1 }}
                />
                {/* Center node */}
                <motion.circle
                    cx="100" cy="100" r="4" fill="#d4a853"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: 'spring' }}
                />
            </svg>
        </div>
    );
}
