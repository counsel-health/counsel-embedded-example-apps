import { useCallback, useMemo } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ThreadItem } from "@/lib/schemas";
import type { HostThread } from "./types";

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

type UnifiedThread =
  | { type: "host"; thread: HostThread }
  | { type: "counsel"; thread: ThreadItem };

type ChatListProps = {
  hostThreads: HostThread[];
  counselThreads: ThreadItem[];
  activeThreadId: string | null;
  activeThreadType: "host" | "counsel" | null;
  onHostThreadClick: (threadId: string) => void;
  onCounselThreadClick: (threadId: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  isPending: boolean;
  isThreadsLoading?: boolean;
};

export default function ChatList({
  hostThreads,
  counselThreads,
  activeThreadId,
  activeThreadType,
  onHostThreadClick,
  onCounselThreadClick,
  onNewChat,
  onSignOut,
  isPending,
  isThreadsLoading,
}: ChatListProps) {
  const allThreads = useMemo<UnifiedThread[]>(
    () =>
      [
        ...hostThreads.map((thread): UnifiedThread => ({ type: "host", thread })),
        ...counselThreads.map((thread): UnifiedThread => ({ type: "counsel", thread })),
      ].sort(
        (a, b) =>
          new Date(b.thread.last_activity_time).getTime() -
          new Date(a.thread.last_activity_time).getTime(),
      ),
    [hostThreads, counselThreads],
  );

  const handleSelectThread = useCallback(
    (item: UnifiedThread) => {
      if (item.type === "host") {
        onHostThreadClick(item.thread.id);
      } else {
        onCounselThreadClick(item.thread.id);
      }
    },
    [onHostThreadClick, onCounselThreadClick],
  );

  return (
    <aside className="w-[280px] shrink-0 border-r bg-gray-50 flex flex-col max-sm:hidden">
      <div className="p-3 border-b">
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={onNewChat}
          disabled={isPending}
        >
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isThreadsLoading && (
          <p className="p-3 text-xs text-gray-400">Loading threads...</p>
        )}
        {!isThreadsLoading && allThreads.length === 0 && (
          <p className="p-3 text-xs text-gray-400">No conversations yet</p>
        )}
        {allThreads.map((item) => {
          const isActive =
            activeThreadId === item.thread.id && activeThreadType === item.type;
          const displayName =
            item.thread.display_name ||
            (item.type === "counsel" ? "Counsel chat" : "New chat");

          return (
            <button
              key={`${item.type}-${item.thread.id}`}
              onClick={() => handleSelectThread(item)}
              disabled={isPending}
              className={cn(
                "w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-gray-100 transition-colors",
                isActive && "bg-gray-100",
                isPending && "opacity-50 cursor-wait",
              )}
            >
              <div className="flex items-center gap-1.5">
                {item.type === "counsel" ? (
                  <Stethoscope className="w-3 h-3 text-blue-400 shrink-0" />
                ) : (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                )}
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 ml-3">
                {formatRelativeTime(item.thread.last_activity_time)}
              </p>
            </button>
          );
        })}
      </div>
      <div className="p-3 border-t">
        <button
          onClick={onSignOut}
          className="w-full text-left text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 py-1.5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
