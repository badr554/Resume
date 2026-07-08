import { api } from "./axios";
import type { User } from "../types";

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function me(): Promise<User> {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.data.user;
}

export async function updateProfile(data: { name: string; email: string }): Promise<User> {
  const res = await api.put<{ user: User }>("/auth/profile", data);
  return res.data.user;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.put("/auth/password", data);
}

export async function deleteAccount(): Promise<void> {
  await api.delete("/auth/account");
}
