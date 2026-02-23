import { motion } from 'framer-motion';

export function DiscoverySvg() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]" fill="none">
                {/* Eye/Lens Shape */}
                <motion.path
                    d="M20 100 Q 100 20 180 100 Q 100 180 20 100 Z"
                    stroke="#d4a853" strokeWidth="1.5" opacity="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                {/* Iris / Inner Ring */}
                <motion.circle
                    cx="100" cy="100" r="30"
                    stroke="#d4a853" strokeWidth="2"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 30, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                />
                {/* Scanning Line */}
                <motion.line
                    x1="20" y1="20" x2="180" y2="20"
                    stroke="#d4a853" strokeWidth="1"
                    opacity="0.8"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: [0, 160, 0], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 1.5, duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </svg>
        </div>
    );
}
