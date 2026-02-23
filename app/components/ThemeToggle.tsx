"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "tedx-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: ThemeMode = saved ?? (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-6 top-6 z-20 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-black shadow-sm backdrop-blur transition hover:bg-white dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
