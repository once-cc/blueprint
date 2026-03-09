import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConfiguratorModuleTitle, ConfiguratorMeta } from "@/components/ui/Typography";

interface ConfiguratorCardHeaderProps {
    title: string;
    metaLabel?: string;
    className?: string;
    delay?: number;
    modeSwitch?: {
        mode: 'system' | 'manual';
        onChange: (mode: 'system' | 'manual') => void;
    };
}

export function ConfiguratorCardHeader({ title, metaLabel, className, delay = 0, modeSwitch }: ConfiguratorCardHeaderProps) {
    return (
        <div className={cn("absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[inherit]", className)}>
            {/* Structural Ticks */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: delay + 0.2 }}
                className="absolute inset-0"
            >
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 dark:border-white/20 rounded-tl-[inherit]" />

                {/* Top Right */}
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 dark:border-white/20 rounded-tr-[inherit]" />

                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/10 dark:border-white/20 rounded-bl-[inherit]" />

                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 dark:border-white/20 rounded-br-[inherit]" />
            </motion.div>

            {/* Header Content */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: delay + 0.4 }}
                className="absolute top-6 left-0 right-0 flex justify-center pointer-events-auto"
            >
                <div className="flex flex-col items-center gap-1">
                    {/* Title with Amber Dots */}
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-accent/80" />
                        <ConfiguratorModuleTitle className="text-[#ebe9e0] select-none">
                            {title}
                        </ConfiguratorModuleTitle>
                        <div className="w-1 h-1 rounded-full bg-accent/80" />
                    </div>
                </div>
            </motion.div>

            {/* Mobile Mode Toggle — below title, visible only on mobile */}
            {modeSwitch && (
                <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: delay + 0.6 }}
                    className="absolute left-[15px] right-[15px] top-[3.5rem] flex flex-col items-center pointer-events-auto sm:hidden"
                >
                    {/* Editorial separator line */}
                    <div
                        className="w-full h-[1px] mb-3"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 15px, rgba(255,255,255,0.15) calc(100% - 15px), transparent 100%)'
                        }}
                    />
                    <div className="flex items-center h-[18px]">
                        <button
                            type="button"
                            onClick={() => modeSwitch.onChange('system')}
                            className={cn(
                                "font-raela text-[10px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                                modeSwitch.mode === 'system' ? "text-[#ebe9e0]/60" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
                            )}
                        >
                            System
                        </button>
                        <span className="text-[#ebe9e0]/20 text-[10px] select-none mx-2">|</span>
                        <button
                            type="button"
                            onClick={() => modeSwitch.onChange('manual')}
                            className={cn(
                                "font-raela text-[10px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                                modeSwitch.mode === 'manual' ? "text-accent" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
                            )}
                        >
                            Manual
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Desktop Mode Toggle — top-left, hidden on mobile */}
            {modeSwitch && (
                <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: delay + 0.4 }}
                    className="absolute top-6 left-6 items-center h-[18px] pointer-events-auto hidden sm:flex"
                >
                    <button
                        type="button"
                        onClick={() => modeSwitch.onChange('system')}
                        className={cn(
                            "font-raela text-[11px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                            modeSwitch.mode === 'system' ? "text-[#ebe9e0]/60" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
                        )}
                    >
                        System
                    </button>
                    <span className="text-[#ebe9e0]/20 text-[10px] select-none mx-2">|</span>
                    <button
                        type="button"
                        onClick={() => modeSwitch.onChange('manual')}
                        className={cn(
                            "font-raela text-[11px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                            modeSwitch.mode === 'manual' ? "text-accent" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
                        )}
                    >
                        Manual
                    </button>
                </motion.div>
            )}

            {/* Top-Right Metadata Label */}
            {metaLabel && (
                <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: delay + 0.4 }}
                    className="absolute top-6 right-6 flex items-center gap-2 pointer-events-auto"
                >
                    <ConfiguratorMeta className="text-[#ebe9e0]/[0.08] select-none">
                        {metaLabel}
                    </ConfiguratorMeta>
                    <div className="w-[3px] h-[3px] rounded-full bg-accent/70" />
                </motion.div>
            )}

            {/* Editorial Underline — visible on sm+ (desktop), hidden on mobile when toggle is present */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0.95 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: delay + 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "absolute top-[3.5rem] left-[15px] right-[15px] h-[1px] origin-center",
                    modeSwitch ? "hidden sm:block" : ""
                )}
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 15px, rgba(255,255,255,0.15) calc(100% - 15px), transparent 100%)'
                }}
            />
        </div>
    );
}

