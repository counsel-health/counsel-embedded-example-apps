"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "./types";

type MessageBubbleProps = {
  msg: ChatMessage;
};

export default function MessageBubble({ msg }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
        msg.role === "user"
          ? "ml-auto bg-blue-600 text-white"
          : "bg-gray-100 text-gray-900"
      )}
    >
      {msg.text}
    </div>
  );
}
