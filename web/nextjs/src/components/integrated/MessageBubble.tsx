"use client";

import type { ChatMessage } from "./types";

type MessageBubbleProps = {
  msg: ChatMessage;
};

export default function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === "user";
  if (!isUser) {
    // Counsel-main renders assistant messages as bare text, no bubble.
    return (
      <div className="flex flex-row">
        <div className="max-w-[80%] text-base font-[450] leading-[1.3] whitespace-pre-wrap text-[#1C1304] dark:text-[#FAFBFF]">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-row-reverse">
      <div className="max-w-[80%] rounded-lg rounded-br-none px-4 py-3 text-base font-[450] leading-[1.3] whitespace-pre-wrap bg-[#243866] text-white dark:bg-[#FFFEFC] dark:text-[#040A1F]">
        {msg.text}
      </div>
    </div>
  );
}
