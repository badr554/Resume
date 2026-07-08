import type { ResumeContent, TemplateId } from "../../types";
import { ATSSafeTemplate } from "../templates/ATSSafeTemplate";
import { ClassicTemplate } from "../templates/ClassicTemplate";
import { MinimalTemplate } from "../templates/MinimalTemplate";
import { ModernTemplate } from "../templates/ModernTemplate";

interface ResumePreviewProps {
  templateId: TemplateId;
  content: ResumeContent;
  scale?: number;
}

export function TemplateRenderer({ templateId, content }: ResumePreviewProps) {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate content={content} />;
    case "minimal":
      return <MinimalTemplate content={content} />;
    case "ats-safe":
      return <ATSSafeTemplate content={content} />;
    case "modern":
    default:
      return <ModernTemplate content={content} />;
  }
}

/** A4 paper preview with the design file's drop shadow. */
export function ResumePreview({ templateId, content, scale = 1 }: ResumePreviewProps) {
  if (scale === 1) {
    return (
      <div className="shadow-[0_4px_24px_rgba(15,23,42,0.08)]" style={{ width: 794 }}>
        <TemplateRenderer templateId={templateId} content={content} />
      </div>
    );
  }
  return (
    <div style={{ width: 794 * scale, height: 1123 * scale, overflow: "hidden" }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
        <TemplateRenderer templateId={templateId} content={content} />
      </div>
    </div>
  );
}
