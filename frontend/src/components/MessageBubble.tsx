import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { AlertTriangle, Bot, User } from "lucide-react";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-primary text-primary-foreground" : "bg-emerald-500/10 text-emerald-600"
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[75%] flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card text-card-foreground border border-border rounded-tl-sm"
          )}
        >
          {message.content}
        </div>

        {/* Critical warning badge */}
        {message.is_critical && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 font-medium animate-fade-in">
            <AlertTriangle size={11} />
            <span>Critical condition — see nearby care options below</span>
          </div>
        )}

        {/* Disclaimer */}
        {message.disclaimer && !isUser && (
          <p className="text-[10px] text-muted-foreground px-1 max-w-sm">
            {message.disclaimer}
          </p>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
