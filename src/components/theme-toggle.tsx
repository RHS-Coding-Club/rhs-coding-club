"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type ThemeToggleProps = React.ComponentProps<typeof Button>;

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Check if browser supports View Transitions API
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Get button position for ripple origin
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const root = document.documentElement;
    root.style.setProperty("--x", `${x}px`);
    root.style.setProperty("--y", `${y}px`);

    // Use View Transitions API for smooth ripple effect
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    // Ensure the transition completes properly
    transition.ready.catch(() => {
      // Fallback if transition fails
      setTheme(newTheme);
    });
  };

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="icon"
        className={cn("cursor-pointer self-center", className)} 
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  // Determine the actual current theme (accounting for system preference)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <Button 
      variant="outline" 
      size="icon"
      className={cn("cursor-pointer relative overflow-hidden self-center", className)} 
      {...props} 
      onClick={handleThemeToggle}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -30, rotate: -90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: 30, rotate: 90, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut",
              rotate: { duration: 0.4, ease: "backOut" }
            }}
            className="absolute"
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -30, rotate: -180, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, rotate: 180, opacity: 0, scale: 0.6 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut",
              scale: { duration: 0.4, ease: "backOut" },
              rotate: { duration: 0.5, ease: "backOut" }
            }}
            className="absolute"
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}