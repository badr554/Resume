import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import { generateCoverLetterPdf } from "../services/pdf.service";

async function getOwned(userId: string, id: string) {
  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter) throw new HttpError(404, "Cover letter not found");
  if (letter.userId !== userId) throw new HttpError(403, "You do not have access to this cover letter");
  return letter;
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ coverLetters });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content } = req.body as { title: string; content: string };
    const coverLetter = await prisma.coverLetter.create({
      data: { userId: req.user!.id, title, content },
    });
    res.status(201).json({ coverLetter });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content } = req.body as { title?: string; content?: string };
    await getOwned(req.user!.id, req.params.id);
    const coverLetter = await prisma.coverLetter.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
      },
    });
    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await getOwned(req.user!.id, req.params.id);
    await prisma.coverLetter.delete({ where: { id: req.params.id } });
    res.json({ message: "Cover letter deleted" });
  } catch (err) {
    next(err);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const letter = await getOwned(req.user!.id, req.params.id);
    const pdf = await generateCoverLetterPdf(letter.title, letter.content);
    const safeTitle = letter.title.replace(/[^\w\- ]/g, "").trim() || "cover-letter";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}
