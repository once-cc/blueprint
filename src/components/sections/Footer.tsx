import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { StaticTypeRig } from "../cinematic/TypeRig";
import { VideoLogo } from "@/components/ui/VideoLogo";

export function Footer() {
  return (
    <footer className="relative bg-background border-t border-border/30">
      <div className="grain-overlay opacity-[0.02]" />

      {/* Main footer content */}
      <div className="px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: CTA + Contact */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-muted-foreground text-sm">
                  contact@cleland.studio +
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <VideoLogo size="sm" />
                  <span className="text-muted-foreground text-xs">®</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <span>AOTEAROA (NZ)</span>
                <span className="mx-4">·</span>
                <span>{new Date().toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland" })}</span>
              </div>

              {/* Quote */}
              <blockquote className="pt-8 border-t border-border/30">
                <p className="text-lg md:text-xl text-foreground leading-relaxed">
                  <span className="text-muted-foreground">"</span>
                  <span className="font-medium">Your next project deserves world-class design.</span>
                  {" "}
                  <span className="text-muted-foreground">
                    Stop settling for mediocre and start working with designers who care as much as you do.
                  </span>
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-secondary" />
                  <div>
                    <p className="font-display font-medium text-foreground text-sm">James Cleland</p>
                    <p className="text-xs text-muted-foreground">Creative Director</p>
                  </div>
                </div>
              </blockquote>
            </div>

            {/* Right: Navigation */}
            <div className="lg:col-span-7 lg:pl-16">
              <nav className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Navigate</span>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Studio
                      </a>
                    </li>
                    <li>
                      <a href="#work" className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1">
                        Work <span className="text-muted-foreground text-xs">[12]</span>
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://portal.clelandconsultancy.com" 
                        className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1"
                      >
                        Client Portal <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Services</span>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Web Design
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Brand Strategy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Development
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display">
                        Pricing
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Connect</span>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1">
                        X <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1">
                        Instagram <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1">
                        Dribbble <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-foreground hover:text-accent transition-colors font-display flex items-center gap-1">
                        LinkedIn <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-8 md:px-16 lg:px-24 py-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Terms of Service <ArrowUpRight className="w-3 h-3" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Privacy Policy <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Cleland Studio</span>
          </div>
        </div>
      </div>

      {/* Large watermark typography */}
      <div className="relative overflow-hidden py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <StaticTypeRig
            as="div"
            showGhost={true}
            ghostOpacity={0.05}
            ghostScale={1.02}
          >
            <span className="block heading-hero text-foreground/10 text-center whitespace-nowrap">
              CLELAND
            </span>
          </StaticTypeRig>
          <StaticTypeRig
            as="div"
            showGhost={true}
            ghostOpacity={0.03}
            ghostScale={1.02}
          >
            <span className="block heading-hero text-ghost/30 text-center whitespace-nowrap ml-[15%]">
              STUDIO
            </span>
          </StaticTypeRig>
        </motion.div>
      </div>
    </footer>
  );
}
