import type { NextFunction, Request, Response } from "express";
import _pdfParse = require("pdf-parse");
const pdfParse = _pdfParse as any;
import { HttpError } from "../middleware/error.middleware";
import * as aiService from "../services/ai.service";
import type { ResumeContent } from "../types";

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { jobTitle, jobDescription, existingData } = req.body as {
      jobTitle: string;
      jobDescription: string;
      existingData?: ResumeContent;
    };
    const content = await aiService.generateResume(jobTitle, jobDescription, existingData);
    res.json({ content });
  } catch (err) {
    next(err);
  }
}

export async function improveSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { section, content, jobDescription } = req.body as {
      section: string;
      content: string;
      jobDescription: string;
    };
    const improved = await aiService.improveSection(section, content, jobDescription);
    res.json({ improved });
  } catch (err) {
    next(err);
  }
}

export async function atsCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeContent, jobDescription } = req.body as {
      resumeContent: ResumeContent;
      jobDescription: string;
    };
    const result = await aiService.atsCheck(resumeContent, jobDescription);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function coverLetter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resumeContent, jobTitle, jobDescription, companyName } = req.body as {
      resumeContent: ResumeContent;
      jobTitle: string;
      jobDescription: string;
      companyName: string;
    };
    const content = await aiService.generateCoverLetter(
      resumeContent,
      jobTitle,
      jobDescription,
      companyName
    );
    res.json({ content });
  } catch (err) {
    next(err);
  }
}

export async function atsCheckFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { jobDescription } = req.body as { jobDescription: string };

    if (!file) throw new HttpError(400, "No file uploaded");
    if (!jobDescription) throw new HttpError(400, "Job description is required");

    let text = "";
    if (file.mimetype === "text/plain") {
      text = file.buffer.toString("utf-8");
    } else if (file.mimetype === "application/pdf") {
      const parser = new pdfParse.PDFParse({ data: file.buffer });
      const data = await parser.getText();
      text = data.text;
    } else {
      throw new HttpError(400, "Unsupported file format. Please upload a PDF or TXT file.");
    }

    if (!text.trim()) {
      throw new HttpError(400, "The uploaded file contains no readable text.");
    }

    const result = await aiService.atsCheck(text, jobDescription);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
