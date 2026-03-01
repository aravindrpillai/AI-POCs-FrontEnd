import { AIResponse } from "@/types/claim";

//const BASE_URL = "http://localhost:8000/claims/conversation";
const BASE_URL = "https://ai.aravindpillai.com/claims/conversation";

export const claimApi = {

  createConversation: async (): Promise<string> => {
    const res = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "__init__" }),
    });
    if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`);
    const data = await res.json();
    return data.conv_id;
  },

  getConversation: async (convId: string): Promise<{
    conv_id: string;
    submitted: boolean;
    summary: any | null;
    messages: { role: string; message: string; is_file: boolean; filename?: string; created_at: string }[];
  }> => {
    const res = await fetch(`${BASE_URL}/${convId}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  },

  sendMessage: async (msg: string, convId: string): Promise<AIResponse> => {
    const res = await fetch(`${BASE_URL}/${convId}/`, {
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
  ): Promise<{ file_uid: string; filename: string; content_type: string; size: number }> => {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    const res = await fetch(`${BASE_URL}/${convId}/upload/`, {
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