import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "../middleware/error.middleware";
import type { AtsResult, ResumeContent } from "../types";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// ---------------------------------------------------------------------------
// Provider selection: Anthropic (paid) if configured, otherwise Google Gemini
// (free tier — get a key at https://aistudio.google.com/apikey).
// Set AI_PROVIDER=gemini in .env to force Gemini even when both keys exist.
// ---------------------------------------------------------------------------

function anthropicKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.includes("REPLACE") || key.trim() === "") return null;
  return key;
}

function geminiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("REPLACE") || key.trim() === "") return null;
  return key;
}

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: anthropicKey()! });
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

async function completeAnthropic(system: string, user: string): Promise<string> {
  try {
    const response = await anthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") throw new HttpError(502, "AI returned an empty response");
    return block.text;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    const message = err instanceof Error ? err.message : "";
    if (message.includes("credit balance")) {
      throw new HttpError(
        503,
        "The Anthropic API account has no credits. Add credits at console.anthropic.com, or set a free GEMINI_API_KEY in server/.env instead."
      );
    }
    if (message.includes("401") || message.toLowerCase().includes("authentication")) {
      throw new HttpError(503, "The Anthropic API key is invalid. Check ANTHROPIC_API_KEY in server/.env.");
    }
    console.error("[ai] Anthropic request failed:", message);
    throw new HttpError(502, "The AI service failed to respond. Try again in a moment.");
  }
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  error?: { message?: string; status?: string };
}

async function completeGemini(system: string, user: string): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey()!,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const data = (await res.json()) as GeminiResponse;

  if (!res.ok) {
    const detail = data.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 429) {
      throw new HttpError(429, "The free Gemini API quota was hit — wait a minute and try again.");
    }
    if (res.status === 400 || res.status === 403) {
      throw new HttpError(503, `Gemini API rejected the request: ${detail}. Check GEMINI_API_KEY in server/.env.`);
    }
    console.error("[ai] Gemini request failed:", detail);
    throw new HttpError(502, `Gemini API error: ${detail}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new HttpError(502, "AI returned an empty response");
  return text;
}

async function complete(system: string, user: string): Promise<string> {
  const forced = process.env.AI_PROVIDER?.toLowerCase();
  if (forced === "gemini" && geminiKey()) return completeGemini(system, user);
  if (forced === "anthropic" && anthropicKey()) return completeAnthropic(system, user);

  if (anthropicKey()) return completeAnthropic(system, user);
  if (geminiKey()) return completeGemini(system, user);
  throw new HttpError(
    503,
    "AI is not configured. Set ANTHROPIC_API_KEY or a free GEMINI_API_KEY in server/.env (get one at aistudio.google.com/apikey)."
  );
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
