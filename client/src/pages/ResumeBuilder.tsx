import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { apiErrorMessage } from "../api/axios";
import * as resumeApi from "../api/resume.api";
import { AIModal } from "../components/resume/AIModal";
import { ResumeForm } from "../components/resume/ResumeForm";
import { ResumePreview } from "../components/resume/ResumePreview";
import { useAutoSave } from "../hooks/useAutoSave";
import { useResumeStore } from "../store/resume.store";
import type { ResumeContent, TemplateId } from "../types";

const TEMPLATE_TABS: { id: TemplateId; name: string }[] = [
  { id: "modern", name: "Modern" },
  { id: "classic", name: "Classic" },
  { id: "minimal", name: "Minimal" },
  { id: "ats-safe", name: "ATS-Safe" },
];

const SAVE_LABELS = { saved: "Saved", saving: "Saving...", unsaved: "Unsaved changes" } as const;
const SAVE_COLORS = { saved: "#059669", saving: "#B45309", unsaved: "#94A3B8" } as const;

export function ResumeBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, setCurrent, patchCurrent } = useResumeStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveStatus = useAutoSave(current);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const resume = await resumeApi.getResume(id);
        if (!cancelled) setCurrent(resume);
      } catch (err) {
        if (!cancelled) {
          toast.error(apiErrorMessage(err));
          navigate("/dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      setCurrent(null);
    };
  }, [id, setCurrent, navigate]);

  if (loading || !current) {
    return (
      <div className="h-full flex items-center justify-center text-text-gray text-sm">
        Loading resume...
      </div>
    );
  }

  const handleDownload = async () => {
    const promise = resumeApi.downloadResumePdf(current.id, current.title);
    await toast.promise(promise, {
      loading: "Generating PDF...",
      success: "PDF downloaded",
      error: (err) => apiErrorMessage(err),
    });
  };

  const handleGenerated = (content: ResumeContent) => {
    patchCurrent({ content });
  };

  return (
    <div className="flex flex-col h-full">
      {/* top bar */}
      <div className="flex items-center justify-between px-7 py-4 border-b border-border bg-white shrink-0 gap-4">
        <div className="flex items-center gap-[14px] min-w-0">
          <input
            value={current.title}
            onChange={(e) => patchCurrent({ title: e.target.value })}
            className="text-[15px] font-semibold whitespace-nowrap bg-transparent border border-transparent hover:border-border focus:border-primary rounded-[7px] px-2 py-1 outline-none min-w-0 w-[220px]"
          />
          <div className="flex gap-1 bg-[#F1F5F9] p-[3px] rounded-lg">
            {TEMPLATE_TABS.map((t) => {
              const active = current.templateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => patchCurrent({ templateId: t.id })}
                  className={`border-none px-3 py-[6px] rounded-md text-[12.5px] font-semibold cursor-pointer ${
                    active
                      ? "bg-white text-text-dark shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
                      : "bg-transparent text-text-gray"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
          <span className="text-xs font-medium shrink-0" style={{ color: SAVE_COLORS[saveStatus] }}>
            {SAVE_LABELS[saveStatus]}
          </span>
        </div>
        <div className="flex gap-[10px] shrink-0">
          <button
            onClick={() => void handleDownload()}
            className="bg-white text-[#334155] border border-border px-4 py-[9px] rounded-lg text-[13.5px] font-semibold cursor-pointer hover:bg-[#F1F5F9]"
          >
            Download PDF
          </button>
          <button
            onClick={() => setAiOpen(true)}
            className="bg-primary text-white border-none px-4 py-[9px] rounded-lg text-[13.5px] font-semibold cursor-pointer flex items-center gap-[7px] hover:bg-primary-hover"
          >
            <span className="text-sm">✦</span> Generate with AI
          </button>
        </div>
      </div>

      {/* split body */}
      <div className="flex-1 grid grid-cols-[400px_1fr] min-h-0">
        <div className="overflow-y-auto border-r border-border bg-white p-5">
          <ResumeForm content={current.content} onChange={(content) => patchCurrent({ content })} />
        </div>

        <div className="overflow-y-auto bg-[#F1F5F9] p-8 flex justify-center">
          <div className="shrink-0">
            <ResumePreview templateId={current.templateId} content={current.content} />
          </div>
        </div>
      </div>

      <AIModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        existingContent={current.content}
        onGenerated={handleGenerated}
      />
    </div>
  );
}
