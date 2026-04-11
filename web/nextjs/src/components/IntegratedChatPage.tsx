"use client";

import { signOut } from "@/actions/signOut";
import {
  useCounselSignedUrl,
  useCounselThreads,
  type CounselApiConfig,
} from "@/hooks/useCounselApi";
import { useCallback, useState } from "react";
import ChatList from "./integrated/ChatList";
import ChatThread from "./integrated/ChatThread";
import CounselChatThread from "./integrated/CounselChatThread";
import type { HostThread } from "./integrated/types";

// ---------------------------------------------------------------------------
// Trigger phrase — any message containing this (case-insensitive) will show
// the "Connect to Counsel" card.
// ---------------------------------------------------------------------------

const COUNSEL_TRIGGER = "doctor";

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

type ActiveThread = { type: "host"; id: string } | { type: "counsel"; id: string };

type IntegratedChatPageProps = {
  /** Credentials for calling the Counsel API directly from the browser. */
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
 * the Counsel API using JWT auth — no demo server or Next.js middleman.
 */
export default function IntegratedChatPage({ counselApiConfig }: IntegratedChatPageProps) {
  const defaultThread = createDefaultHostThread();

  const [hostThreads, setHostThreads] = useState<HostThread[]>([defaultThread]);
  const [activeThread, setActiveThread] = useState<ActiveThread>({
    type: "host",
    id: defaultThread.id,
  });
  // The signed URL currently loaded in the Counsel iframe. Kept stable so the
  // iframe is not reloaded unnecessarily — switching threads uses switch_thread.
  const [counselSessionUrl, setCounselSessionUrl] = useState<string | null>(null);
  // When set, triggers a counsel:switchThread postMessage to the live iframe.
  const [activeCounselThreadId, setActiveCounselThreadId] = useState<string | null>(null);

  const {
    threads: counselThreads,
    isLoading: isThreadsLoading,
    addThread,
    invalidateThreads,
  } = useCounselThreads(counselApiConfig);
  const { getSignedUrl, isPending: isLoading } = useCounselSignedUrl(counselApiConfig);

  // ---- Handlers -----------------------------------------------------------

  const handleHostThreadClick = useCallback(
    (threadId: string) => {
      if (isLoading) return;
      setActiveThread({ type: "host", id: threadId });
    },
    [isLoading],
  );

  const handleCounselThreadClick = useCallback(
    async (threadId: string) => {
      if (isLoading) return;
      setActiveThread({ type: "counsel", id: threadId });

      if (counselSessionUrl) {
        // Session already active — navigate within the existing iframe.
        // For real thread IDs, send switch_thread. For placeholders, just
        // reveal the iframe (it's already showing that thread).
        if (!threadId.startsWith("counsel-new-")) {
          setActiveCounselThreadId(threadId);
        }
        return;
      }

      // No session yet — fetch the initial signed URL.
      try {
        const isPlaceholder = threadId.startsWith("counsel-new-");
        const url = isPlaceholder
          ? await getSignedUrl({ action: "create_thread" })
          : await getSignedUrl({ action: "open_thread", thread_id: threadId });
        setCounselSessionUrl(url);
      } catch (error) {
        console.error("Failed to load Counsel thread:", error);
      }
    },
    [isLoading, getSignedUrl, counselSessionUrl],
  );

  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    const newThread = createNewHostThread();
    setHostThreads((prev) => [newThread, ...prev]);
    setActiveThread({ type: "host", id: newThread.id });
  }, [isLoading]);

  const handleSendMessage = useCallback((threadId: string, text: string) => {
    const isTrigger = text.toLowerCase().includes(COUNSEL_TRIGGER);

    setHostThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              last_activity_time: new Date().toISOString(),
              showCounselCard: isTrigger ? true : t.showCounselCard,
              messages: [
                ...t.messages,
                { role: "user" as const, text },
                ...(!isTrigger
                  ? [
                      {
                        role: "bot" as const,
                        text: "Thanks for your message! This is a demo response.",
                      },
                    ]
                  : []),
              ],
            }
          : t,
      ),
    );
  }, []);

  const handleConnectCounsel = useCallback(
    async (hostThreadId: string) => {
      if (isLoading) return;
      try {
        const url = await getSignedUrl({ action: "create_thread" });

        setHostThreads((prev) =>
          prev.map((t) => (t.id === hostThreadId ? { ...t, showCounselCard: false } : t)),
        );

        // Add a placeholder immediately so the sidebar shows something while
        // the Counsel backend creates the real thread.
        const placeholderId = `counsel-new-${Date.now()}`;
        addThread({
          id: placeholderId,
          display_name: "Counsel chat",
          last_activity_time: new Date().toISOString(),
          mode: "ai",
        });
        setActiveThread({ type: "counsel", id: placeholderId });
        setCounselSessionUrl(url);
        setActiveCounselThreadId(null);
        invalidateThreads();
      } catch (error) {
        console.error("Failed to connect to Counsel:", error);
      }
    },
    [isLoading, getSignedUrl, addThread, invalidateThreads],
  );

  // ---- Render -------------------------------------------------------------

  const activeHostThread =
    activeThread.type === "host" ? hostThreads.find((t) => t.id === activeThread.id) : null;

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
        isThreadsLoading={isThreadsLoading}
      />

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Host thread — rendered on top when active */}
        {activeThread.type === "host" && activeHostThread && (
          <ChatThread
            key={activeHostThread.id}
            thread={activeHostThread}
            onSendMessage={handleSendMessage}
            onConnectCounsel={handleConnectCounsel}
            isConnecting={isLoading}
          />
        )}

        {/* Counsel iframe — kept mounted once a session exists so switch_thread
            works even after navigating away to a host thread and back. */}
        {counselSessionUrl && (
          <CounselChatThread
            hidden={activeThread.type !== "counsel"}
            signedAppUrl={counselSessionUrl}
            currentThreadId={activeCounselThreadId ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
