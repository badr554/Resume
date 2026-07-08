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

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** "2 days ago" style relative date for dashboard cards. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** ATS badge colors: green >75, yellow 51-75, red <=50 (matches design file). */
export function atsBadgeColors(score: number | null): { bg: string; color: string } {
  if (score === null) return { bg: "#F1F5F9", color: "#64748B" };
  if (score > 75) return { bg: "#ECFDF5", color: "#059669" };
  if (score > 50) return { bg: "#FFFBEB", color: "#B45309" };
  return { bg: "#FEF2F2", color: "#DC2626" };
}

/** Gauge color for the ATS checker score circle. */
export function atsGaugeColor(score: number): string {
  if (score > 75) return "#059669";
  if (score > 50) return "#3B82F6";
  return "#DC2626";
}

export function atsScoreLabel(score: number): { text: string; bg: string; color: string } {
  if (score > 75) return { text: "Great Match — You're ATS Ready", bg: "#ECFDF5", color: "#059669" };
  if (score > 50)
    return { text: "Good Match — Room to Improve", bg: "#FFFBEB", color: "#B45309" };
  return { text: "Weak Match — Needs Work", bg: "#FEF2F2", color: "#DC2626" };
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
