import { FinanceIntake } from "@/types/finance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL + "/finance";

export const financeApi = {
  startSession: async (
    intake: FinanceIntake
  ): Promise<{ session_id: string; summary: any }> => {
    const res = await fetch(`${BASE_URL}/start/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed: ${res.status}`);
    }
    return res.json();
  },
};
