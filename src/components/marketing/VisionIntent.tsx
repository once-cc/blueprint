import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DreamInput } from "@/components/ui/dream-input";
import framerMotionLogo from "@/assets/brandlogos/framermotion-white.svg";
import githubLogo from "@/assets/brandlogos/github-white.svg";
import openaiLogo from "@/assets/brandlogos/openai-white.svg";
import resendLogo from "@/assets/brandlogos/resend-white.svg";
import supabaseLogo from "@/assets/brandlogos/supabase.svg";
import vercelLogo from "@/assets/brandlogos/vercel-white.svg";
import viteLogo from "@/assets/brandlogos/vite.svg";

const logos = [
    { name: "Resend", src: resendLogo, alt: "Resend", position: { top: "15%", left: "15%" }, delay: 0, depth: 0.5 },
    { name: "Vercel", src: vercelLogo, alt: "Vercel", position: { top: "10%", left: "55%" }, delay: 0.2, depth: 0.8 },
    { name: "Supabase", src: supabaseLogo, alt: "Supabase", position: { top: "25%", left: "80%" }, delay: 0.4, depth: 1.2 },
    { name: "OpenAI", src: openaiLogo, alt: "OpenAI", position: { top: "60%", left: "10%" }, delay: 0.6, depth: 1.5 },
    { name: "Framer Motion", src: framerMotionLogo, alt: "Framer Motion", position: { top: "75%", left: "40%" }, delay: 0.1, depth: 0.6 },
    { name: "Vite", src: viteLogo, alt: "Vite", position: { top: "65%", left: "85%" }, delay: 0.5, depth: 0.9 },
    { name: "GitHub", src: githubLogo, alt: "GitHub", position: { top: "35%", left: "25%" }, delay: 0.3, depth: 1.1 },
];

export function VisionIntent() {
    const navigate = useNavigate();
    const [dreamIntent, setDreamIntent] = useState("");

    const handleDreamIntentSubmit = () => {
        localStorage.setItem("blueprint_dream_intent", dreamIntent);
        navigate("/configurator");
    };

    const getBaseOpacity = (depth: number) => {
        if (depth <= 0.5) return "opacity-20";
        if (depth <= 0.6) return "opacity-30";
        if (depth <= 0.8) return "opacity-40";
        if (depth <= 0.9) return "opacity-50";
        if (depth <= 1.1) return "opacity-60";
        if (depth <= 1.2) return "opacity-70";
        return "opacity-90";
    };

    return (
        <section id="chatbox-section" className="relative w-full min-h-[600px] md:min-h-[800px] -mt-32 z-20 pointer-events-none">
            {/* Background Gradient to blend hero and scrollytell */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-muted/30" />

            {/* Central Text & Dream Input */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 md:px-8 pointer-events-none">
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

            {/* Scattered Logos */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-6 z-10 pointer-events-auto">
                {logos.map((logo, index) => {
                    return (
                        <motion.div
                            key={`scattered-logo-${logo.name}`}
                            className="absolute flex items-center justify-center rounded-full bg-white/5 border border-white/10 overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-110 hover:bg-white/10 hover:border-white/20 hover:z-30"
                            style={{
                                top: logo.position.top,
                                left: logo.position.left,
                                width: `${5 * logo.depth}rem`,
                                height: `${5 * logo.depth}rem`,
                                translateX: "-50%",
                                translateY: "-50%"
                            }}
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            {/* Subtle inner radial glow (opacity handled cheaply) */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative w-1/2 h-1/2 flex items-center justify-center">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    // Static depth effects with opacity fading
                                    className={`w-full h-full object-contain ${getBaseOpacity(logo.depth)} transition-all duration-300 group-hover:opacity-100 group-hover:scale-110`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
