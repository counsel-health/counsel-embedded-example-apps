"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CounselApp } from "./counsel/CounselApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

type HandOffChatPageProps = {
  signedAppUrl: string;
  /**
   * The phrase that triggers the Counsel handoff card.
   * Defaults to "I need a doctor".
   */
  handoffTrigger?: string;
};

/**
 * HandOffChatPage renders a mock host chat alongside a preloaded Counsel iframe.
 * When the user's message contains the handoff trigger phrase, an inline card
 * appears prompting them to connect to the Counsel medical AI. Clicking
 * "Tell me more" transitions to the Counsel iframe (no reload needed).
 */
export default function HandOffChatPage({
  signedAppUrl,
  handoffTrigger = DEFAULT_HANDOFF_TRIGGER,
}: HandOffChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [counselVisible, setCounselVisible] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, handoffTriggered]);

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

  const handleHandoff = useCallback(() => {
    const sendCounselMessage = (
      window as Record<string, unknown>
    ).__counselSendMessage as
      | ((msg: Record<string, unknown>) => void)
      | undefined;

    // Build a plain-text summary of the last 5 messages for the AI agent
    const recentMessages = messages.slice(-5);
    const hiddenContext = recentMessages
      .map((m) => `${m.role === "user" ? "Patient" : "Support bot"}: ${m.text}`)
      .join("\n");

    setCounselVisible(true);

    // Start a new Counsel chat with the conversation context
    sendCounselMessage?.({
      type: "counsel:startChat",
      payload: {
        requestId: crypto.randomUUID(),
        hiddenContext,
      },
    });
  }, [messages]);

  return (
    <div className="relative h-full w-full">
      {/* Host chat UI — hidden once Counsel takes over */}
      <div
        className={cn(
          "flex h-full flex-col",
          counselVisible ? "hidden" : "flex"
        )}
      >
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
          {handoffTriggered && (
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
                    onClick={handleHandoff}
                    disabled={!iframeReady}
                  >
                    {iframeReady ? "Tell me more" : "Connecting…"}
                  </Button>
                </CardContent>
              </Card>
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
            placeholder="Type a message…"
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>
            Send
          </Button>
        </div>
      </div>

      {/* Counsel iframe — always rendered for preloading, shown full-screen on handoff */}
      <div className={cn("h-full w-full", counselVisible ? "block" : "hidden")}>
        <CounselApp
          signedAppUrl={signedAppUrl}
          className="h-full w-full"
          onReady={() => setIframeReady(true)}
        />
      </div>
    </div>
  );
}
