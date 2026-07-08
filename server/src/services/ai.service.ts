import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "../middleware/error.middleware";
import type { AtsResult, ResumeContent } from "../types";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("REPLACE")) {
    throw new HttpError(503, "AI is not configured. Set ANTHROPIC_API_KEY on the server.");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/** Strip control characters and cap length before interpolating into prompts. */
function sanitize(input: string, maxLength = 12000): string {
  // eslint-disable-next-line no-control-regex
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

async function complete(system: string, user: string): Promise<string> {
  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new HttpError(502, "AI returned an empty response");
  return block.text;
}

function extractJson<T>(raw: string): T {
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new HttpError(502, "AI response was not valid JSON");
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new HttpError(502, "AI response was not valid JSON");
  }
}

const RESUME_SCHEMA = {
  personalInfo: {
    fullName: "string",
    email: "string",
    phone: "string",
    location: "string",
    linkedin: "string",
    github: "string",
    website: "string",
    summary: "string",
  },
  experience: [
    {
      id: "string",
      company: "string",
      role: "string",
      startDate: "string",
      endDate: "string",
      current: "boolean",
      description: "string (bullet points separated by newlines)",
    },
  ],
  education: [
    {
      id: "string",
      school: "string",
      degree: "string",
      field: "string",
      startDate: "string",
      endDate: "string",
      gpa: "string",
    },
  ],
  skills: [{ id: "string", category: "string", items: ["string"] }],
  projects: [
    { id: "string", name: "string", description: "string", techStack: "string", link: "string" },
  ],
  certifications: [{ id: "string", name: "string", issuer: "string", date: "string" }],
};

const RESUME_WRITER_SYSTEM =
  "You are an expert resume writer and career coach with 15 years of experience. You write resumes that pass ATS systems and impress hiring managers. Always use strong action verbs, quantify achievements where possible, and tailor content to the job. Return ONLY valid JSON matching the schema provided. No explanation, no markdown, no code blocks. Pure JSON only.";

export async function generateResume(
  jobTitle: string,
  jobDescription: string,
  existingData?: ResumeContent
): Promise<ResumeContent> {
  const user = `Generate a professional resume for a ${sanitize(jobTitle, 200)} position.
Job Description: ${sanitize(jobDescription)}
${existingData ? "Existing info to improve: " + JSON.stringify(existingData) : ""}
Return JSON matching this exact schema: ${JSON.stringify(RESUME_SCHEMA)}`;

  const raw = await complete(RESUME_WRITER_SYSTEM, user);
  return extractJson<ResumeContent>(raw);
}

export async function improveSection(
  section: string,
  content: string,
  jobDescription: string
): Promise<string> {
  const system =
    "You are an expert resume writer. Improve the given resume section so it is stronger, uses action verbs, quantifies impact, and matches the job description keywords. Return ONLY the improved text. No explanation, no markdown.";
  const user = `Improve this resume "${sanitize(section, 100)}" section.
Current content: ${sanitize(content)}
Job Description: ${sanitize(jobDescription)}`;
  const raw = await complete(system, user);
  return raw.trim();
}

export async function atsCheck(
  resumeContent: ResumeContent | string,
  jobDescription: string
): Promise<AtsResult> {
  const system =
    "You are an ATS (Applicant Tracking System) expert. Analyze resumes against job descriptions and return precise scoring. Return ONLY valid JSON. No explanation or markdown.";
  const resumeStr = typeof resumeContent === "string" ? resumeContent : JSON.stringify(resumeContent);
  const user = `Analyze this resume against the job description.
Resume: ${resumeStr}
Job Description: ${sanitize(jobDescription)}
Return JSON: { score: number(0-100), matchedKeywords: string[], missingKeywords: string[], suggestions: string[] }`;

  const raw = await complete(system, user);
  const result = extractJson<AtsResult>(raw);
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(result.score) || 0))),
    matchedKeywords: Array.isArray(result.matchedKeywords) ? result.matchedKeywords : [],
    missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
  };
}

export async function generateCoverLetter(
  resumeContent: ResumeContent,
  jobTitle: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  const system =
    "You are a professional cover letter writer. Write compelling, personalized cover letters that get interviews. Never use clichés like 'I am writing to express my interest'. Be confident, specific, and human.";
  const user = `Write a cover letter for ${sanitize(companyName, 200)} for the role of ${sanitize(jobTitle, 200)}. Candidate info: ${JSON.stringify(resumeContent.personalInfo)}. Experience highlights: ${JSON.stringify(resumeContent.experience)}. Job Description: ${sanitize(jobDescription)}. Maximum 4 paragraphs. Professional but warm tone.`;
  const raw = await complete(system, user);
  return raw.trim();
}
