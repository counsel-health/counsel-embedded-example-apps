import { CounselApp } from "@/components/counsel/CounselApp";

type CounselChatThreadProps = {
  signedAppUrl: string;
  isLoading?: boolean;
  /** Sidebar id for sessions minted with `create_thread` (e.g. `counsel-new-*`); forwarded to `onChatStarted`. */
  placeholderThreadId?: string | null;
  onChatStarted?: (
    placeholderThreadId: string | null,
    threadId: string,
    convoId: string
  ) => void;
};

/**
 * CounselChatThread wraps the Counsel iframe for displaying a Counsel thread
 * in the integrated navigation mode.
 */
export default function CounselChatThread({
  signedAppUrl,
  isLoading,
  placeholderThreadId,
  onChatStarted,
}: CounselChatThreadProps) {
  return (
    <div className="relative h-full w-full">
      <CounselApp
        key={signedAppUrl}
        signedAppUrl={signedAppUrl}
        className="h-full w-full"
        onChatStarted={
          onChatStarted
            ? (threadId, convoId) =>
                onChatStarted(placeholderThreadId ?? null, threadId, convoId)
            : undefined
        }
      />
    </div>
  );
}
