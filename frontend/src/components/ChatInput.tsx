import { useState, useRef, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Describe your symptoms…"
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-input bg-card px-4 py-3 pr-12 text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              "transition-all min-h-[48px] max-h-40 leading-relaxed",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground",
            "flex items-center justify-center transition-all",
            "hover:bg-primary/90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring",
            (disabled || !value.trim()) && "opacity-40 cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2">
        Press Enter to send · Shift+Enter for new line · Not a substitute for professional medical advice
      </p>
    </div>
  );
}
