import { CounselApp } from "@/components/counsel/CounselApp";

type CounselChatThreadProps = {
  signedAppUrl: string;
  isLoading?: boolean;
  onChatStarted?: (threadId: string, convoId: string) => void;
};

/**
 * CounselChatThread wraps the Counsel iframe for displaying a Counsel thread
 * in the integrated navigation mode.
 */
export default function CounselChatThread({
  signedAppUrl,
  isLoading,
  onChatStarted,
}: CounselChatThreadProps) {
  return (
    <div className="relative h-full w-full">
      <CounselApp
        key={signedAppUrl}
        signedAppUrl={signedAppUrl}
        className="h-full w-full"
        onChatStarted={onChatStarted}
      />
    </div>
  );
}
