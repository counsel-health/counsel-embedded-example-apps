import type { ThreadItem } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { counselQueryKeys } from "./counselQueryKeys";

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
  const resp = await fetch(`${config.counselApiUrl}/v1/user/${config.counselUserId}/threads`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.counselJwt}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch threads: ${resp.status}`);
  }
  const data = await resp.json();
  return data.threads ?? [];
}

async function fetchSignedUrlFromServer(
  config: CounselApiConfig,
  action?: SignedUrlAction,
): Promise<string> {
  const sessionData: Record<string, unknown> = {
    view: { navigation: "integrated" },
  };
  if (action) {
    if (action.action === "create_thread") {
      const { initial_messages, agent_context, ...actionBase } = action;
      sessionData.action = actionBase;
      if (initial_messages) Object.assign(actionBase, { initial_messages });
      if (agent_context) Object.assign(actionBase, { agent_context });
    } else {
      sessionData.action = action;
    }
  }

  const resp = await fetch(`${config.counselApiUrl}/v1/user/${config.counselUserId}/signedAppUrl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.counselJwt}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
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
    enabled: !!config.counselJwt && !!config.counselUserId,
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
