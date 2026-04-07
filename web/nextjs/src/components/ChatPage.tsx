"use client";

import { CounselApp } from "./counsel/CounselApp";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

/**
 * ChatPage renders the Counsel app inside an iframe with a context handover demo.
 *
 * The "Transfer to Counsel" button demonstrates how a host application can
 * trigger a new chat in the embedded Counsel iframe using postMessage,
 * passing context from a prior conversation.
 */
export default function ChatPage({ signedAppUrl }: { signedAppUrl: string }) {
  const [isReady, setIsReady] = useState(false);
  const [lastThreadId, setLastThreadId] = useState<string | null>(null);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handleChatStarted = useCallback((threadId: string) => {
    setLastThreadId(threadId);
  }, []);

  const handleStartChat = useCallback(() => {
    const sendMessage = (
      window as Record<string, unknown>
    ).__counselSendMessage as
      | ((msg: Record<string, unknown>) => void)
      | undefined;
    if (!sendMessage) return;

    sendMessage({
      type: "counsel:startChat",
      payload: {
        requestId: crypto.randomUUID(),
        hiddenContext:
          "The patient was previously chatting with our support bot about recurring headaches over the past 2 weeks. They mentioned the headaches are mostly in the morning and they recently started a new medication (lisinopril) for blood pressure.",
      },
    });
  }, []);

  const handleResumeChat = useCallback(() => {
    if (!lastThreadId) return;
    const sendMessage = (
      window as Record<string, unknown>
    ).__counselSendMessage as
      | ((msg: Record<string, unknown>) => void)
      | undefined;
    if (!sendMessage) return;

    sendMessage({
      type: "counsel:resumeChat",
      payload: {
        requestId: crypto.randomUUID(),
        threadId: lastThreadId,
        hiddenContext:
          "The patient continued chatting with our support bot after the last handover. They mentioned the headaches are getting worse and asked about seeing a specialist.",
      },
    });
  }, [lastThreadId]);

  return (
    <div className="flex h-full flex-col">
      {/* Handover demo controls */}
      <div className="flex items-center gap-3 border-b bg-gray-50 px-4 py-2">
        <button
          onClick={handleStartChat}
          disabled={!isReady}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium text-white",
            isReady
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-400"
          )}
        >
          Transfer to Counsel
        </button>
        {lastThreadId && (
          <button
            onClick={handleResumeChat}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Resume Last Chat
          </button>
        )}
        <span className="text-xs text-gray-500">
          {isReady ? "Counsel iframe ready" : "Waiting for iframe..."}
        </span>
      </div>

      {/* Counsel iframe */}
      <CounselApp
        signedAppUrl={signedAppUrl}
        className={cn("h-full w-full")}
        onReady={handleReady}
        onChatStarted={handleChatStarted}
      />
    </div>
  );
}
