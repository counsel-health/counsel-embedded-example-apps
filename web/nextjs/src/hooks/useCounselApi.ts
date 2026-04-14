import type { ThreadItem } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { counselQueryKeys } from "./counselQueryKeys";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CounselApiConfig = {
  /** Counsel user ID */
  counselUserId: string;
  /**
   * When set, calls `${counselDirectApiBase}/…` with Bearer auth (JWT flow).
   * When empty, calls same-origin `/api/counsel/…` with session cookies (API key flow via demo server proxy).
   */
  counselJwt: string;
  /** `${COUNSEL_API_URL}/v1/user/${counselUserId}` — used only when counselJwt is set */
  counselDirectApiBase: string;
};

export type InitialMessage = { body: string; role: "patient" | "model" };

type SignedUrlAction =
  | { action: "open_thread"; thread_id: string }
  | {
      action: "create_thread";
      initial_messages?: InitialMessage[];
      agent_context?: Record<string, unknown>;
    };

// ---------------------------------------------------------------------------
// Raw fetch helpers
// ---------------------------------------------------------------------------

async function fetchThreadsFromServer(config: CounselApiConfig): Promise<ThreadItem[]> {
  const direct = config.counselJwt.length > 0;
  const url = direct ? `${config.counselDirectApiBase}/threads` : "/api/counsel/threads";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(),
  };
  if (direct) {
    headers.Authorization = `Bearer ${config.counselJwt}`;
  }
  const resp = await fetch(url, {
    method: "GET",
    headers,
    credentials: direct ? "omit" : "include",
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch threads: ${resp.status}`);
  }
  const data = await resp.json();
  return data.threads ?? [];
}

/**
 * TODO(cleanup): Remove this polling path once Counsel supports either (1) creating a thread via HTTP
 * before opening the iframe, or (2) a postMessage from the embed with the real `thread_id` after
 * `create_thread` completes. Then replace callers with a single refetch or cache update from that source.
 *
 * Polls GET /threads until a row appears that was not in `baselineThreadIds` (iframe create_thread is async).
 */
const POLL_INITIAL_DELAY_MS = 250;
const POLL_MAX_DELAY_MS = 4000;
const POLL_DEADLINE_MS = 45_000;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort);
  });
}

function pickNewestByActivity(threads: ThreadItem[]): ThreadItem {
  return threads.reduce((best, t) =>
    new Date(t.last_activity_time).getTime() > new Date(best.last_activity_time).getTime()
      ? t
      : best,
  );
}

/**
 * Refetches threads until the server returns at least one id not in `baselineThreadIds`, or deadline/abort.
 * Delete this export and its private helpers once Counsel offers create-via-API or embed `thread_id` messaging
 * (see TODO on the poll constants block in this file).
 */
export async function pollUntilNewCounselThread(
  config: CounselApiConfig,
  baselineThreadIds: ReadonlySet<string>,
  signal: AbortSignal,
): Promise<{ threads: ThreadItem[]; newThread: ThreadItem } | null> {
  const started = Date.now();
  let delay = POLL_INITIAL_DELAY_MS;
  let firstAttempt = true;

  while (Date.now() - started < POLL_DEADLINE_MS) {
    if (signal.aborted) return null;

    if (!firstAttempt) {
      try {
        await sleep(delay, signal);
      } catch {
        return null;
      }
      delay = Math.min(delay * 2, POLL_MAX_DELAY_MS);
    }
    firstAttempt = false;

    if (signal.aborted) return null;

    let threads: ThreadItem[];
    try {
      threads = await fetchThreadsFromServer(config);
    } catch {
      continue;
    }

    const newcomers = threads.filter((t) => !baselineThreadIds.has(t.id));
    if (newcomers.length > 0) {
      const newThread = pickNewestByActivity(newcomers);
      return { threads, newThread };
    }
  }

  return null;
}

async function fetchSignedUrlFromServer(
  config: CounselApiConfig,
  action?: SignedUrlAction,
): Promise<string> {
  const sessionData: Record<string, unknown> = {
    view: { navigation: "integrated" },
  };
  if (action) {
    // Counsel signedAppUrl expects a single `action` object. For create_thread,
    // initial_messages and agent_context must live on that object (not on sessionData).
    if (action.action === "create_thread") {
      sessionData.action = {
        action: "create_thread",
        initial_messages: action.initial_messages,
        agent_context: action.agent_context,
      };
    } else {
      sessionData.action = action;
    }
  }

  const direct = config.counselJwt.length > 0;
  const signedUrlEndpoint = direct
    ? `${config.counselDirectApiBase}/signedAppUrl`
    : "/api/counsel/signedAppUrl";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": crypto.randomUUID(),
  };
  if (direct) {
    headers.Authorization = `Bearer ${config.counselJwt}`;
  }
  const resp = await fetch(signedUrlEndpoint, {
    method: "POST",
    headers,
    credentials: direct ? "omit" : "include",
    body: JSON.stringify(sessionData),
  });
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
 * Fetches Counsel threads via react-query and provides optimistic update
 * helpers for sidebar management.
 */
export function useCounselThreads(config: CounselApiConfig) {
  const queryClient = useQueryClient();
  const queryKey = counselQueryKeys.threads(config.counselUserId);

  const {
    data: threads = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchThreadsFromServer(config),
    enabled: !!config.counselUserId,
  });

  const addThread = useCallback(
    (thread: ThreadItem) => {
      queryClient.setQueryData<ThreadItem[]>(queryKey, (old = []) => [thread, ...old]);
    },
    [queryClient, queryKey],
  );

  /** Marks the threads query stale and triggers a background refetch. */
  const invalidateThreads = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { threads, isLoading, error, addThread, invalidateThreads };
}

/**
 * Returns a `getSignedUrl` function backed by react-query's useMutation,
 * along with an `isPending` flag.
 */
export function useCounselSignedUrl(config: CounselApiConfig) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (action?: SignedUrlAction) => fetchSignedUrlFromServer(config, action),
  });

  return { getSignedUrl: mutateAsync, isPending };
}
