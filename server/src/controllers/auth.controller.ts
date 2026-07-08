import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  clearRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
  signAccessToken,
  verifyRefreshToken,
} from "../lib/tokens";
import { HttpError } from "../middleware/error.middleware";

const SALT_ROUNDS = 12;

interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

function toPublicUser(user: { id: string; name: string; email: string; createdAt: Date }): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "An account with this email already exists");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    setRefreshCookie(res, user.id);
    res.status(201).json({ user: toPublicUser(user), accessToken: signAccessToken(user.id) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new HttpError(401, "Invalid email or password");

    setRefreshCookie(res, user.id);
    res.json({ user: toPublicUser(user), accessToken: signAccessToken(user.id) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (!token) throw new HttpError(401, "No refresh token");

    const userId = verifyRefreshToken(token);
    if (!userId) throw new HttpError(401, "Invalid refresh token");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(401, "User no longer exists");

    setRefreshCookie(res, user.id);
    res.json({ accessToken: signAccessToken(user.id) });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  clearRefreshCookie(res);
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(404, "User not found");
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email } = req.body as { name: string; email: string };

    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash && clash.id !== req.user!.id) throw new HttpError(409, "Email is already in use");

    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { name, email } });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new HttpError(404, "User not found");

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new HttpError(401, "Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    clearRefreshCookie(res);
    res.json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
}
