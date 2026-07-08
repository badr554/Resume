import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiErrorMessage } from "../api/axios";
import * as resumeApi from "../api/resume.api";
import * as aiApi from "../api/ai.api";
import * as coverLetterApi from "../api/coverLetter.api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Textarea } from "../components/ui/Input";
import { useResumeStore } from "../store/resume.store";
import type { CoverLetter as CoverLetterType } from "../types";

export function CoverLetter() {
  const { resumes, setResumes } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // List of saved letters
  const [savedLetters, setSavedLetters] = useState<CoverLetterType[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [editingLetter, setEditingLetter] = useState<CoverLetterType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    // Load resumes
    (async () => {
      try {
        const list = await resumeApi.listResumes();
        if (!cancelled) {
          setResumes(list);
          if (list.length > 0) setSelectedResumeId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) toast.error(apiErrorMessage(err));
      }
    })();

    // Load cover letters
    (async () => {
      try {
        const letters = await coverLetterApi.listCoverLetters();
        if (!cancelled) setSavedLetters(letters);
      } catch (err) {
        if (!cancelled) toast.error(apiErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingLetters(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setResumes]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast.error("Please select a resume first");
      return;
    }
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Please enter the job title");
      return;
    }
    if (jobDescription.trim().length < 20) {
      toast.error("Please paste the job description (min 20 characters)");
      return;
    }

    setGenerating(true);
    setGeneratedContent("");
    setEditingLetter(null);
    try {
      const result = await aiApi.generateCoverLetter({
        resumeContent: selectedResume.content,
        jobTitle,
        jobDescription,
        companyName,
      });
      setGeneratedContent(result);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    const text = editingLetter ? editingLetter.content : generatedContent;
    const title = editingLetter 
      ? editingLetter.title 
      : `${jobTitle} at ${companyName}`;

    if (!text.trim()) return;

    setSaving(true);
    try {
      if (editingLetter) {
        const updated = await coverLetterApi.updateCoverLetter(editingLetter.id, {
          title,
          content: text,
        });
        setSavedLetters((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l))
        );
        setEditingLetter(updated);
        toast.success("Cover letter updated");
      } else {
        const created = await coverLetterApi.createCoverLetter({
          title,
          content: text,
        });
        setSavedLetters((prev) => [created, ...prev]);
        setEditingLetter(created);
        toast.success("Cover letter saved!");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (letter: CoverLetterType) => {
    const promise = coverLetterApi.downloadCoverLetterPdf(letter.id, letter.title);
    await toast.promise(promise, {
      loading: "Generating PDF...",
      success: "PDF downloaded",
      error: (err) => apiErrorMessage(err),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;
    try {
      await coverLetterApi.deleteCoverLetter(id);
      setSavedLetters((prev) => prev.filter((l) => l.id !== id));
      if (editingLetter?.id === id) {
        setEditingLetter(null);
        setGeneratedContent("");
      }
      toast.success("Cover letter deleted");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleCopy = () => {
    const text = editingLetter ? editingLetter.content : generatedContent;
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="px-11 py-9 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold m-0 mb-[6px] tracking-[-0.02em]">Cover Letters</h1>
        <p className="m-0 text-text-gray text-[14.5px]">
          Generate tailored cover letters using AI and manage them in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Form - Span 5 */}
        <Card className="p-5 flex flex-col gap-4 lg:col-span-5">
          <h2 className="text-sm font-bold m-0 uppercase tracking-wider text-text-gray">
            Generator details
          </h2>
          <div>
            <label className="block text-xs font-semibold text-text-gray mb-[6px] uppercase tracking-wider">
              Base Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full border border-border rounded-[7px] px-[11px] py-[9px] text-[13.5px] font-sans outline-none text-text-dark bg-white focus:border-primary"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.templateId})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Company Name"
            placeholder="e.g. Stripe"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            label="Job Title"
            placeholder="e.g. Senior Product Designer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <Textarea
            label="Job Description"
            placeholder="Paste the job description here..."
            className="h-[180px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <Button
            onClick={() => void handleGenerate()}
            disabled={generating}
            className="py-3"
          >
            {generating ? "Generating..." : "Generate Cover Letter"}
          </Button>
        </Card>

        {/* Right Output Area - Span 7 */}
        <Card className="p-6 flex flex-col min-h-[460px] lg:col-span-7">
          {generating ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-[22px] py-16">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary opacity-25 animate-pulse-ring" />
                <div className="w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center text-[22px]">
                  ✦
                </div>
              </div>
              <div className="text-[14.5px] font-semibold text-text-dark animate-pulse">
                ResumeAI is crafting your cover letter...
              </div>
            </div>
          ) : editingLetter || generatedContent ? (
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <input
                  type="text"
                  value={editingLetter ? editingLetter.title : `${jobTitle} at ${companyName}`}
                  onChange={(e) => {
                    const titleVal = e.target.value;
                    if (editingLetter) {
                      setEditingLetter({ ...editingLetter, title: titleVal });
                    }
                  }}
                  disabled={!editingLetter}
                  className="text-base font-bold bg-transparent border-none text-text-dark outline-none min-w-0 flex-1 mr-4 focus:underline"
                />
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" onClick={handleCopy} className="px-3 py-2 text-xs">
                    Copy
                  </Button>
                  <Button variant="secondary" onClick={() => void handleSave()} disabled={saving} className="px-3 py-2 text-xs">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  {editingLetter && (
                    <Button variant="dark" onClick={() => void handleDownload(editingLetter)} className="px-3 py-2 text-xs">
                      PDF
                    </Button>
                  )}
                </div>
              </div>

              <textarea
                value={editingLetter ? editingLetter.content : generatedContent}
                onChange={(e) => {
                  const contentVal = e.target.value;
                  if (editingLetter) {
                    setEditingLetter({ ...editingLetter, content: contentVal });
                  } else {
                    setGeneratedContent(contentVal);
                  }
                }}
                className="w-full flex-1 min-h-[300px] border border-transparent outline-none resize-none font-sans text-[13.5px] text-[#334155] leading-relaxed focus:border-border p-2 rounded"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-text-gray p-8 py-16">
              <div className="text-4xl mb-4">✉️</div>
              <div className="font-semibold text-text-dark mb-1">Awaiting Generation</div>
              <div className="text-xs max-w-[280px]">
                Fill out the company and job info on the left, then click generate to craft a custom cover letter.
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Saved Cover Letters section */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="text-[20px] font-bold mb-5 tracking-[-0.02em]">Saved Cover Letters</h2>

        {loadingLetters ? (
          <div className="h-24 flex items-center justify-center text-text-gray text-sm">
            Loading letters...
          </div>
        ) : savedLetters.length === 0 ? (
          <div className="text-center text-text-gray py-8 bg-white border border-dashed border-border rounded-card">
            No saved cover letters found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedLetters.map((letter) => (
              <Card key={letter.id} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-sm font-bold text-text-dark mt-0 mb-1 line-clamp-1">
                    {letter.title}
                  </h3>
                  <p className="text-xs text-text-gray mt-0 mb-3">
                    Created {new Date(letter.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#475569] line-clamp-3 mb-4 leading-normal">
                    {letter.content}
                  </p>
                </div>
                <div className="flex gap-2 border-t border-border pt-3 mt-auto">
                  <button
                    onClick={() => {
                      setEditingLetter(letter);
                      setGeneratedContent("");
                    }}
                    className="flex-1 bg-sidebar text-white border-none py-[6px] rounded-[6px] text-xs font-semibold cursor-pointer hover:bg-[#1E293B]"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => void handleDownload(letter)}
                    className="flex-1 bg-white text-[#334155] border border-border py-[6px] rounded-[6px] text-xs font-semibold cursor-pointer hover:bg-[#F1F5F9]"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => void handleDelete(letter.id)}
                    className="bg-white text-[#DC2626] border border-border px-2 py-[6px] rounded-[6px] text-xs font-semibold cursor-pointer hover:bg-[#FEF2F2]"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
