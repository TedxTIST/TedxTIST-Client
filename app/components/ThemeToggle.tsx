"use client";

import { useEffect, useState } from "react";
import Button from "./Button";

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
    <Button
      variant="toggle"
      onClick={toggleTheme}
      className="fixed right-6 top-6 z-20"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
