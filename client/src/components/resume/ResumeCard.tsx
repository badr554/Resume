import type { Resume } from "../../types";
import { atsBadgeColors, timeAgo } from "../../utils/helpers";
import { Badge } from "../ui/Badge";

interface ResumeCardProps {
  resume: Resume;
  onEdit: () => void;
  onDownload: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SKELETON_WIDTHS = ["60%", "40%", "90%", "80%", "85%", "55%"];

export function ResumeCard({ resume, onEdit, onDownload, onDuplicate, onDelete }: ResumeCardProps) {
  const badge = atsBadgeColors(resume.atsScore);
  const templateName =
    resume.templateId === "ats-safe"
      ? "ATS-Safe"
      : resume.templateId.charAt(0).toUpperCase() + resume.templateId.slice(1);

  return (
    <div className="bg-white border border-border rounded-card overflow-hidden flex flex-col transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-[#CBD5E1]">
      <div className="h-[132px] bg-bg border-b border-border px-[18px] py-4 flex flex-col gap-[6px]">
        {SKELETON_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="rounded-[3px]"
            style={{
              width,
              height: i < 2 ? (i === 0 ? 8 : 6) : 5,
              background: i === 0 ? "#CBD5E1" : "#E2E8F0",
              marginBottom: i === 1 ? 6 : 0,
            }}
          />
        ))}
      </div>
      <div className="px-[18px] py-4 flex flex-col gap-[10px] flex-1">
        <div>
          <div className="text-[15px] font-semibold text-text-dark mb-[2px]">{resume.title}</div>
          <div className="text-[12.5px] text-[#94A3B8]">{templateName} template</div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">Edited {timeAgo(resume.updatedAt)}</span>
          <Badge bg={badge.bg} color={badge.color}>
            {resume.atsScore === null ? "— ATS" : `${resume.atsScore} ATS`}
          </Badge>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onEdit}
            className="flex-1 bg-sidebar text-white border-none py-2 rounded-[7px] text-[12.5px] font-semibold cursor-pointer hover:bg-[#1E293B]"
          >
            Edit
          </button>
          <button
            onClick={onDownload}
            className="flex-1 bg-white text-[#334155] border border-border py-2 rounded-[7px] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F1F5F9]"
          >
            Download
          </button>
          <button
            onClick={onDuplicate}
            className="flex-1 bg-white text-[#334155] border border-border py-2 rounded-[7px] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F1F5F9]"
          >
            Duplicate
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-[34px] shrink-0 bg-white text-[#DC2626] border border-border py-2 rounded-[7px] text-[12.5px] font-semibold cursor-pointer hover:bg-badge-red flex items-center justify-center"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
