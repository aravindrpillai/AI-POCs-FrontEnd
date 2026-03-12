import { AIResponse } from "@/types/claim";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/claims/conversation";

// ── Query-param type ───────────────────────────────────────────────────────
export interface ClaimQueryParams {
  company?:      string;
  email?:        string;
  name?:         string;
  policynumber?: string;
  mobile?:       string;
}

// ── Helper: builds "?company=X&email=Y…" only when company is present ──────
function buildQuery(params?: ClaimQueryParams): string {
  if (!params?.company) return "";
  const p = new URLSearchParams();
  p.set("company", params.company);
  if (params.email)        p.set("email",        params.email);
  if (params.name)         p.set("name",         params.name);
  if (params.policynumber) p.set("policynumber", params.policynumber);
  if (params.mobile)       p.set("mobile",       params.mobile);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

// ── API ────────────────────────────────────────────────────────────────────
export const claimApi = {

  createConversation: async (queryParams?: ClaimQueryParams): Promise<string> => {
    const res = await fetch(`${BASE_URL}/${buildQuery(queryParams)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "__init__" }),
    });
    if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`);
    const data = await res.json();
    return data.conv_id;
  },

  getConversation: async (
    convId: string,
    queryParams?: ClaimQueryParams,
  ): Promise<{
    conv_id: string;
    submitted: boolean;
    summary: any | null;
    messages: {
      role: string;
      message: string;
      is_file: boolean;
      filename?: string;
      created_at: string;
    }[];
  }> => {
    const res = await fetch(`${BASE_URL}/${convId}/${buildQuery(queryParams)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  },

  sendMessage: async (
    msg: string,
    convId: string,
    queryParams?: ClaimQueryParams,
  ): Promise<AIResponse> => {
    const res = await fetch(`${BASE_URL}/${convId}/${buildQuery(queryParams)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    const data = await res.json();
    return { ...data, summary: data.summary === true || data.summary === "true" };
  },

  uploadFile: async (
    convId: string,
    file: File,
    caption?: string,
    queryParams?: ClaimQueryParams,
  ): Promise<{ file_uid: string; filename: string; content_type: string; size: number }> => {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    const res = await fetch(`${BASE_URL}/${convId}/upload/${buildQuery(queryParams)}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },

};