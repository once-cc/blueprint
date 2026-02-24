import { motion } from "framer-motion";
import { X, Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { SiX } from "@icons-pack/react-simple-icons";
import { useNavigate } from "react-router-dom";
import { useLenisScroll } from "@/hooks/useLenisScroll";

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: "Configurator", href: "/configurator", isRoute: true },
  { label: "Blueprint", href: "/blueprint", isRoute: true },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: SiX, href: "https://x.com", label: "X" },
];

/**
 * Fullscreen navigation menu with animated CLELAND logotype on the left
 * and sliding panel from the right.
 */
export function FullscreenMenu({ isOpen, onClose }: FullscreenMenuProps) {
  const letters = "CLELAND".split("");
  const navigate = useNavigate();
  const { scrollTo } = useLenisScroll();

  /**
   * Handle navigation - routes vs anchor scrolls
   * Uses chamber gate for Blueprint route
   * Uses Lenis for momentum-based smooth scrolling
   */
  const handleNavClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    e.preventDefault();
    onClose();

    // Wait for menu close animation
    setTimeout(() => {
      if (link.isRoute) {
        navigate(link.href);
      } else if (link.href === "#") {
        scrollTo(0);
      } else {
        scrollTo(link.href);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={onClose}
      />

      {/* Left side: Large animated logotype - right-aligned to hug menu */}
      <motion.div
        className="fixed right-[500px] bottom-16 md:bottom-24 z-[201] pointer-events-none hidden md:block text-right"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Letter-by-letter animation */}
        <div className="flex items-baseline justify-end">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="font-nohemi font-medium tracking-tight text-foreground/10"
              style={{ fontSize: "clamp(4rem, 15vw, 12rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{
                duration: 0.5,
                delay: 0.15 + index * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Sub-copy - increased size */}
        <motion.p
          className="font-nohemi font-medium text-muted-foreground/40 tracking-[0.2em] uppercase mt-2 pr-2"
          style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.1rem)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Digital Design & Automation
        </motion.p>
      </motion.div>

      {/* Right panel */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-card border-l border-border/20 z-[202] overflow-y-auto shadow-[-8px_0_30px_rgba(0,0,0,0.15)]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Editorial grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          aria-hidden="true"
          style={{
            background: `
              linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 flex flex-col min-h-full p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <span className="font-nohemi font-medium text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Menu
            </span>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border/30 hover:border-border transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1">
            <ul className="space-y-6">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + index * 0.06,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="font-nohemi font-medium text-2xl md:text-3xl text-foreground hover:text-accent transition-colors duration-300 block group"
                  >
                    <span className="relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-accent after:origin-left after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Footer section */}
          <div className="pt-12 mt-auto border-t border-border/20 relative">
            {/* Client Portal CTA */}
            <motion.div
              className="mb-8 pb-8 border-b border-border/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-nohemi font-medium text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Existing clients
              </p>
              <a
                href="https://portal.clelandconsultancy.com"
                className="font-nohemi font-medium text-lg text-foreground hover:text-accent transition-colors flex items-center gap-2 group"
              >
                Enter Client Portal
                <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
              <p className="text-xs text-muted-foreground mt-2 opacity-70">
                You're entering your private workspace
              </p>
            </motion.div>

            {/* Contact info */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-nohemi font-medium text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Get in touch
              </p>
              <a
                href="mailto:joshua@clelandconsultancy.com"
                className="font-nohemi font-medium text-foreground hover:text-accent transition-colors"
              >
                joshua@clelandconsultancy.com
              </a>
            </motion.div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border/30 hover:border-accent hover:text-accent transition-colors"
                  aria-label={social.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>

            {/* Location */}
            <motion.div
              className="mt-8 flex items-center gap-4 text-xs font-nohemi font-medium uppercase tracking-wider text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>Aotearoa (NZ)</span>
              <span>
                {new Date().toLocaleTimeString("en-NZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Pacific/Auckland"
                })}
              </span>
            </motion.div>


          </div>
        </div>
      </motion.div>
    </>
  );
}
