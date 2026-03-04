import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DreamInput } from "@/components/ui/dream-input";
import { LogoGrid } from "@/components/ui/LogoGrid";
import { Crosshair } from "@/components/ui/crosshair";
import { useRayPause } from "@/hooks/useRayPause";

export function VisionIntent() {
    const navigate = useNavigate();
    const [dreamIntent, setDreamIntent] = useState("");
    const raysRef = useRayPause<HTMLDivElement>();

    const handleDreamIntentSubmit = () => {
        localStorage.setItem("blueprint_dream_intent", dreamIntent);
        navigate("/configurator");
    };

    return (
        <section id="chatbox-section" className="relative w-full min-h-[600px] md:min-h-[800px] flex flex-col justify-between -mt-32 z-20 pointer-events-none">
            {/* Background Gradient to blend hero and scrollytell */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-muted/30" />

            {/* Environmental Volumetric Light Rays (Continuing down from Hero) */}
            {/* Extended clip path allows volumetric bleed upwards into Hero, but strictly stops at bottom and side boundaries */}
            <div ref={raysRef} className="absolute inset-0 pointer-events-none z-0" style={{ clipPath: 'inset(-50% 0 0 0)' }}>
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-gradient-to-l from-transparent via-white/10 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner-reverse opacity-100" />
                <div className="absolute top-[-10%] right-[15%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-700 opacity-80" />
            </div>

            {/* Faded Background Pattern & Rails */}
            {/* mask-image ensures the grid and rails fade out smoothly at the top to blend from the dark hero section */}
            <div className="absolute inset-0 z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent,black_200px)]">
                {/* Faint Global Editorial Grid */}
                <div className="absolute inset-0 bg-editorial-grid" />

                {/* True Edge Docking Rails spanning the entire section height */}
                <div className="absolute inset-0 flex justify-center">
                    <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                        <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                            <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />
                            <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 mt-32 z-20 pointer-events-none">
                {/* Central Text & Dream Input */}
                <div className="w-full flex flex-col items-center justify-center px-6 sm:px-10 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-2xl flex flex-col items-center gap-6 pointer-events-auto"
                    >
                        <h2 className="font-nohemi font-medium whitespace-nowrap text-[clamp(1.75rem,8.5vw,6rem)] md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-center leading-[1.05] mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-900 block">
                                Define the Direction.
                            </span>
                        </h2>

                        <div className="w-full relative z-30">
                            <DreamInput
                                value={dreamIntent}
                                onChange={setDreamIntent}
                                onSubmit={handleDreamIntentSubmit}
                                className="w-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Structured Cascading Logo Wall */}
            <div className="relative z-30 pointer-events-auto w-full mt-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <LogoGrid />
                </motion.div>
            </div>
        </section>
    );
}
