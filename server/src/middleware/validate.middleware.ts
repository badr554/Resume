import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    res.status(400).json({ message: first.msg, errors: errors.array() });
    return;
  }
  next();
}
