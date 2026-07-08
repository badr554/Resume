import type { Request, Response } from "express";
import type { TemplateMeta } from "../types";

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Dark navy header with blue accents — clean two-tone layout",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Centered serif header with traditional rules — formal and timeless",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Left-aligned with generous whitespace — subtle and very clean",
  },
  {
    id: "ats-safe",
    name: "ATS-Safe",
    description: "Plain single-column black on white — maximum parse-ability",
  },
];

export function list(_req: Request, res: Response): void {
  res.json({ templates: TEMPLATES });
}
