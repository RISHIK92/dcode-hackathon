import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Code, Zap, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-primary-foreground" fill="currentColor" />
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Code React Native.
            <br />
            <span className="text-primary">See it Live.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Write, edit, and preview React Native code instantly in your browser.
            No setup required. Just code and see results in real-time.
          </p>

          {/* CTA Button */}
          <Link href="/playground">
            <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
              <Play className="w-5 h-5" />
              Get Started
            </Button>
          </Link>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Monaco Editor</h3>
              <p className="text-sm text-muted-foreground">
                Powerful code editing with syntax highlighting, auto-completion, and more.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Preview</h3>
              <p className="text-sm text-muted-foreground">
                See your changes in real-time with React Native Web rendering.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone Emulator</h3>
              <p className="text-sm text-muted-foreground">
                Preview your app in a realistic phone frame with light/dark modes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}