"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const username = String(form.get("username") || "")
      const password = String(form.get("password") || "")
      // Replace with your auth call or server action
      await new Promise((r) => setTimeout(r, 800))
      console.log("[v0] Sign in attempt:", { username, password: password ? "********" : "" })
      // Navigate or show toast here
    } finally {
      setLoading(false)
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
          "shadow-[0_20px_50px_-30px_var(--color-chart-2),0_28px_80px_-40px_var(--color-chart-4)]",
        )}
      >
        <Card className="rounded-xl bg-card/90 backdrop-blur-sm border border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-pretty">Welcome Back</CardTitle>
            <CardDescription className="mt-1 text-balance">
              {"Great things are built together. Join a thriving community of creators and collaborators."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    required
                    className="pl-9"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

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
  {loading ? "Signing in..." : "Sign in"}
  <ArrowRight className="ml-2 size-4" aria-hidden />
</Button>


              </div>

              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link
                  href="/signup"
                  className="font-medium underline decoration-[var(--color-chart-2)] underline-offset-4 hover:text-foreground"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}