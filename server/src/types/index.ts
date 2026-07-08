export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillGroup[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
}

export interface AtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}
