"use client"

import type React from "react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Add your login logic here
    console.log("Login:", { email, password })

    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#000000",
          padding: "3rem 2.5rem",
          border: "1px solid #1a1a1a",
          borderRadius: "4px",
        }}
      >
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              color: "#888888",
              fontSize: "1rem",
              lineHeight: "1.5",
            }}
          >
            Sign in to continue to your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.625rem",
                letterSpacing: "0.01em",
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                border: "1px solid #1a1a1a",
                borderRadius: "4px",
                fontSize: "1rem",
                color: "#ffffff",
                backgroundColor: "#000000",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333333")}
              onBlur={(e) => (e.target.style.borderColor = "#1a1a1a")}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.625rem",
                letterSpacing: "0.01em",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                border: "1px solid #1a1a1a",
                borderRadius: "4px",
                fontSize: "1rem",
                color: "#ffffff",
                backgroundColor: "#000000",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#333333")}
              onBlur={(e) => (e.target.style.borderColor = "#1a1a1a")}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "2rem",
            }}
          >
            <a
              href="#"
              style={{
                fontSize: "0.875rem",
                color: "#888888",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.875rem",
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "opacity 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = "1")}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid #1a1a1a",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#888888",
          }}
        >
          Don't have an account?{" "}
          <a
            href="/signup"
            style={{
              color: "#ffffff",
              fontWeight: "500",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Create account
          </a>
        </div>
      </div>
    </div>
  )
}
