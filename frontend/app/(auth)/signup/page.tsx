"use client"

import type React from "react"
import { useState } from "react"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    setIsLoading(true)

    // Add your signup logic here
    console.log("Signup:", { username, email, password })

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
            Create account
          </h1>
          <p
            style={{
              color: "#888888",
              fontSize: "1rem",
              lineHeight: "1.5",
            }}
          >
            Get started with your new account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.75rem" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.625rem",
                letterSpacing: "0.01em",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
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

          <div style={{ marginBottom: "1.75rem" }}>
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
              placeholder="Create a password"
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

          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.625rem",
                letterSpacing: "0.01em",
              }}
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
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
            {isLoading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#ffffff",
              fontWeight: "500",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
