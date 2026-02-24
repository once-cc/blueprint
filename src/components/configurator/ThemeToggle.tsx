import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'blueprint-theme-preference';

const getSystemTheme = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true; // Default to dark if matchMedia not supported
};

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage or OS preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    let isDarkMode: boolean;

    if (savedTheme) {
      // User has explicitly chosen a theme before
      isDarkMode = savedTheme === 'dark';
    } else {
      // First visit - use OS system preference
      isDarkMode = getSystemTheme();
    }

    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, []);

  // Listen for OS theme changes (only if user hasn't set manual preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        const newIsDark = e.matches;
        setIsDark(newIsDark);
        document.documentElement.classList.toggle('dark', newIsDark);
        document.documentElement.classList.toggle('light', !newIsDark);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Persist user's explicit choice to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');

    // Add transition class for smooth color change
    document.documentElement.classList.add('theme-transitioning');

    document.documentElement.classList.toggle('dark', newIsDark);
    document.documentElement.classList.toggle('light', !newIsDark);

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="
        w-10 h-10 rounded-full flex items-center justify-center
        bg-background/80 backdrop-blur-md border border-border/50
        hover:bg-muted/50 transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-accent" />
        )}
      </motion.div>
    </motion.button>
  );
}
