import { useState, type ReactNode } from "react";
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeContent,
  SkillGroup,
} from "../../types";
import { newId } from "../../utils/helpers";
import { Input, Textarea } from "../ui/Input";

interface ResumeFormProps {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
}

interface SectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  last?: boolean;
}

function Section({ title, open, onToggle, children, last = false }: SectionProps) {
  return (
    <div className={`border border-border rounded-[10px] overflow-hidden ${last ? "" : "mb-3"}`}>
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-[13px] cursor-pointer bg-bg"
      >
        <span className="text-sm font-semibold">{title}</span>
        <span
          className="inline-block text-[#94A3B8] text-base transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
      </div>
      {open && <div className="p-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

function EntryCard({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="border border-[#F1F5F9] rounded-lg p-3 flex flex-col gap-3 relative">
      <button
        onClick={onRemove}
        title="Remove"
        className="absolute top-2 right-2 bg-transparent border-none text-[#94A3B8] hover:text-[#DC2626] cursor-pointer text-sm leading-none p-1"
      >
        ✕
      </button>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border border-dashed border-[#CBD5E1] text-text-gray rounded-[7px] py-[9px] text-[12.5px] font-semibold cursor-pointer hover:border-primary hover:text-primary"
    >
      + {label}
    </button>
  );
}

export function ResumeForm({ content, onChange }: ResumeFormProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    education: false,
    skills: false,
    projects: false,
    certifications: false,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const patchPersonal = (field: keyof ResumeContent["personalInfo"], value: string) =>
    onChange({ ...content, personalInfo: { ...content.personalInfo, [field]: value } });

  const patchList = <K extends "experience" | "education" | "skills" | "projects" | "certifications">(
    key: K,
    list: ResumeContent[K]
  ) => onChange({ ...content, [key]: list });

  const updateAt = <T,>(list: T[], index: number, patch: Partial<T>): T[] =>
    list.map((item, i) => (i === index ? { ...item, ...patch } : item));

  const removeAt = <T,>(list: T[], index: number): T[] => list.filter((_, i) => i !== index);

  return (
    <div>
      <Section title="Personal Info" open={openSections.personal} onToggle={() => toggle("personal")}>
        <Input label="Full Name" value={content.personalInfo.fullName} onChange={(e) => patchPersonal("fullName", e.target.value)} />
        <Input label="Email" type="email" value={content.personalInfo.email} onChange={(e) => patchPersonal("email", e.target.value)} />
        <Input label="Phone" value={content.personalInfo.phone} onChange={(e) => patchPersonal("phone", e.target.value)} />
        <Input label="Location" value={content.personalInfo.location} onChange={(e) => patchPersonal("location", e.target.value)} />
        <Input label="LinkedIn" value={content.personalInfo.linkedin} onChange={(e) => patchPersonal("linkedin", e.target.value)} />
        <Input label="GitHub" value={content.personalInfo.github} onChange={(e) => patchPersonal("github", e.target.value)} />
        <Input label="Website" value={content.personalInfo.website} onChange={(e) => patchPersonal("website", e.target.value)} />
        <Textarea label="Summary" className="h-[90px]" value={content.personalInfo.summary} onChange={(e) => patchPersonal("summary", e.target.value)} />
      </Section>

      <Section title="Work Experience" open={openSections.experience} onToggle={() => toggle("experience")}>
        {content.experience.map((job, i) => (
          <EntryCard key={job.id} onRemove={() => patchList("experience", removeAt(content.experience, i))}>
            <Input label="Role" value={job.role} onChange={(e) => patchList("experience", updateAt(content.experience, i, { role: e.target.value }))} />
            <Input label="Company" value={job.company} onChange={(e) => patchList("experience", updateAt(content.experience, i, { company: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" placeholder="Jan 2022" value={job.startDate} onChange={(e) => patchList("experience", updateAt(content.experience, i, { startDate: e.target.value }))} />
              <Input label="End Date" placeholder="Present" value={job.endDate} disabled={job.current} onChange={(e) => patchList("experience", updateAt(content.experience, i, { endDate: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-xs text-text-gray font-semibold cursor-pointer">
              <input type="checkbox" checked={job.current} onChange={(e) => patchList("experience", updateAt(content.experience, i, { current: e.target.checked }))} className="accent-[#3B82F6]" />
              I currently work here
            </label>
            <Textarea label="Description (one bullet per line)" className="h-[84px]" value={job.description} onChange={(e) => patchList("experience", updateAt(content.experience, i, { description: e.target.value }))} />
          </EntryCard>
        ))}
        <AddButton label="Add Position" onClick={() => patchList("experience", [...content.experience, { id: newId(), company: "", role: "", startDate: "", endDate: "", current: false, description: "" } satisfies ExperienceEntry])} />
      </Section>

      <Section title="Education" open={openSections.education} onToggle={() => toggle("education")}>
        {content.education.map((edu, i) => (
          <EntryCard key={edu.id} onRemove={() => patchList("education", removeAt(content.education, i))}>
            <Input label="School" value={edu.school} onChange={(e) => patchList("education", updateAt(content.education, i, { school: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Degree" placeholder="BSc" value={edu.degree} onChange={(e) => patchList("education", updateAt(content.education, i, { degree: e.target.value }))} />
              <Input label="Field" placeholder="Computer Science" value={edu.field} onChange={(e) => patchList("education", updateAt(content.education, i, { field: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" placeholder="2013" value={edu.startDate} onChange={(e) => patchList("education", updateAt(content.education, i, { startDate: e.target.value }))} />
              <Input label="End Date" placeholder="2017" value={edu.endDate} onChange={(e) => patchList("education", updateAt(content.education, i, { endDate: e.target.value }))} />
            </div>
            <Input label="GPA (optional)" value={edu.gpa} onChange={(e) => patchList("education", updateAt(content.education, i, { gpa: e.target.value }))} />
          </EntryCard>
        ))}
        <AddButton label="Add Education" onClick={() => patchList("education", [...content.education, { id: newId(), school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" } satisfies EducationEntry])} />
      </Section>

      <Section title="Skills" open={openSections.skills} onToggle={() => toggle("skills")}>
        {content.skills.map((group, i) => (
          <EntryCard key={group.id} onRemove={() => patchList("skills", removeAt(content.skills, i))}>
            <Input label="Category" placeholder="Languages" value={group.category} onChange={(e) => patchList("skills", updateAt(content.skills, i, { category: e.target.value }))} />
            <Input
              label="Skills (comma separated)"
              placeholder="TypeScript, React, Node.js"
              value={group.items.join(", ")}
              onChange={(e) =>
                patchList(
                  "skills",
                  updateAt(content.skills, i, {
                    items: e.target.value.split(",").map((s) => s.trimStart()),
                  })
                )
              }
            />
            {group.items.filter((s) => s.trim()).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {group.items
                  .filter((s) => s.trim())
                  .map((skill, j) => (
                    <span key={j} className="bg-badge-blue text-primary text-xs font-semibold px-3 py-[6px] rounded-full">
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            )}
          </EntryCard>
        ))}
        <AddButton label="Add Skill Group" onClick={() => patchList("skills", [...content.skills, { id: newId(), category: "", items: [] } satisfies SkillGroup])} />
      </Section>

      <Section title="Projects" open={openSections.projects} onToggle={() => toggle("projects")}>
        {content.projects.map((project, i) => (
          <EntryCard key={project.id} onRemove={() => patchList("projects", removeAt(content.projects, i))}>
            <Input label="Name" value={project.name} onChange={(e) => patchList("projects", updateAt(content.projects, i, { name: e.target.value }))} />
            <Textarea label="Description" className="h-[64px]" value={project.description} onChange={(e) => patchList("projects", updateAt(content.projects, i, { description: e.target.value }))} />
            <Input label="Tech Stack" placeholder="React, Express, MySQL" value={project.techStack} onChange={(e) => patchList("projects", updateAt(content.projects, i, { techStack: e.target.value }))} />
            <Input label="Link" placeholder="github.com/you/project" value={project.link} onChange={(e) => patchList("projects", updateAt(content.projects, i, { link: e.target.value }))} />
          </EntryCard>
        ))}
        <AddButton label="Add Project" onClick={() => patchList("projects", [...content.projects, { id: newId(), name: "", description: "", techStack: "", link: "" } satisfies ProjectEntry])} />
      </Section>

      <Section title="Certifications" open={openSections.certifications} onToggle={() => toggle("certifications")} last>
        {content.certifications.map((cert, i) => (
          <EntryCard key={cert.id} onRemove={() => patchList("certifications", removeAt(content.certifications, i))}>
            <Input label="Name" value={cert.name} onChange={(e) => patchList("certifications", updateAt(content.certifications, i, { name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issuer" value={cert.issuer} onChange={(e) => patchList("certifications", updateAt(content.certifications, i, { issuer: e.target.value }))} />
              <Input label="Date" placeholder="2024" value={cert.date} onChange={(e) => patchList("certifications", updateAt(content.certifications, i, { date: e.target.value }))} />
            </div>
          </EntryCard>
        ))}
        <AddButton label="Add Certification" onClick={() => patchList("certifications", [...content.certifications, { id: newId(), name: "", issuer: "", date: "" } satisfies CertificationEntry])} />
      </Section>
    </div>
  );
}
