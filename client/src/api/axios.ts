import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(`${BASE_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => res.data.accessToken)
      .catch(() => null)
      .finally(() => {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
  }
  return refreshPromise;
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/register");

    if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        useAuthStore.getState().setAccessToken(token);
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        return api.request(config);
      }
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return "Something went wrong";
}
