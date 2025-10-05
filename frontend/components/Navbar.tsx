"use client";

import React from "react";
import { Play, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Playground" },
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
  ];

  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <nav className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-foreground">NativeX</h1>
        </a>

        {/* Nav Links */}
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

      {/* Profile Avatar Button */}
      <button
        onClick={goToProfile}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground hover:bg-accent transition"
      >
        <User className="w-5 h-5" />
      </button>
    </nav>
  );
}
