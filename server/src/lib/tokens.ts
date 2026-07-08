import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

const ACCESS_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
const REFRESH_COOKIE = "refreshToken";
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function accessSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

function refreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not set");
  return secret;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, accessSecret(), { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, refreshSecret(), { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, accessSecret());
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, refreshSecret());
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE_MS,
  };
}

export function setRefreshCookie(res: Response, userId: string): void {
  res.cookie(REFRESH_COOKIE, signRefreshToken(userId), refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
}

export { REFRESH_COOKIE };
