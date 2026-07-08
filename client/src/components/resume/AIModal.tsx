import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as aiApi from "../../api/ai.api";
import { apiErrorMessage } from "../../api/axios";
import type { ResumeContent } from "../../types";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { Modal } from "../ui/Modal";

const GEN_MESSAGES = [
  "Analyzing job description...",
  "Extracting key skills & requirements...",
  "Optimizing bullet points for impact...",
  "ResumeAI is crafting your resume...",
];

interface AIModalProps {
  open: boolean;
  onClose: () => void;
  existingContent: ResumeContent;
  onGenerated: (content: ResumeContent) => void;
}

export function AIModal({ open, onClose, existingContent, onGenerated }: AIModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!generating) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep(0);
      return;
    }
    timerRef.current = setInterval(() => {
      setStep((s) => Math.min(s + 1, GEN_MESSAGES.length - 1));
    }, 900);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [generating]);

  const run = async (improveExisting: boolean) => {
    if (!jobTitle.trim() || jobDescription.trim().length < 20) {
      toast.error("Add a job title and paste the job description first");
      return;
    }
    setGenerating(true);
    try {
      const content = await aiApi.generateResume({
        jobTitle,
        jobDescription,
        existingData: improveExisting ? existingContent : undefined,
      });
      toast.success("Resume generated!");
      onGenerated(content);
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    if (!generating) onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {generating ? (
        <div className="flex flex-col items-center pt-9 pb-5 px-[10px] gap-[22px]">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary opacity-25 animate-pulse-ring" />
            <div className="w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center text-[22px]">
              ✦
            </div>
          </div>
          <div className="text-[14.5px] font-semibold text-text-dark">{GEN_MESSAGES[step]}</div>
          <div className="w-full h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${((step + 1) / GEN_MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="text-lg font-bold mb-1">Generate with AI</div>
          <div className="text-[13.5px] text-text-gray mb-5">
            Paste a job posting and let AI tailor your resume to it.
          </div>

          <div className="mb-[14px]">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Product Designer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="mb-[22px]">
            <Textarea
              label="Job Description"
              placeholder="Paste the full job description here..."
              className="h-[120px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-[10px]">
            <Button variant="primary" className="flex-1 py-3" onClick={() => void run(false)}>
              Generate Full Resume
            </Button>
            <Button variant="secondary" className="flex-1 py-3" onClick={() => void run(true)}>
              Improve Existing
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
