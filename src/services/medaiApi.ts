import { PatientIntake, MedMessage } from "@/types/medai";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/medai";

export const medaiApi = {
  startDiagnosis: async (
    intake: PatientIntake,
    files: File[]
  ): Promise<{ conv_id: string; reply: string }> => {
    const form = new FormData();
    form.append("intake", JSON.stringify(intake));
    files.forEach((f) => form.append("files", f));

    const res = await fetch(`${BASE_URL}/start/`, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed: ${res.status}`);
    }
    return res.json();
  },

  sendMessage: async (
    convId: string,
    message: string,
    files?: File[]
  ): Promise<{ reply: string; diagnosis_ready: boolean; diagnosis?: any }> => {
    const form = new FormData();
    form.append("message", message);
    if (files) files.forEach((f) => form.append("files", f));

    const res = await fetch(`${BASE_URL}/conversation/${convId}/`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed: ${res.status}`);
    }
    return res.json();
  },
};
