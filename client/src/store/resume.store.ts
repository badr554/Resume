import { create } from "zustand";
import type { Resume } from "../types";

export type SaveStatus = "saved" | "saving" | "unsaved";

interface ResumeState {
  resumes: Resume[];
  current: Resume | null;
  saveStatus: SaveStatus;
  setResumes: (resumes: Resume[]) => void;
  upsertResume: (resume: Resume) => void;
  removeResume: (id: string) => void;
  setCurrent: (resume: Resume | null) => void;
  patchCurrent: (patch: Partial<Resume>) => void;
  setSaveStatus: (status: SaveStatus) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  current: null,
  saveStatus: "saved",
  setResumes: (resumes) => set({ resumes }),
  upsertResume: (resume) =>
    set((state) => {
      const exists = state.resumes.some((r) => r.id === resume.id);
      return {
        resumes: exists
          ? state.resumes.map((r) => (r.id === resume.id ? resume : r))
          : [resume, ...state.resumes],
      };
    }),
  removeResume: (id) => set((state) => ({ resumes: state.resumes.filter((r) => r.id !== id) })),
  setCurrent: (current) => set({ current, saveStatus: "saved" }),
  patchCurrent: (patch) =>
    set((state) => ({
      current: state.current ? { ...state.current, ...patch } : null,
      saveStatus: "unsaved",
    })),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
}));
