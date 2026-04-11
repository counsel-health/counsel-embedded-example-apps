"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

type MessageBubbleProps = {
  msg: ChatMessage;
};

export default function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
