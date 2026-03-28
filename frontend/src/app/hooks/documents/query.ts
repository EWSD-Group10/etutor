import api, { API_BASE_URL } from "../../../lib/axios";

export interface DocumentUploader {
  id: string;
  name: string | null;
  role: string;
}

export interface DocumentRecord {
  id: string;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  fileFormat: string | null;
  uploadedAt: string;
  uploader: DocumentUploader;
}

export interface DocumentsListResponse {
  data: DocumentRecord[];
}

export const fetchDocuments = async (filterByStudentId?: string): Promise<DocumentsListResponse> => {
  const response = await api.get<DocumentsListResponse>("/api/documents", {
    params: filterByStudentId ? { studentId: filterByStudentId } : undefined,
  });
  return response.data;
};

export async function uploadDocumentFile(file: File): Promise<DocumentRecord> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }

  const json = (await res.json()) as { data: DocumentRecord };
  return json.data;
}

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/api/documents/${id}`);
};

export async function downloadDocumentFile(id: string, suggestedName: string): Promise<void> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Download failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName || "download";
  a.click();
  URL.revokeObjectURL(url);
}
