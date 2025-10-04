"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Navbar() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    // In a non-Next.js environment, we get the pathname from the window object.
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Playground" },
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo - Replaced Next's Link with a standard <a> tag */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-foreground">RNLive</h1>
        </a>

        {/* Nav Links - Replaced Next's Link with standard <a> tags */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Profile Avatar */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
        S
      </div>
    </nav>
  );
}

