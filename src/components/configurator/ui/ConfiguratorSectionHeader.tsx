import { motion } from "framer-motion";

interface ConfiguratorSectionHeaderProps {
    title: string;
}

export function ConfiguratorSectionHeader({ title }: ConfiguratorSectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[45%] w-full flex justify-center pointer-events-none z-[-1] overflow-visible"
        >
            <span
                className="font-nohemi font-bold pb-4 select-none whitespace-nowrap uppercase relative inline-block text-transparent bg-clip-text bg-gradient-to-t from-background from-[20%] via-white/5 to-white/10"
                style={{
                    fontSize: "clamp(3.5rem, 14vw, 200px)",
                    lineHeight: 0.8
                }}
            >
                {title}
            </span>
        </motion.div>
    );
}
