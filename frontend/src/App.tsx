import { useState } from "react";
import { Heart, Plus, AlertCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { cn } from "@/lib/utils";

export default function App() {
  const { messages, isLoading, error, lastCritical, sendMessage, newSession, sessionId } = useChat();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  const criticalSpecialist = lastCritical?.isCritical ? (lastCritical.specialistType ?? "emergency") : null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Heart size={16} className="text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-none">HealthChat AI</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessionId && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Connected</span>
            </div>
          )}
          <button
            onClick={newSession}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            )}
          >
            <Plus size={12} />
            New chat
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex-shrink-0 flex items-center gap-2 bg-red-50 border-b border-red-200 text-red-700 text-xs px-4 py-2">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Main chat area */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        criticalSpecialist={criticalSpecialist}
        onSuggestion={handleSuggestion}
      />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading || !sessionId} />
    </div>
  );
}
