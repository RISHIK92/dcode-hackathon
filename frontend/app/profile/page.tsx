import type { Metadata } from "next"
import ProfileCard from "@/components/profile/profile-card"

export const metadata: Metadata = {
  title: "Profile",
  description: "View profile and connect GitHub",
}

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ProfileCard />
      </div>
    </main>
  )
}
