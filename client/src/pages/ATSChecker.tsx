import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { apiErrorMessage } from "../api/axios";
import * as resumeApi from "../api/resume.api";
import * as aiApi from "../api/ai.api";
import { ATSGauge } from "../components/ui/ATSGauge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Input";
import { useResumeStore } from "../store/resume.store";
import type { AtsResult } from "../types";

export function ATSChecker() {
  const { resumes, setResumes, upsertResume } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [checking, setChecking] = useState(false);
  const [improving, setImproving] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // File Upload State
  const [mode, setMode] = useState<"saved" | "upload">("saved");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await resumeApi.listResumes();
        if (!cancelled) {
          setResumes(list);
          if (list.length > 0) {
            setSelectedResumeId(list[0].id);
            setMode("saved");
          } else {
            setMode("upload");
          }
        }
      } catch (err) {
        if (!cancelled) toast.error(apiErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingResumes(false);
      }
    })();
    return () => {
      cancelled = false;
    };
  }, [setResumes]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const handleCheck = async () => {
    if (jobDescription.trim().length < 20) {
      toast.error("Please paste a longer job description (min 20 characters)");
      return;
    }

    if (mode === "saved") {
      if (!selectedResume) {
        toast.error("Please select a resume first");
        return;
      }
      setChecking(true);
      try {
        const res = await aiApi.atsCheck({
          resumeContent: selectedResume.content,
          jobDescription,
        });
        setResult(res);
        // Save score back to the resume
        const updated = await resumeApi.updateResume(selectedResume.id, {
          atsScore: res.score,
        });
        upsertResume(updated);
        toast.success("ATS Check completed!");
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setChecking(false);
      }
    } else {
      if (!uploadedFile) {
        toast.error("Please upload a PDF or TXT resume file first");
        return;
      }
      setChecking(true);
      try {
        const res = await aiApi.atsCheckFile(uploadedFile, jobDescription);
        setResult(res);
        toast.success("ATS Check completed!");
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setChecking(false);
      }
    }
  };

  const handleFixWithAI = async () => {
    if (mode !== "saved" || !selectedResume || !result) return;
    if (result.missingKeywords.length === 0) {
      toast("No missing keywords to fix!");
      return;
    }

    setImproving(true);
    try {
      const currentSummary = selectedResume.content.personalInfo.summary || "";
      const promptDescription = `Job Description keywords to match: ${result.missingKeywords.join(", ")}. Current Summary: ${currentSummary}`;
      
      const improvedSummary = await aiApi.improveSection({
        section: "Summary",
        content: promptDescription,
        jobDescription,
      });

      // Update the resume structure with the new summary
      const updatedContent = {
        ...selectedResume.content,
        personalInfo: {
          ...selectedResume.content.personalInfo,
          summary: improvedSummary,
        },
      };

      const updatedResume = await resumeApi.updateResume(selectedResume.id, {
        content: updatedContent,
      });

      upsertResume(updatedResume);
      toast.success("Summary improved with missing keywords!");

      // Re-run ATS check with updated content
      const newCheckResult = await aiApi.atsCheck({
        resumeContent: updatedContent,
        jobDescription,
      });

      setResult(newCheckResult);
      const withScore = await resumeApi.updateResume(selectedResume.id, {
        atsScore: newCheckResult.score,
      });
      upsertResume(withScore);

      toast.success(`Score updated to ${newCheckResult.score}!`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setImproving(false);
    }
  };

  // Drag-and-Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type === "application/pdf" || file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".pdf")) {
      setUploadedFile(file);
      setResult(null); // Clear previous result
    } else {
      toast.error("Please upload only PDF or TXT CV files.");
    }
  };

  const handleUploadContainerClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMatchLabel = (score: number) => {
    if (score > 75) return "Great Match — Ready to Apply!";
    if (score > 50) return "Good Match — Room to Improve";
    return "Weak Match — Needs Improvement";
  };

  const getMatchColorClass = (score: number) => {
    if (score > 75) return "bg-[#ECFDF5] text-[#059669]";
    if (score > 50) return "bg-[#FFFBEB] text-[#B45309]";
    return "bg-[#FEF2F2] text-[#DC2626]";
  };

  return (
    <div className="px-11 py-9 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold m-0 mb-[6px] tracking-[-0.02em]">ATS Score Checker</h1>
        <p className="m-0 text-text-gray text-[14.5px]">
          Compare your CV or structured resume against a job description to measure keyword matching.
        </p>
      </div>

      {loadingResumes ? (
        <div className="h-48 flex items-center justify-center text-text-gray text-sm">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Panel: Inputs */}
          <Card className="p-5 flex flex-col gap-5">
            {/* Mode selection tabs */}
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setMode("saved");
                  setResult(null);
                }}
                disabled={resumes.length === 0}
                className={`pb-[10px] px-4 font-semibold text-[13.5px] border-b-2 cursor-pointer transition-all ${
                  mode === "saved"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-gray hover:text-text-dark"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Saved Resumes
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("upload");
                  setResult(null);
                }}
                className={`pb-[10px] px-4 font-semibold text-[13.5px] border-b-2 cursor-pointer transition-all ${
                  mode === "upload"
                    ? "border-primary text-primary"
                    : "border-transparent text-text-gray hover:text-text-dark"
                }`}
              >
                Upload CV File
              </button>
            </div>

            {/* Render input area depending on Mode */}
            {mode === "saved" ? (
              <div>
                <label className="block text-xs font-semibold text-text-gray mb-[6px] uppercase tracking-wider">
                  Select Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full border border-border rounded-[7px] px-[11px] py-[9px] text-[13.5px] font-sans outline-none text-text-dark bg-white focus:border-primary"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.templateId})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-text-gray mb-[6px] uppercase tracking-wider">
                  Upload CV (PDF or TXT)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,.txt"
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-between border border-border rounded-[7px] p-3 bg-bg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📄</div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-text-dark truncate max-w-[220px]" title={uploadedFile.name}>
                          {uploadedFile.name}
                        </div>
                        <div className="text-[11px] text-text-gray">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-text-gray hover:text-[#DC2626] font-semibold text-sm bg-transparent border-none cursor-pointer p-1"
                      title="Clear file"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleUploadContainerClick}
                    className={`border-2 border-dashed rounded-[9px] p-6 text-center cursor-pointer transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-bg"
                    }`}
                  >
                    <div className="text-3xl mb-2">📤</div>
                    <div className="text-[13px] font-semibold text-text-dark mb-1">
                      Drag & Drop your CV here
                    </div>
                    <div className="text-[11px] text-text-gray">
                      Supports PDF or Plain Text files (Max 5MB)
                    </div>
                    <div className="mt-3 text-[12px] font-semibold text-primary">
                      Or select from files
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <Textarea
                label="Job Description"
                placeholder="Paste the job description here..."
                className="h-[280px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <Button onClick={() => void handleCheck()} disabled={checking} className="py-3">
              {checking ? "Analyzing..." : "Check Score"}
            </Button>
          </Card>

          {/* Right Panel: Gauge & Keywords */}
          <Card className="p-6 flex flex-col items-center gap-5 min-h-[500px] justify-center">
            {result ? (
              <>
                <ATSGauge score={result.score} />
                <div
                  className={`text-xs font-semibold px-4 py-[6px] rounded-full ${getMatchColorClass(
                    result.score
                  )}`}
                >
                  {getMatchLabel(result.score)}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-4 border-t border-border pt-6">
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#334155] mb-[10px] flex items-center gap-1">
                      <span className="text-[#059669]">✓</span> Matched Keywords
                    </div>
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {result.matchedKeywords.length === 0 ? (
                        <span className="text-xs text-text-gray italic">None matched yet</span>
                      ) : (
                        result.matchedKeywords.map((kw, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-[6px] text-[12.5px] text-[#334155] bg-[#F1F5F9] px-2 py-1 rounded-[6px]"
                          >
                            <span className="text-xs text-[#059669] font-bold">✓</span>
                            <span className="truncate" title={kw}>
                              {kw}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-[12.5px] font-semibold text-[#334155] mb-[10px] flex items-center gap-1">
                      <span className="text-[#DC2626]">✕</span> Missing Keywords
                    </div>
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {result.missingKeywords.length === 0 ? (
                        <span className="text-xs text-text-gray italic">None missing!</span>
                      ) : (
                        result.missingKeywords.map((kw, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-[6px] text-[12.5px] text-[#334155] bg-[#FEF2F2] px-2 py-1 rounded-[6px]"
                          >
                            <span className="text-xs text-[#DC2626] font-bold">✕</span>
                            <span className="truncate" title={kw}>
                              {kw}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {mode === "saved" ? (
                  result.missingKeywords.length > 0 && (
                    <Button
                      variant="primary"
                      className="w-full mt-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB]"
                      onClick={() => void handleFixWithAI()}
                      disabled={improving}
                    >
                      {improving ? "Improving Resume..." : "Fix Missing Keywords with AI"}
                    </Button>
                  )
                ) : (
                  <div className="w-full text-center mt-4 text-[11px] text-text-gray bg-[#F8FAFC] border border-border p-3 rounded-[7px] leading-relaxed">
                    💡 <strong>Pro Tip:</strong> Create a template resume in ResumeAI to unlock direct <strong>AI Improvement</strong> which weaves missing keywords into your CV sections.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-text-gray p-8">
                <div className="text-4xl mb-4">📊</div>
                <div className="font-semibold text-text-dark mb-1">Awaiting Analysis</div>
                <div className="text-xs max-w-[280px]">
                  {mode === "saved"
                    ? "Paste a job description and select a resume on the left to measure keyword matches and score."
                    : "Upload a PDF/TXT resume and paste a job description on the left to analyze matching score."}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
