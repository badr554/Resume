import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import * as resumeApi from "../api/resume.api";
import { useResumeStore } from "../store/resume.store";
import type { Resume } from "../types";

const AUTO_SAVE_DELAY_MS = 2000;

/**
 * Debounced auto-save: PUTs the current resume 2s after the last change.
 */
export function useAutoSave(resume: Resume | null) {
  const { saveStatus, setSaveStatus, upsertResume } = useResumeStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!resume || saveStatus !== "unsaved") return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const saved = await resumeApi.updateResume(resume.id, {
          title: resume.title,
          templateId: resume.templateId,
          content: resume.content,
        });
        upsertResume(saved);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
        toast.error("Auto-save failed — check your connection");
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resume, saveStatus, setSaveStatus, upsertResume]);

  return saveStatus;
}
