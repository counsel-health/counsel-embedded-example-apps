"use client";

import { useCallback, useEffect, useState } from "react";
import type { ThreadItem } from "@/lib/schemas";
import type { HostThread } from "./integrated/types";
import ChatList from "./integrated/ChatList";
import ChatThread from "./integrated/ChatThread";
import CounselChatThread from "./integrated/CounselChatThread";
import { signOut } from "@/actions/signOut";

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

type CounselApiConfig = {
  /** Demo server URL (e.g. http://localhost:4003) */
  serverHost: string;
  /** Session token for Bearer auth against the demo server */
  token: string;
  /** Counsel user ID */
  counselUserId: string;
};

type IntegratedChatPageProps = {
  /** Credentials for calling the demo server directly from the browser. */
  counselApiConfig: CounselApiConfig;
};

// ---------------------------------------------------------------------------
// API helpers — call the demo server directly from the browser
// ---------------------------------------------------------------------------

async function fetchSignedUrl(
  config: CounselApiConfig,
  action?:
    | { action: "open_thread"; thread_id: string }
    | { action: "create_thread" }
): Promise<string> {
  const sessionData: Record<string, unknown> = {
    view: { navigation: "integrated" },
  };
  if (action) {
    sessionData.action = action;
  }

  const resp = await fetch(`${config.serverHost}/user/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(sessionData),
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch signed URL: ${resp.status}`);
  }
  const { url } = await resp.json();
  return url;
}

async function fetchThreads(
  config: CounselApiConfig
): Promise<ThreadItem[]> {
  const resp = await fetch(`${config.serverHost}/user/threads`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    },
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch threads: ${resp.status}`);
  }
  const data = await resp.json();
  return data.threads ?? [];
}

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
  const [counselThreads, setCounselThreads] = useState<ThreadItem[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<ActiveThread>({
    type: "host",
    id: defaultThread.id,
  });
  const [currentSignedUrl, setCurrentSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ---- Fetch threads on mount ---------------------------------------------

  useEffect(() => {
    fetchThreads(counselApiConfig)
      .then((threads) => setCounselThreads(threads))
      .catch((error) => console.error("Failed to load threads:", error))
      .finally(() => setThreadsLoading(false));
  }, [counselApiConfig]);

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
      setIsLoading(true);
      try {
        // Placeholder threads (created locally via "Connect to Counsel") don't
        // have a real Counsel thread ID yet — use create_thread to resume.
        // Real threads from the API use open_thread with their UUID.
        const isPlaceholder = threadId.startsWith("counsel-new-");
        const url = isPlaceholder
          ? await fetchSignedUrl(counselApiConfig, { action: "create_thread" })
          : await fetchSignedUrl(counselApiConfig, {
              action: "open_thread",
              thread_id: threadId,
            });
        setCurrentSignedUrl(url);
      } catch (error) {
        console.error("Failed to load Counsel thread:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, counselApiConfig]
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
    setIsLoading(true);
    try {
      const url = await fetchSignedUrl(counselApiConfig, {
        action: "create_thread",
      });
      setCurrentSignedUrl(url);

      // Add a placeholder Counsel thread to the sidebar.
      // In a real app this would come from the API after the thread is created.
      const newCounselThread: ThreadItem = {
        id: `counsel-new-${Date.now()}`,
        display_name: "Counsel chat",
        last_activity_time: new Date().toISOString(),
        mode: "ai",
      };
      setCounselThreads((prev) => [newCounselThread, ...prev]);
      setActiveThread({ type: "counsel", id: newCounselThread.id });
    } catch (error) {
      console.error("Failed to connect to Counsel:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, counselApiConfig]);

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
        areThreadsLoading={threadsLoading}
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
