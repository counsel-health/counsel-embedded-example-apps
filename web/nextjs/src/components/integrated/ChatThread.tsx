import { cn } from "@/lib/utils";
import type { HostThread } from "./types";

type ChatThreadProps = {
  thread: HostThread;
};

/**
 * ChatThread renders a host app chat thread.
 * This is a mock/demo UI showing what a host application's own chat
 * experience might look like alongside the embedded Counsel chat.
 */
export default function ChatThread({ thread }: ChatThreadProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {thread.display_name}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] rounded-lg px-3 py-2 text-sm",
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input placeholder */}
      <div className="border-t px-4 py-3">
        <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-400">
          Type a message…
        </div>
      </div>
    </div>
  );
}
