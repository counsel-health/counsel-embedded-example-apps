"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CounselApp } from "./counsel/CounselApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ThreadItem } from "@/lib/schemas";

const DEFAULT_HANDOFF_TRIGGER = "I need a doctor";

type Message = {
  role: "user" | "bot";
  text: string;
};

/**
 * Mock bot responses for the host chat UI.
 * A real integration would call your own backend here.
 */
function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("headache") || lower.includes("pain")) {
    return "I'm sorry to hear you're in pain. Can you tell me more about when it started and how severe it is?";
  }
  if (lower.includes("medication") || lower.includes("medicine")) {
    return "I can help with general information about medications, but for specific medical advice a doctor would be best.";
  }
  if (lower.includes("doctor") || lower.includes("medical")) {
    return "It sounds like you may need medical attention. I can connect you with our medical AI team.";
  }
  return "Thanks for sharing that. Is there anything specific you'd like help with today?";
}

/** Format a date as a relative time string (e.g. "2h ago", "Yesterday"). */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

type HandOffChatPageProps = {
  signedAppUrl: string;
  /**
   * The phrase that triggers the Counsel handoff card.
   * Defaults to "I need a doctor".
   */
  handoffTrigger?: string;
  /** List of existing chat threads to display in the sidebar. */
  threads: ThreadItem[];
};

/**
 * HandOffChatPage renders a chat interface with a thread sidebar and mock host
 * chat. The Counsel iframe (integrated view, no Counsel sidebar) is loaded from
 * page start. The mock chat overlays the content area. When the handoff trigger
 * phrase is detected or an existing thread is clicked, the overlay is removed
 * and the Counsel integrated chat is revealed.
 */
export default function HandOffChatPage({
  signedAppUrl,
  handoffTrigger = DEFAULT_HANDOFF_TRIGGER,
  threads,
}: HandOffChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [connected, setConnected] = useState(false);
  const [counselVisible, setCounselVisible] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingContextRef = useRef<string | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, handoffTriggered]);

  const sendCounselMessage = useCallback(
    (msg: Record<string, unknown>) => {
      const send = (window as Record<string, unknown>).__counselSendMessage as
        | ((msg: Record<string, unknown>) => void)
        | undefined;
      send?.(msg);
    },
    []
  );

  const completeHandoff = useCallback(
    (context: string) => {
      sendCounselMessage({
        type: "counsel:startChat",
        payload: {
          requestId: crypto.randomUUID(),
          hiddenContext: context,
        },
      });
      setConnected(true);
      setTimeout(() => {
        setCounselVisible(true);
      }, 800);
    },
    [sendCounselMessage]
  );

  // Called when the Counsel iframe fires counsel:ready
  const handleIframeReady = useCallback(() => {
    setIframeReady(true);
    // If user clicked Connect before iframe was ready, complete the handoff now
    const context = pendingContextRef.current;
    if (context) {
      pendingContextRef.current = null;
      completeHandoff(context);
    }
  }, [completeHandoff]);

  const handleChatStarted = useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
    },
    []
  );

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check for handoff trigger
    if (text.toLowerCase().includes(handoffTrigger.toLowerCase())) {
      setHandoffTriggered(true);
      return;
    }

    // Mock bot response
    const botResponse = getBotResponse(text);
    setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
  }, [input, handoffTrigger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage();
    },
    [sendMessage]
  );

  const handleConnectNow = useCallback(() => {
    // Build a plain-text summary of the last 5 messages for the AI agent
    const recentMessages = messages.slice(-5);
    const hiddenContext = recentMessages
      .map(
        (m) => `${m.role === "user" ? "Patient" : "Support bot"}: ${m.text}`
      )
      .join("\n");

    if (iframeReady) {
      completeHandoff(hiddenContext);
    } else {
      // Store context so it can be sent once the iframe fires counsel:ready
      pendingContextRef.current = hiddenContext;
    }
  }, [messages, iframeReady, completeHandoff]);

  const handleThreadClick = useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      sendCounselMessage({
        type: "counsel:resumeChat",
        payload: {
          requestId: crypto.randomUUID(),
          threadId,
        },
      });
      setCounselVisible(true);
    },
    [sendCounselMessage]
  );

  const handleNewChat = useCallback(() => {
    setActiveThreadId(null);
    setCounselVisible(false);
    setConnected(false);
    setHandoffTriggered(false);
    setMessages([{ role: "bot", text: "Hi! How can I help you today?" }]);
    setInput("");
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* Thread sidebar */}
      <aside className="w-[280px] shrink-0 border-r bg-gray-50 flex flex-col max-sm:hidden">
        <div className="p-3 border-b">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={handleNewChat}
          >
            New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <p className="p-3 text-xs text-gray-400">No conversations yet</p>
          )}
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleThreadClick(thread.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-gray-100 transition-colors",
                activeThreadId === thread.id && "bg-gray-100"
              )}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {thread.display_name || "New chat"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatRelativeTime(thread.last_activity_time)}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 relative min-w-0">
        {/* Counsel integrated iframe — always rendered */}
        <div
          className={cn(
            "h-full w-full",
            !counselVisible && "pointer-events-none"
          )}
        >
          <CounselApp
            signedAppUrl={signedAppUrl}
            className="h-full w-full"
            onReady={handleIframeReady}
            onChatStarted={handleChatStarted}
          />
        </div>

        {/* Mock chat overlay — shown before handoff */}
        {!counselVisible && (
          <div className="absolute inset-0 z-10 bg-white flex flex-col">
            {/* Header */}
            <div className="border-b bg-white px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Chat with Support
              </h2>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Inline handoff card */}
              {handoffTriggered && !connected && (
                <div className="flex justify-start">
                  <Card className="max-w-[75%] border border-gray-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Connect to Counsel
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Chat with Counsel AI and connect with a doctor if
                            needed.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        onClick={handleConnectNow}
                        disabled={!iframeReady && !!pendingContextRef.current}
                      >
                        {!iframeReady && pendingContextRef.current
                          ? "Connecting\u2026"
                          : "Connect now"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Connected confirmation */}
              {connected && !counselVisible && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800 font-medium">
                    Connected to Counsel
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="border-t bg-white px-4 py-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!input.trim()}>
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
