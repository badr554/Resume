import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as resumeApi from "../api/resume.api";
import { apiErrorMessage } from "../api/axios";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import type { TemplateId } from "../types";

interface TemplateItem {
  id: TemplateId;
  name: string;
  tag: string;
  description: string;
  headerBarBg: string;
  borderTop?: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "modern",
    name: "Modern",
    tag: "Popular",
    description: "Dark navy header with blue accents — clean two-tone layout",
    headerBarBg: "#0F172A",
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Formal & timeless",
    description: "Centered serif header with traditional rules — formal and timeless",
    headerBarBg: "#FFFFFF",
    borderTop: "4px solid #0F172A",
  },
  {
    id: "minimal",
    name: "Minimal",
    tag: "Subtle & clean",
    description: "Left-aligned with generous whitespace — subtle and very clean",
    headerBarBg: "#FFFFFF",
  },
  {
    id: "ats-safe",
    name: "ATS-Safe",
    tag: "Plain-text friendly",
    description: "Plain single-column black on white — maximum parse-ability",
    headerBarBg: "#FFFFFF",
  },
];

export function Templates() {
  const navigate = useNavigate();
  const [creatingId, setCreatingId] = useState<TemplateId | null>(null);

  const handleUse = async (templateId: TemplateId) => {
    setCreatingId(templateId);
    try {
      const resume = await resumeApi.createResume({
        title: `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Resume`,
        templateId,
      });
      toast.success("Resume created!");
      navigate(`/resumes/${resume.id}/edit`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="px-11 py-9 max-w-[1280px]">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold m-0 mb-[6px] tracking-[-0.02em]">Templates</h1>
        <p className="m-0 text-text-gray text-[14.5px]">
          Choose a starting point &mdash; fully editable after you pick one
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
        {TEMPLATES.map((tpl) => (
          <Card
            key={tpl.id}
            className="group relative overflow-hidden flex flex-col h-full hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-[#CBD5E1] transition-all cursor-pointer"
            onClick={() => void handleUse(tpl.id)}
          >
            {/* Template Visual Mockup */}
            <div className="h-[200px] bg-[#F1F5F9] p-[14px] flex flex-col gap-2 relative">
              <div
                style={{
                  width: "45%",
                  height: "16px",
                  borderRadius: "3px",
                  background: tpl.headerBarBg,
                  borderTop: tpl.borderTop || "none",
                }}
              />
              <div className="w-[70%] h-[7px] rounded-[3px] bg-[#CBD5E1] mt-1" />
              <div className="w-[50%] h-[6px] rounded-[3px] bg-border" />
              <div className="w-[95%] h-[5px] rounded-[3px] bg-border mt-[6px]" />
              <div className="w-[88%] h-[5px] rounded-[3px] bg-border" />
              <div className="w-[92%] h-[5px] rounded-[3px] bg-border" />
              <div className="w-[60%] h-[5px] rounded-[3px] bg-border" />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.55)] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150 pb-[68px]">
              <Button
                variant="secondary"
                disabled={creatingId !== null}
                className="bg-white text-text-dark hover:bg-[#F8FAFC]"
              >
                {creatingId === tpl.id ? "Creating..." : "Use Template"}
              </Button>
            </div>

            {/* Template Info Footer */}
            <div className="p-[14px] border-t border-border flex flex-col justify-between flex-1 bg-white">
              <div>
                <div className="text-[14.5px] font-semibold text-text-dark">{tpl.name}</div>
                <div className="text-xs text-[#94A3B8] mt-[2px] mb-2">{tpl.tag}</div>
              </div>
              <p className="text-xs text-text-gray m-0 leading-normal">{tpl.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
