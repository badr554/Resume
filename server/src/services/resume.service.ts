import type { Prisma, Resume } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error.middleware";
import type { ResumeContent } from "../types";

export function emptyResumeContent(): ResumeContent {
  return {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

export async function listResumes(userId: string): Promise<Resume[]> {
  return prisma.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function getOwnedResume(userId: string, resumeId: string): Promise<Resume> {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) throw new HttpError(404, "Resume not found");
  if (resume.userId !== userId) throw new HttpError(403, "You do not have access to this resume");
  return resume;
}

export async function createResume(
  userId: string,
  data: { title?: string; templateId?: string; content?: ResumeContent }
): Promise<Resume> {
  return prisma.resume.create({
    data: {
      userId,
      title: data.title ?? "Untitled Resume",
      templateId: data.templateId ?? "modern",
      content: (data.content ?? emptyResumeContent()) as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function updateResume(
  userId: string,
  resumeId: string,
  data: { title?: string; templateId?: string; content?: ResumeContent; atsScore?: number }
): Promise<Resume> {
  await getOwnedResume(userId, resumeId);
  return prisma.resume.update({
    where: { id: resumeId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.templateId !== undefined ? { templateId: data.templateId } : {}),
      ...(data.atsScore !== undefined ? { atsScore: data.atsScore } : {}),
      ...(data.content !== undefined
        ? { content: data.content as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });
}

export async function deleteResume(userId: string, resumeId: string): Promise<void> {
  await getOwnedResume(userId, resumeId);
  await prisma.resume.delete({ where: { id: resumeId } });
}

export async function duplicateResume(userId: string, resumeId: string): Promise<Resume> {
  const original = await getOwnedResume(userId, resumeId);
  return prisma.resume.create({
    data: {
      userId,
      title: `${original.title} (Copy)`,
      templateId: original.templateId,
      atsScore: original.atsScore,
      content: original.content as Prisma.InputJsonValue,
    },
  });
}
