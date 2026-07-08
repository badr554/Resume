import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api/axios";
import * as resumeApi from "../api/resume.api";
import { ResumeCard } from "../components/resume/ResumeCard";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useResumeStore } from "../store/resume.store";
import type { Resume } from "../types";

export function Dashboard() {
  const navigate = useNavigate();
  const { resumes, setResumes, upsertResume, removeResume } = useResumeStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await resumeApi.listResumes();
        if (!cancelled) setResumes(list);
      } catch (err) {
        if (!cancelled) toast.error(apiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setResumes]);

  const handleNew = async () => {
    setCreating(true);
    try {
      const resume = await resumeApi.createResume({ title: "Untitled Resume" });
      upsertResume(resume);
      navigate(`/resumes/${resume.id}/edit`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (resume: Resume) => {
    const promise = resumeApi.downloadResumePdf(resume.id, resume.title);
    await toast.promise(promise, {
      loading: "Generating PDF...",
      success: "PDF downloaded",
      error: (err) => apiErrorMessage(err),
    });
  };

  const handleDuplicate = async (resume: Resume) => {
    try {
      const copy = await resumeApi.duplicateResume(resume.id);
      upsertResume(copy);
      toast.success("Resume duplicated");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resumeApi.deleteResume(deleteTarget.id);
      removeResume(deleteTarget.id);
      toast.success("Resume deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-11 py-9 max-w-[1280px]">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-[26px] font-bold m-0 mb-[6px] tracking-[-0.02em]">My Resumes</h1>
          <p className="m-0 text-text-gray text-[14.5px]">
            {resumes.length} resume{resumes.length === 1 ? "" : "s"} · manage, edit, and track your
            applications
          </p>
        </div>
        <Button onClick={() => void handleNew()} disabled={creating}>
          <span className="text-base leading-none">+</span> New Resume
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-card h-[280px] animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white border border-border rounded-card py-16 px-8 flex flex-col items-center text-center">
          <div className="w-[120px] h-[150px] bg-bg border border-border rounded-lg px-4 py-4 flex flex-col gap-[6px] mb-6">
            <div className="w-3/5 h-2 rounded-[3px] bg-[#CBD5E1]" />
            <div className="w-2/5 h-[6px] rounded-[3px] bg-border mb-[6px]" />
            <div className="w-[90%] h-[5px] rounded-[3px] bg-border" />
            <div className="w-4/5 h-[5px] rounded-[3px] bg-border" />
            <div className="w-[85%] h-[5px] rounded-[3px] bg-border" />
          </div>
          <h2 className="text-lg font-bold m-0 mb-2">No resumes yet</h2>
          <p className="m-0 mb-6 text-text-gray text-[14px] max-w-[380px]">
            Create your first resume and let AI tailor it to the jobs you want.
          </p>
          <Button onClick={() => void handleNew()} disabled={creating}>
            <span className="text-base leading-none">+</span> Create your first resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
              onDownload={() => void handleDownload(resume)}
              onDuplicate={() => void handleDuplicate(resume)}
              onDelete={() => setDeleteTarget(resume)}
            />
          ))}
        </div>
      )}

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} width={440}>
        <div className="text-lg font-bold mb-1">Delete resume?</div>
        <p className="text-[13.5px] text-text-gray mt-0 mb-6">
          &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
        </p>
        <div className="flex gap-[10px] justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
