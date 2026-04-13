"use client";

import { useRef, useEffect } from "react";
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
  }

  function handleSubmit() {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || disabled) return;
    onSend(text);
    el.value = "";
    el.style.height = "auto";
    el.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 px-3 py-3">
      <div className="relative flex min-h-[120px] w-full flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-[0_6px_10px_0_rgba(0,0,0,0.06)] focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={resize}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full flex-1 resize-none bg-transparent text-base font-[450] leading-[1.3] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none min-h-6 max-h-[30dvh] disabled:opacity-50"
        />
        <div className="flex w-full items-center justify-end">
          <button
            onClick={handleSubmit}
            disabled={disabled}
            aria-label="Send message"
            className={cn(
              "flex shrink-0 items-center justify-center size-8 rounded-full transition-colors",
              disabled
                ? "bg-[#243866]/50 text-white cursor-not-allowed dark:bg-[#FFFEFC]/50 dark:text-[#040A1F]"
                : "bg-[#243866] text-white hover:bg-[#1a2a4d] dark:bg-[#FFFEFC] dark:text-[#040A1F] dark:hover:bg-white",
            )}
          >
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
