import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../services/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

/**
 * Middleware to verify JWT and attach user to the request object.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using the secret key
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true },
      });

      if (!user) {
        return res.status(401).json({ error: "No user found with this token" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Not authorized, token failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token." });
  }
};
