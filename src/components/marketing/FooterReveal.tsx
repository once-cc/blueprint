import { useState } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";
import { ShinyButton } from "@/components/ui/shiny-button";
import { springConfig } from "@/data/blueprint";
import { AnimatedButtonIcon } from "@/components/ui/AnimatedButtonIcon";
import paperplaneAnimation from "@/assets/ui/1paperplane.json";

export function FooterReveal({ onCtaClick, scrollProgress }: { onCtaClick: () => void, scrollProgress: MotionValue<number> }) {
    // Headline slides up slowly from behind a mask
    const headlineY = useTransform(scrollProgress, [0.3, 1], ["100%", "0%"]);

    // Subcopy fades in near the very end of the animation (when headline is mostly complete)
    const subcopyOpacity = useTransform(scrollProgress, [0.85, 1], [0, 1]);
    const subcopyY = useTransform(scrollProgress, [0.85, 1], ["20px", "0px"]);

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="max-w-3xl mx-auto text-center space-y-8 flex flex-col items-center justify-end overflow-hidden">

            {/* The Masking Container for the Headline */}
            <div className="overflow-hidden pb-4">
                <motion.h2
                    style={{ y: headlineY }}
                    className="text-5xl md:text-7xl lg:text-[6rem] font-nohemi font-medium tracking-tighter leading-[0.95]"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-950 block pb-1">
                        <em className="italic pr-2">Clarity</em> Before
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 to-zinc-950 block">
                        Commitment.
                    </span>
                </motion.h2>
            </div>

            <motion.p
                style={{ opacity: subcopyOpacity, y: subcopyY }}
                className="text-xl text-muted-foreground"
            >
                A complimentary plan for your next website or platform — before you invest in the build.
            </motion.p>

            {/* Static CTA Container */}
            <div className="relative z-10 pt-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springConfig}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    <ShinyButton
                        size="lg"
                        className="group"
                        onClick={onCtaClick}
                    >
                        <span className="flex items-center gap-3 whitespace-nowrap">
                            Begin My Blueprint
                            <AnimatedButtonIcon
                                animationData={paperplaneAnimation}
                                isActive={isHovered}
                                staticFrame={90}
                                playOnVisible={true}
                                playVisibleDelay={1250}
                                className="w-7 h-7 ml-1"
                            />
                        </span>
                    </ShinyButton>
                </motion.div>

                <motion.p
                    style={{ opacity: subcopyOpacity, y: subcopyY }}
                    className="text-sm text-muted-foreground mt-8"
                >
                    No commitment required • Response within 24 hours
                </motion.p>
            </div>

        </div>
    );
}
