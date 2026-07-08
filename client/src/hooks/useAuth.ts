import { useCallback, useEffect } from "react";
import axios from "axios";
import * as authApi from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/**
 * Bootstraps the session on app load: tries a silent refresh (httpOnly cookie)
 * and, if it succeeds, loads the current user.
 */
export function useAuth() {
  const { user, accessToken, initialized, setAuth, setAccessToken, setInitialized, clear } =
    useAuthStore();

  useEffect(() => {
    if (initialized) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.post<{ accessToken: string }>(`${BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
        });
        if (cancelled) return;
        setAccessToken(res.data.accessToken);
        const me = await authApi.me();
        if (cancelled) return;
        setAuth(me, res.data.accessToken);
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setInitialized();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialized, setAuth, setAccessToken, setInitialized, clear]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
    }
  }, [clear]);

  return { user, accessToken, initialized, isAuthenticated: Boolean(user), logout };
}
