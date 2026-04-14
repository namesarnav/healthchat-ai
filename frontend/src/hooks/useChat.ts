import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { Message } from "@/types";

const USER_ID_KEY = "healthchat_user_id";
const SESSION_ID_KEY = "healthchat_session_id";

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export interface ChatState {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  lastCritical: { isCritical: boolean; specialistType: string | null } | null;
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    sessionId: null,
    isLoading: false,
    error: null,
    lastCritical: null,
  });
  const initRef = useRef(false);

  // Initialize or resume session
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const userId = getOrCreateUserId();
    const savedSession = localStorage.getItem(SESSION_ID_KEY);

    const init = async () => {
      if (savedSession) {
        try {
          const session = await api.getSession(savedSession);
          setState((s) => ({ ...s, sessionId: session.session_id, messages: session.messages }));
          return;
        } catch {
          localStorage.removeItem(SESSION_ID_KEY);
        }
      }
      try {
        const { session_id } = await api.createSession(userId);
        localStorage.setItem(SESSION_ID_KEY, session_id);
        setState((s) => ({ ...s, sessionId: session_id }));
      } catch (e) {
        setState((s) => ({ ...s, error: "Could not connect to server. Please try again." }));
      }
    };
    init();
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.sessionId || !content.trim()) return;

      const userMsg: Message = {
        message_id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        messages: [...s.messages, userMsg],
        isLoading: true,
        error: null,
        lastCritical: null,
      }));

      try {
        const res = await api.sendMessage(state.sessionId, content.trim());

        const assistantMsg: Message = {
          message_id: res.message_id,
          role: "assistant",
          content: res.content,
          created_at: res.created_at,
          is_critical: res.is_critical,
          specialist_type: res.specialist_type,
          disclaimer: res.disclaimer,
        };

        setState((s) => ({
          ...s,
          messages: [...s.messages, assistantMsg],
          isLoading: false,
          lastCritical: res.is_critical
            ? { isCritical: true, specialistType: res.specialist_type }
            : null,
        }));
      } catch (e) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        }));
      }
    },
    [state.sessionId]
  );

  const newSession = useCallback(async () => {
    const userId = getOrCreateUserId();
    localStorage.removeItem(SESSION_ID_KEY);
    setState({ messages: [], sessionId: null, isLoading: true, error: null, lastCritical: null });
    try {
      const { session_id } = await api.createSession(userId);
      localStorage.setItem(SESSION_ID_KEY, session_id);
      setState((s) => ({ ...s, sessionId: session_id, isLoading: false }));
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: "Could not create new session." }));
    }
  }, []);

  return { ...state, sendMessage, newSession };
}
