"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/playground", label: "Playground" },
    { href: "/docs", label: "Docs" },
    { href: "/about", label: "About" },
  ];

  const handleRunCode = () => {
    if (typeof window !== "undefined" && (window as any).runPlaygroundCode) {
      (window as any).runPlaygroundCode();
    }
  };

  return (
    <nav className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-foreground">RNLive</h1>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Run Button (visible only on playground) */}
      {pathname === "/playground" && (
        <Button onClick={handleRunCode} className="gap-2" size="default">
          <Play className="w-4 h-4" />
          Run
        </Button>
      )}
    </nav>
  );
}