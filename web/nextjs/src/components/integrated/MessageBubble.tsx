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
          "max-w-[80%] rounded-lg px-4 py-3 text-base font-[450] leading-[1.3] whitespace-pre-wrap",
          isUser
            ? "rounded-br-none bg-blue-600 text-white"
            : "rounded-bl-none bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
