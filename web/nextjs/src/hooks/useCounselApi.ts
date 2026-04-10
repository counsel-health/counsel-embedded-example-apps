import { useCallback, useEffect, useState } from "react";
import type { ThreadItem } from "@/lib/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CounselApiConfig = {
  /** Counsel API URL (e.g. http://localhost:4002) */
  counselApiUrl: string;
  /** Counsel JWT for Bearer auth against the Counsel API */
  counselJwt: string;
  /** Counsel user ID */
  counselUserId: string;
};

type SignedUrlAction =
  | { action: "open_thread"; thread_id: string }
  | { action: "create_thread" };

// ---------------------------------------------------------------------------
// Raw fetch helpers
// ---------------------------------------------------------------------------

async function fetchThreadsFromServer(
  config: CounselApiConfig
): Promise<ThreadItem[]> {
  const resp = await fetch(
    `${config.counselApiUrl}/v1/user/${config.counselUserId}/threads`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.counselJwt}`,
        "Idempotency-Key": crypto.randomUUID(),
      },
    }
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch threads: ${resp.status}`);
  }
  const data = await resp.json();
  return data.threads ?? [];
}

async function fetchSignedUrlFromServer(
  config: CounselApiConfig,
  action?: SignedUrlAction
): Promise<string> {
  const sessionData: Record<string, unknown> = {
    view: { navigation: "integrated" },
  };
  if (action) {
    sessionData.action = action;
  }

  const resp = await fetch(
    `${config.counselApiUrl}/v1/user/${config.counselUserId}/signedAppUrl`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.counselJwt}`,
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(sessionData),
    }
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch signed URL: ${resp.status}`);
  }
  const { url } = await resp.json();
  return url;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetches Counsel threads on mount and provides an `addThread` helper
 * for optimistic sidebar updates.
 */
export function useCounselThreads(config: CounselApiConfig) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchThreadsFromServer(config)
      .then(setThreads)
      .catch((err) => {
        console.error("Failed to load threads:", err);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [config]);

  const addThread = useCallback((thread: ThreadItem) => {
    setThreads((prev) => [thread, ...prev]);
  }, []);

  const replaceThreadId = useCallback((fromId: string, toId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === fromId ? { ...t, id: toId } : t))
    );
  }, []);

  return { threads, isLoading, error, addThread, replaceThreadId };
}

/**
 * Returns a `getSignedUrl` function that fetches a one-time-use signed
 * app URL from the demo server, along with an `isPending` flag.
 */
export function useCounselSignedUrl(config: CounselApiConfig) {
  const [isPending, setIsPending] = useState(false);

  const getSignedUrl = useCallback(
    async (action?: SignedUrlAction): Promise<string> => {
      setIsPending(true);
      try {
        return await fetchSignedUrlFromServer(config, action);
      } finally {
        setIsPending(false);
      }
    },
    [config]
  );

  return { getSignedUrl, isPending };
}
