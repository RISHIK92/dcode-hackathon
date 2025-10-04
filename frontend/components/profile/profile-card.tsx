"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as UIDialogFooter,
  DialogHeader as UIDialogHeader,
  DialogTitle as UIDialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type GitHubUser = {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  followers: number
  following: number
  public_repos: number
  html_url: string
  blog?: string | null
  location?: string | null
}

export default function ProfileCard() {
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null)
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const initials = useMemo(
    () =>
      ghUser?.name
        ? ghUser.name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "GH",
    [ghUser],
  )

  async function handleConnect() {
    if (!username) return
    setLoading(true)
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error("GitHub user not found")
      const data: GitHubUser = await res.json()
      setGhUser(data)
      setConnected(true)
    } catch (err) {
      console.log("[v0] GitHub connect error:", (err as Error).message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("bg-card text-card-foreground border border-border/60", "relative overflow-hidden")}>
      {/* subtle cyan/pink glow border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+6px)]"
        style={{
          boxShadow:
            "0 0 120px 10px color-mix(in oklab, var(--color-chart-2) 30%, transparent), 0 0 120px 10px color-mix(in oklab, var(--color-chart-4) 20%, transparent)",
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="text-balance text-2xl">Profile</CardTitle>
        <CardDescription className="text-muted-foreground">
          View your details and connect your GitHub account.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 ring-1 ring-border/60">
            {ghUser?.avatar_url ? (
              <AvatarImage alt="Profile avatar" src={ghUser.avatar_url || "/placeholder.svg"} />
            ) : (
              <AvatarImage alt="Profile avatar" src="/placeholder-user.jpg" />
            )}
            <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
          </Avatar>

          <div className="grid gap-1">
            <div className="text-lg font-medium">{ghUser?.name || "Your Name"}</div>
            <div className="text-sm text-muted-foreground">{ghUser?.login ? `@${ghUser.login}` : "@username"}</div>
            <p className="text-sm text-pretty text-muted-foreground mt-2">
              {ghUser?.bio || "Connect your GitHub to pull your public profile, projects, and more."}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 max-w-xs">
              <Stat label="Projects" value={ghUser?.public_repos ?? 0} />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">Theme: Black-centric using tokens</div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                // base
                "relative",
                "bg-transparent text-foreground",
                // gradient outline using before element
                "before:absolute before:inset-0 before:rounded-[calc(var(--radius)+2px)]",
                "before:p-[1px] before:bg-[conic-gradient(from_180deg,theme(colors.chart.2),_theme(colors.chart.4),_theme(colors.chart.2))]",
                "before:-z-10",
                // inner background to keep black theme
                "after:absolute after:inset-[2px] after:rounded-[calc(var(--radius)-2px)] after:bg-background after:-z-10",
                // hover/focus
                "transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-chart-2/60",
              )}
            >
              {connected ? "Connected" : "Connect GitHub"}
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-card text-card-foreground border-border">
            {connected ? (
              <>
                <UIDialogHeader>
                  <UIDialogTitle className="flex items-center gap-2">
                    <CheckIcon className="size-5 text-chart-2" />
                    Connected
                  </UIDialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {ghUser?.login ? `Connected as @${ghUser.login}.` : "You're now connected."}
                  </DialogDescription>
                </UIDialogHeader>
                <UIDialogFooter>
                  <Button
                    onClick={() => setOpen(false)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Close
                  </Button>
                  {ghUser?.html_url && (
                    <Button
                      asChild
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <a href={ghUser.html_url} target="_blank" rel="noopener noreferrer">
                        Open GitHub
                      </a>
                    </Button>
                  )}
                </UIDialogFooter>
              </>
            ) : (
              <>
                <UIDialogHeader>
                  <UIDialogTitle>Connect your GitHub</UIDialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter your GitHub username. We’ll fetch public info to display on your profile.
                  </DialogDescription>
                </UIDialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="gh-username">GitHub Username</Label>
                    <Input
                      id="gh-username"
                      placeholder="octocat"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="bg-background"
                    />
                  </div>
                </div>

                <UIDialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={loading || !username}
                    className={cn(
                      "relative",
                      "bg-transparent text-foreground",
                      "before:absolute before:inset-0 before:rounded-[calc(var(--radius)+2px)]",
                      "before:p-[1px] before:bg-[conic-gradient(from_180deg,theme(colors.chart.2),_theme(colors.chart.4),_theme(colors.chart.2))]",
                      "before:-z-10",
                      "after:absolute after:inset-[2px] after:rounded-[calc(var(--radius)-2px)] after:bg-background after:-z-10",
                      "hover:text-primary focus-visible:ring-2 focus-visible:ring-chart-2/60",
                    )}
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </Button>
                </UIDialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3 text-center">
      <div className="text-lg font-medium">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" role="img" {...props} className={cn("inline-block", props.className)}>
      <path fill="currentColor" d="M9.55 16.1 5.4 12l-1.4 1.4 5.55 5.6L20.05 8.9 18.65 7.5z" />
    </svg>
  )
}
