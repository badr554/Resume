import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const userId = verifyAccessToken(token);
  if (!userId) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  req.user = { id: userId };
  next();
}
