import { api } from "./axios";
import { triggerDownload } from "./resume.api";
import type { CoverLetter } from "../types";

export async function listCoverLetters(): Promise<CoverLetter[]> {
  const res = await api.get<{ coverLetters: CoverLetter[] }>("/cover-letters");
  return res.data.coverLetters;
}

export async function createCoverLetter(data: {
  title: string;
  content: string;
}): Promise<CoverLetter> {
  const res = await api.post<{ coverLetter: CoverLetter }>("/cover-letters", data);
  return res.data.coverLetter;
}

export async function updateCoverLetter(
  id: string,
  data: { title?: string; content?: string }
): Promise<CoverLetter> {
  const res = await api.put<{ coverLetter: CoverLetter }>(`/cover-letters/${id}`, data);
  return res.data.coverLetter;
}

export async function deleteCoverLetter(id: string): Promise<void> {
  await api.delete(`/cover-letters/${id}`);
}

export async function downloadCoverLetterPdf(id: string, title: string): Promise<void> {
  const res = await api.get<Blob>(`/cover-letters/${id}/pdf`, { responseType: "blob" });
  triggerDownload(res.data, `${title}.pdf`);
}
