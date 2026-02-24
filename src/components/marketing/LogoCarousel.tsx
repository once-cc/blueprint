import { motion } from "framer-motion";

// Import SVGs explicitly so Vite handles hashing and path resolution
import framerMotionLogo from "@/assets/brandlogos/framermotion-white.svg";
import githubLogo from "@/assets/brandlogos/github-white.svg";
import openaiLogo from "@/assets/brandlogos/openai-white.svg";
import resendLogo from "@/assets/brandlogos/resend-white.svg";
import supabaseLogo from "@/assets/brandlogos/supabase.svg";
import vercelLogo from "@/assets/brandlogos/vercel-white.svg";
import viteLogo from "@/assets/brandlogos/vite.svg";

const logos = [
    { name: "Resend", src: resendLogo, alt: "Resend" },
    { name: "Vercel", src: vercelLogo, alt: "Vercel" },
    { name: "Supabase", src: supabaseLogo, alt: "Supabase" },
    { name: "OpenAI", src: openaiLogo, alt: "OpenAI" },
    { name: "Framer Motion", src: framerMotionLogo, alt: "Framer Motion" },
    { name: "Vite", src: viteLogo, alt: "Vite" },
    { name: "GitHub", src: githubLogo, alt: "GitHub" },
];

export function LogoCarousel() {
    return (
        <section className="relative w-full py-12 md:py-16 overflow-hidden bg-background border-b border-white/5">
            {/* Edge Gradients for smooth fade-in/fade-out on sides */}
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Dynamic widths to control spacing: 300% (mobile = +50% spacing), 240% (tablet = +20%), 200% (laptop = baseline). */}
            <div className="flex items-center w-[300%] md:w-[240%] lg:w-[200%] animate-marquee [animation-duration:15s] md:[animation-duration:18s] lg:[animation-duration:22s]">
                {/* Set 1 */}
                {/* Removed px-8 so `justify-around` ensures the end gap + start gap perfectly matches inter-logo gaps! */}
                <div className="flex w-1/2 items-center justify-around">
                    {logos.map((logo) => (
                        <img
                            key={`logo-1-${logo.name}`}
                            src={logo.src}
                            alt={logo.alt}
                            className="h-7 md:h-8 w-auto object-contain opacity-20 hover:opacity-50 transition-opacity duration-300 grayscale invert brightness-0"
                        />
                    ))}
                </div>

                {/* Set 2 (Duplicated for seamless infinite scroll) */}
                <div className="flex w-1/2 items-center justify-around">
                    {logos.map((logo) => (
                        <img
                            key={`logo-2-${logo.name}`}
                            src={logo.src}
                            alt={logo.alt}
                            className="h-7 md:h-8 w-auto object-contain opacity-20 hover:opacity-50 transition-opacity duration-300 grayscale invert brightness-0"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
