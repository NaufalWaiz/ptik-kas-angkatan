/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "kas_theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [mounted, setMounted] = useState(false);
  const icons = theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setTheme(getInitialTheme());
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        className="rounded-2xl border-border/70 bg-background/80 shadow-inner shadow-black/10"
        disabled
      >
        <span className="h-4 w-4 rounded-full bg-muted" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="rounded-2xl border-border/70 bg-background/80 shadow-inner shadow-black/10"
      onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
    >
      {icons}
    </Button>
  );
}
