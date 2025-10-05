"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);
      const username = String(form.get("name") || ""); // Use 'name' field as username
      const email = String(form.get("email") || "");
      const password = String(form.get("password") || "");

      const response = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Handle successful signup
      console.log("Signup successful:", data);
      localStorage.setItem("token", data.token);

      // Redirect to dashboard or another page
      router.push("/");
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md px-4">
      {/* Outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[calc(var(--radius-lg)+1rem)] blur-2xl opacity-70
        bg-[radial-gradient(60%_70%_at_20%_10%,var(--color-chart-2)/35%,transparent_60%),radial-gradient(60%_70%_at_80%_90%,var(--color-chart-4)/30%,transparent_60%)]"
      />
      {/* Gradient border wrapper */}
      <div
        className={cn(
          "rounded-xl p-[1px]",
          "bg-[linear-gradient(120deg,var(--color-chart-2),transparent,var(--color-chart-4))]",
          "shadow-[0_20px_50px_-30px_var(--color-chart-2),0_28px_80px_-40px_var(--color-chart-4)]"
        )}
      >
        <Card className="rounded-xl bg-card/90 backdrop-blur-sm border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-pretty">
              Create Account
            </CardTitle>
            <CardDescription className="mt-1 text-balance">
              {
                "Join our community of creators and collaborators to get started."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Doe"
                    required
                    className="pl-9"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    className="pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full justify-center",
                    "rounded-xl px-4 py-2 font-medium",
                    "bg-black text-white",
                    "border border-black",
                    "transition-all duration-300 ease-out",
                    "hover:bg-white hover:text-black hover:shadow-lg",
                    "disabled:opacity-70 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? "Creating..." : "Create account"}
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {"Already have an account? "}
                <Link
                  href="/login"
                  className="font-medium underline decoration-[var(--color-chart-2)] underline-offset-4 hover:text-foreground"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
