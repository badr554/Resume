import type { NextFunction, Request, Response } from "express";
import * as resumeService from "../services/resume.service";
import { generateResumePdf } from "../services/pdf.service";
import type { ResumeContent } from "../types";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resumes = await resumeService.listResumes(req.user!.id);
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, templateId, content } = req.body as {
      title?: string;
      templateId?: string;
      content?: ResumeContent;
    };
    const resume = await resumeService.createResume(req.user!.id, { title, templateId, content });
    res.status(201).json({ resume });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resume = await resumeService.getOwnedResume(req.user!.id, req.params.id);
    res.json({ resume });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, templateId, content, atsScore } = req.body as {
      title?: string;
      templateId?: string;
      content?: ResumeContent;
      atsScore?: number;
    };
    const resume = await resumeService.updateResume(req.user!.id, req.params.id, {
      title,
      templateId,
      content,
      atsScore,
    });
    res.json({ resume });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resumeService.deleteResume(req.user!.id, req.params.id);
    res.json({ message: "Resume deleted" });
  } catch (err) {
    next(err);
  }
}

export async function duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resume = await resumeService.duplicateResume(req.user!.id, req.params.id);
    res.status(201).json({ resume });
  } catch (err) {
    next(err);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resume = await resumeService.getOwnedResume(req.user!.id, req.params.id);
    const pdf = await generateResumePdf(
      resume.templateId,
      resume.content as unknown as ResumeContent
    );
    const safeTitle = resume.title.replace(/[^\w\- ]/g, "").trim() || "resume";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}
