"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { HostThread } from "./types";
import MessageBubble from "./MessageBubble";

type ChatThreadProps = {
  thread: HostThread;
  onSendMessage?: (threadId: string, text: string) => void;
  onConnectCounsel?: (threadId: string) => void;
  isConnecting?: boolean;
};

function CounselCard({
  onConnect,
  isConnecting,
}: {
  onConnect?: () => void;
  isConnecting?: boolean;
}) {
  return (
    <div className="max-w-[80%] rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-gray-900">
        It sounds like you need medical assistance.
      </p>
      <p className="mt-1 text-sm text-gray-600">
        We can connect you with a Counsel doctor who can help right away.
      </p>
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className={cn(
          "mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
          isConnecting
            ? "bg-blue-400 cursor-wait"
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isConnecting ? "Connecting..." : "Connect to Counsel"}
      </button>
    </div>
  );
}

/**
 * ChatThread renders a host app chat thread.
 * This is a mock/demo UI showing what a host application's own chat
 * experience might look like alongside the embedded Counsel chat.
 */
export default function ChatThread({
  thread,
  onSendMessage,
  onConnectCounsel,
  isConnecting,
}: ChatThreadProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length, thread.showCounselCard]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage?.(thread.id, text);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {thread.display_name}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {thread.showCounselCard ? (
          <CounselCard
            onConnect={() => onConnectCounsel?.(thread.id)}
            isConnecting={isConnecting}
          />
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
