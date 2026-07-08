import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setInitialized: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: () => set({ initialized: true }),
  clear: () => set({ user: null, accessToken: null }),
}));
