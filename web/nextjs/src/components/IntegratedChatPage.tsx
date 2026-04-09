"use client";

import { useCallback, useState } from "react";
import type { ThreadItem } from "@/lib/schemas";
import type { HostThread } from "./integrated/types";
import ChatList from "./integrated/ChatList";
import ChatThread from "./integrated/ChatThread";
import CounselChatThread from "./integrated/CounselChatThread";
import { signOut } from "@/actions/signOut";
import {
  useCounselThreads,
  useCounselSignedUrl,
  type CounselApiConfig,
} from "@/hooks/useCounselApi";

// ---------------------------------------------------------------------------
// Trigger phrase — any message containing this (case-insensitive) will show
// the "Connect to Counsel" card.
// ---------------------------------------------------------------------------

const COUNSEL_TRIGGER = "i need a doctor";

// ---------------------------------------------------------------------------
// Mock data — one hardcoded host thread as the default conversation
// ---------------------------------------------------------------------------

let nextHostThreadId = 2;

function createDefaultHostThread(): HostThread {
  return {
    id: "host-1",
    display_name: "Welcome",
    last_activity_time: new Date().toISOString(),
    messages: [
      {
        role: "bot",
        text: "Welcome! This is your care team's chat. How can we help you today?",
      },
    ],
  };
}

function createNewHostThread(): HostThread {
  const id = `host-${nextHostThreadId++}`;
  return {
    id,
    display_name: "New chat",
    last_activity_time: new Date().toISOString(),
    messages: [
      {
        role: "bot",
        text: "Hi there! How can we help you?",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActiveThread =
  | { type: "host"; id: string }
  | { type: "counsel"; id: string };

type IntegratedChatPageProps = {
  /** Credentials for calling the demo server directly from the browser. */
  counselApiConfig: CounselApiConfig;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * IntegratedChatPage demonstrates the "integrated" navigation pattern:
 * the host app manages the thread sidebar and renders either its own chat
 * UI (host threads) or the Counsel iframe (Counsel threads).
 *
 * All API calls (threads, signed URLs) go directly from the browser to
 * the demo server — no Next.js server middleman.
 */
export default function IntegratedChatPage({
  counselApiConfig,
}: IntegratedChatPageProps) {
  const defaultThread = createDefaultHostThread();

  const [hostThreads, setHostThreads] = useState<HostThread[]>([
    defaultThread,
  ]);
  const [activeThread, setActiveThread] = useState<ActiveThread>({
    type: "host",
    id: defaultThread.id,
  });
  const [currentSignedUrl, setCurrentSignedUrl] = useState<string | null>(null);

  const {
    threads: counselThreads,
    isLoading: isThreadsLoading,
    addThread,
  } = useCounselThreads(counselApiConfig);
  const { getSignedUrl, isPending: isLoading } =
    useCounselSignedUrl(counselApiConfig);

  // ---- Handlers -----------------------------------------------------------

  const handleHostThreadClick = useCallback(
    (threadId: string) => {
      if (isLoading) return;
      setActiveThread({ type: "host", id: threadId });
    },
    [isLoading]
  );

  const handleCounselThreadClick = useCallback(
    async (threadId: string) => {
      if (isLoading) return;
      setActiveThread({ type: "counsel", id: threadId });
      try {
        const isPlaceholder = threadId.startsWith("counsel-new-");
        const url = isPlaceholder
          ? await getSignedUrl({ action: "create_thread" })
          : await getSignedUrl({
              action: "open_thread",
              thread_id: threadId,
            });
        setCurrentSignedUrl(url);
      } catch (error) {
        console.error("Failed to load Counsel thread:", error);
      }
    },
    [isLoading, getSignedUrl]
  );

  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    const newThread = createNewHostThread();
    setHostThreads((prev) => [newThread, ...prev]);
    setActiveThread({ type: "host", id: newThread.id });
  }, [isLoading]);

  const handleSendMessage = useCallback(
    (threadId: string, text: string) => {
      const isTrigger = text.toLowerCase().includes(COUNSEL_TRIGGER);

      setHostThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                last_activity_time: new Date().toISOString(),
                messages: [
                  ...t.messages,
                  { role: "user" as const, text },
                  ...(isTrigger
                    ? [{ role: "bot" as const, type: "counsel-card" as const }]
                    : [
                        {
                          role: "bot" as const,
                          text: "Thanks for your message! This is a demo response.",
                        },
                      ]),
                ],
              }
            : t
        )
      );
    },
    []
  );

  const handleConnectCounsel = useCallback(async () => {
    if (isLoading) return;
    try {
      const url = await getSignedUrl({ action: "create_thread" });
      setCurrentSignedUrl(url);

      const newCounselThread: ThreadItem = {
        id: `counsel-new-${Date.now()}`,
        display_name: "Counsel chat",
        last_activity_time: new Date().toISOString(),
        mode: "ai",
      };
      addThread(newCounselThread);
      setActiveThread({ type: "counsel", id: newCounselThread.id });
    } catch (error) {
      console.error("Failed to connect to Counsel:", error);
    }
  }, [isLoading, getSignedUrl, addThread]);

  // ---- Render -------------------------------------------------------------

  const activeHostThread =
    activeThread.type === "host"
      ? hostThreads.find((t) => t.id === activeThread.id)
      : null;

  return (
    <div className="flex h-full w-full">
      <ChatList
        hostThreads={hostThreads}
        counselThreads={counselThreads}
        activeThreadId={activeThread.id}
        activeThreadType={activeThread.type}
        onHostThreadClick={handleHostThreadClick}
        onCounselThreadClick={handleCounselThreadClick}
        onNewChat={handleNewChat}
        onSignOut={signOut}
        isPending={isLoading}
        isThreadsLoading={isLoading}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {activeThread.type === "host" && activeHostThread ? (
          <ChatThread
            thread={activeHostThread}
            onSendMessage={handleSendMessage}
            onConnectCounsel={handleConnectCounsel}
            isConnecting={isLoading}
          />
        ) : activeThread.type === "counsel" && currentSignedUrl ? (
          <CounselChatThread
            signedAppUrl={currentSignedUrl}
            isLoading={isLoading}
          />
        ) : activeThread.type === "counsel" ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
