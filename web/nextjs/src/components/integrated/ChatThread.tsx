"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HostThread } from "./types";
import MessageBubble from "./MessageBubble";
import CounselCard from "./CounselCard";
import ChatInput from "./ChatInput";

type ChatThreadProps = {
  thread: HostThread;
  onSendMessage?: (threadId: string, text: string) => void;
  onConnectCounsel?: (threadId: string) => void;
  isConnecting?: boolean;
};

export default function ChatThread({
  thread,
  onSendMessage,
  onConnectCounsel,
  isConnecting,
}: ChatThreadProps) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsAtBottom(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [thread.messages.length, thread.showCounselCard, isAtBottom]);

  const scrollToBottom = useCallback(() => {
    sentinelRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      onSendMessage?.(thread.id, text);
    },
    [onSendMessage, thread.id],
  );

  return (
    // Outer stage: centers the chat column within the available space, mirroring
    // counsel-main AIModeMessagesContainer (flex items-center justify-center with
    // an 85%/60vw column), so the ChatInput sits in the same place whether the
    // host or the Counsel iframe is rendered.
    <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center bg-white dark:bg-[#090D1C]">
      <div className="relative flex h-full min-h-0 w-full flex-grow flex-col sm:w-[60%]">
        {/* Messages — flex-col with mt-auto on the list so messages anchor to the
            bottom of the scroll area when they don't fill it. */}
        <div
          ref={scrollContainerRef}
          className="relative flex w-full flex-grow flex-col overflow-y-auto p-5"
        >
          <div className="mt-auto flex flex-col gap-y-6">
            {thread.messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {thread.showCounselCard && (
              <CounselCard
                onConnect={() => onConnectCounsel?.(thread.id)}
                isConnecting={isConnecting}
              />
            )}
            <div ref={sentinelRef} className="h-px" />
          </div>
        </div>

        {/* Scroll-to-bottom button */}
        {!isAtBottom && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={scrollToBottom}
              aria-label="Scroll to bottom"
              className={cn(
                "flex items-center justify-center size-8 rounded-full",
                "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
                "shadow-md text-zinc-500 dark:text-zinc-400",
                "hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors",
              )}
            >
              <ChevronDown className="size-4" />
            </button>
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={isConnecting} />
      </div>
    </div>
  );
}
