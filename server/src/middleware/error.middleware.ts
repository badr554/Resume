import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[error]", err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
  });
}
