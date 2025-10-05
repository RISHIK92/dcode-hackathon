"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function Footer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const theme = localStorage.getItem("theme");
    const isDarkMode = theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  return (
    <footer className="h-14 border-t border-border bg-card px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          © 2025 NativeX
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Sun className="w-4 h-4 text-muted-foreground" />
        <Switch checked={isDark} onCheckedChange={toggleTheme} />
        <Moon className="w-4 h-4 text-muted-foreground" />
      </div>
    </footer>
  );
}