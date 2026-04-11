"use client";

import { cn } from "@/lib/utils";

type CounselCardProps = {
  onConnect?: () => void;
  isConnecting?: boolean;
};

/**
 * CounselCard prompts the user to hand off to a Counsel doctor.
 * Rendered inside a host thread when a trigger phrase is detected.
 */
export default function CounselCard({ onConnect, isConnecting }: CounselCardProps) {
  return (
    <div className="max-w-[80%] rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-gray-900">
        It sounds like you need medical assistance.
      </p>
      <p className="mt-1 text-sm text-gray-600">
        We can connect you with a Counsel doctor who can help right away.
      </p>
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className={cn(
          "mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
          isConnecting ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700",
        )}
      >
        {isConnecting ? "Connecting..." : "Connect to Counsel"}
      </button>
    </div>
  );
}
