import LoginForm  from "@/components/login-form"


export default function Page() {
  return (
    <main className="min-h-dvh grid place-items-center bg-background">
      {/* Decorative background grid */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="h-full w-full opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_10%_10%,var(--color-chart-2)/10%,transparent),radial-gradient(40rem_30rem_at_90%_90%,var(--color-chart-4)/10%,transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
      </div>
      <LoginForm/>
    </main>
  )
}