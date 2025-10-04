import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- INITIALIZATION ---
const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key"; // IMPORTANT: Use a real secret from .env

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// --- ROUTES ---

/**
 * ========================================
 *          SIGNUP ROUTE
 * ========================================
 * Creates a new user account.
 * Path: POST /api/auth/signup
 * Body: { "username": "string", "email": "string", "password": "string" }
 */
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists." });
    }

    // 3. Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Create the new user in the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 5. Generate a JWT for the new user
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    // 6. Send success response with the token
    return res.status(201).json({
      message: "User created successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * ========================================
 *           LOGIN ROUTE
 * ========================================
 * Authenticates a user and returns a token.
 * Path: POST /api/auth/login
 * Body: { "email": "string", "password": "string" }
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 2. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." }); // Generic error
    }

    // 3. Compare the submitted password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 4. Generate a JWT for the authenticated user
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Send success response with the token
    return res.status(200).json({
      message: "Logged in successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
