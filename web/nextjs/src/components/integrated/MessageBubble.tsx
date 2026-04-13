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
            ? "rounded-br-none bg-[#243866] text-white dark:bg-[#FFFEFC] dark:text-[#040A1F]"
            : "rounded-bl-none bg-[#FFFEFC] text-[#1C1304] dark:bg-[#292E46] dark:text-[#FAFBFF]",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
