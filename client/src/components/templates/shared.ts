import type { ExperienceEntry, PersonalInfo, ResumeContent } from "../../types";

export interface TemplateProps {
  content: ResumeContent;
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

export function contactLine(info: PersonalInfo): string {
  return [info.email, info.phone, info.location, info.linkedin, info.github, info.website]
    .filter((part) => part && part.trim().length > 0)
    .join("  ·  ");
}

export function dateRange(entry: { startDate: string; endDate: string; current?: boolean }): string {
  const start = entry.startDate?.trim();
  const end = entry.current ? "Present" : entry.endDate?.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

export function bulletsOf(entry: ExperienceEntry): string[] {
  return entry.description
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0);
}
