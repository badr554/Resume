import { api } from "./axios";
import type { TemplateMeta } from "../types";

export async function listTemplates(): Promise<TemplateMeta[]> {
  const res = await api.get<{ templates: TemplateMeta[] }>("/templates");
  return res.data.templates;
}
