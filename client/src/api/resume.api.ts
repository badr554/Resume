import { api } from "./axios";
import type { Resume, ResumeContent, TemplateId } from "../types";

export async function listResumes(): Promise<Resume[]> {
  const res = await api.get<{ resumes: Resume[] }>("/resumes");
  return res.data.resumes;
}

export async function getResume(id: string): Promise<Resume> {
  const res = await api.get<{ resume: Resume }>(`/resumes/${id}`);
  return res.data.resume;
}

export async function createResume(data: {
  title?: string;
  templateId?: TemplateId;
  content?: ResumeContent;
}): Promise<Resume> {
  const res = await api.post<{ resume: Resume }>("/resumes", data);
  return res.data.resume;
}

export async function updateResume(
  id: string,
  data: {
    title?: string;
    templateId?: TemplateId;
    content?: ResumeContent;
    atsScore?: number;
  }
): Promise<Resume> {
  const res = await api.put<{ resume: Resume }>(`/resumes/${id}`, data);
  return res.data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`);
}

export async function duplicateResume(id: string): Promise<Resume> {
  const res = await api.post<{ resume: Resume }>(`/resumes/${id}/duplicate`);
  return res.data.resume;
}

export async function downloadResumePdf(id: string, title: string): Promise<void> {
  const res = await api.get<Blob>(`/resumes/${id}/pdf`, { responseType: "blob" });
  triggerDownload(res.data, `${title}.pdf`);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
