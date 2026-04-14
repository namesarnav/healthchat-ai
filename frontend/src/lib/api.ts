import type { AssistantResponse, Hospital, Session, SessionSummary } from "@/types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  createSession: (userId?: string) =>
    request<{ session_id: string; created_at: string }>("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ user_id: userId ?? null }),
    }),

  getSession: (sessionId: string) =>
    request<Session>(`/api/chat/sessions/${sessionId}`),

  listSessions: (userId?: string) =>
    request<SessionSummary[]>(`/api/chat/sessions${userId ? `?user_id=${userId}` : ""}`),

  sendMessage: (sessionId: string, content: string) =>
    request<AssistantResponse>(`/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getNearbyHospitals: (lat: number, lng: number, specialistType: string) =>
    request<Hospital[]>(
      `/api/places/nearby?lat=${lat}&lng=${lng}&specialist_type=${encodeURIComponent(specialistType)}`
    ),
};
