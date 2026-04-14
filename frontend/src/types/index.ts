export interface Message {
  message_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  is_critical?: boolean;
  specialist_type?: string | null;
  disclaimer?: string | null;
}

export interface Session {
  session_id: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  message_count: number;
}

export interface SessionSummary {
  session_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string;
}

export interface AssistantResponse {
  message_id: string;
  content: string;
  is_critical: boolean;
  specialist_type: string | null;
  disclaimer: string;
  created_at: string;
}

export interface Hospital {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number | null;
  user_ratings_total?: number | null;
  open_now?: boolean | null;
  distance_m?: number | null;
  types: string[];
}

export interface Coords {
  lat: number;
  lng: number;
}
