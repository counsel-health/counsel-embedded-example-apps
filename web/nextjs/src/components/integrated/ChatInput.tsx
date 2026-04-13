"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

/**
 * Auto-expanding textarea chat input.
 * Enter to submit, Shift+Enter for newline.
 */
export default function ChatInput({ onSend, disabled, placeholder = "Type a message…" }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasContent, setHasContent] = useState(false);
  const sendDisabled = disabled || !hasContent;

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    setHasContent(el.value.trim().length > 0);
  }

  function handleSubmit() {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || disabled) return;
    onSend(text);
    el.value = "";
    el.style.height = "auto";
    setHasContent(false);
    el.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="bg-white dark:bg-[#090D1C] px-4 py-3">
      <div className="relative mx-auto flex min-h-[120px] w-full max-w-3xl flex-col gap-2 rounded-lg border border-[#DEDBD4] dark:border-[#050917] bg-[#FFFEFC] dark:bg-[#343A53] p-4 shadow-[0_6px_10px_0_rgba(0,0,0,0.06)] focus-within:border-[#C1C7B1] dark:focus-within:border-[#3F4560] transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={resize}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full flex-1 resize-none bg-transparent text-base font-[450] leading-[1.3] text-[#1C1304] dark:text-[#FAFBFF] placeholder:text-[#9D998F] dark:placeholder:text-[#8D95B0] outline-none min-h-6 max-h-[30dvh] disabled:opacity-50"
        />
        <div className="flex w-full items-center justify-end">
          <button
            onClick={handleSubmit}
            disabled={sendDisabled}
            aria-label="Send message"
            className={cn(
              "flex shrink-0 items-center justify-center size-8 rounded-full transition-colors text-white dark:text-[#040A1F]",
              sendDisabled
                ? "bg-[#243866]/50 dark:bg-[#FFFEFC]/50 cursor-not-allowed"
                : "bg-[#243866] dark:bg-[#FFFEFC] hover:opacity-90",
            )}
          >
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
