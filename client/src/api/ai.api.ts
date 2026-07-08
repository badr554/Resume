import { api } from "./axios";
import type { AtsResult, ResumeContent } from "../types";

export async function generateResume(data: {
  jobTitle: string;
  jobDescription: string;
  existingData?: ResumeContent;
}): Promise<ResumeContent> {
  const res = await api.post<{ content: ResumeContent }>("/ai/generate", data);
  return res.data.content;
}

export async function improveSection(data: {
  section: string;
  content: string;
  jobDescription: string;
}): Promise<string> {
  const res = await api.post<{ improved: string }>("/ai/improve-section", data);
  return res.data.improved;
}

export async function atsCheck(data: {
  resumeContent: ResumeContent;
  jobDescription: string;
}): Promise<AtsResult> {
  const res = await api.post<AtsResult>("/ai/ats-check", data);
  return res.data;
}

export async function generateCoverLetter(data: {
  resumeContent: ResumeContent;
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}): Promise<string> {
  const res = await api.post<{ content: string }>("/ai/cover-letter", data);
  return res.data.content;
}

export async function atsCheckFile(file: File, jobDescription: string): Promise<AtsResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jobDescription", jobDescription);

  const res = await api.post<AtsResult>("/ai/ats-check-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
