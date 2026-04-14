import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { HospitalPanel } from "./HospitalPanel";
import { WelcomeScreen } from "./WelcomeScreen";
import type { Message } from "@/types";

interface Props {
  messages: Message[];
  isLoading: boolean;
  criticalSpecialist: string | null;
  onSuggestion: (text: string) => void;
}

export function ChatWindow({ messages, isLoading, criticalSpecialist, onSuggestion }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [dismissedPanel, setDismissedPanel] = useState(false);
  const prevCriticalRef = useRef<string | null>(null);

  // Reset dismiss state when new critical comes in
  useEffect(() => {
    if (criticalSpecialist && criticalSpecialist !== prevCriticalRef.current) {
      setDismissedPanel(false);
      prevCriticalRef.current = criticalSpecialist;
    }
  }, [criticalSpecialist]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showHospitalPanel = criticalSpecialist && !dismissedPanel;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <WelcomeScreen onSuggestion={onSuggestion} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.message_id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Hospital panel — anchored to bottom of chat, above input */}
      {showHospitalPanel && (
        <HospitalPanel
          specialistType={criticalSpecialist}
          onDismiss={() => setDismissedPanel(true)}
        />
      )}
    </div>
  );
}
