const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface UploadResponse {
  conv_id: string;
  uploaded: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: { file?: string; chunk?: number }[];
  created_at: string;
}

export interface ChatResponse {
  answer: string;
  references: { file?: string; chunk?: number }[];
}

// Upload files — uses XHR for progress tracking
export const uploadFiles = (
  files: File[],
  onProgress: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 201) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(JSON.parse(xhr.responseText)?.error || "Upload failed."));
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));

    xhr.open("POST", `${BASE_URL}/ai/files/filehandler`);
    xhr.send(formData);
  });
};

// Load chat history
export const fetchConversation = async (convId: string): Promise<ChatMessage[]> => {
  const res = await fetch(`${BASE_URL}/ai/files/chat/?conv_id=${convId}`);
  if (!res.ok) throw new Error("Failed to load conversation.");
  const data = await res.json();
  return data.messages;
};

// Send a message
export const sendMessage = async (convId: string, message: string): Promise<ChatResponse> => {
  const res = await fetch(`${BASE_URL}/ai/files/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conv_id: convId, message }),
  });
  if (!res.ok) throw new Error("Failed to get a response.");
  return res.json();
};