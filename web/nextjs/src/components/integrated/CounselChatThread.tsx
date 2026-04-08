import { CounselApp } from "@/components/counsel/CounselApp";

type CounselChatThreadProps = {
  signedAppUrl: string;
  isLoading?: boolean;
};

/**
 * CounselChatThread wraps the Counsel iframe for displaying a Counsel thread
 * in the integrated navigation mode.
 */
export default function CounselChatThread({
  signedAppUrl,
  isLoading,
}: CounselChatThreadProps) {
  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <div className="text-sm text-gray-500">Loading…</div>
        </div>
      )}
      <CounselApp
        key={signedAppUrl}
        signedAppUrl={signedAppUrl}
        className="h-full w-full"
      />
    </div>
  );
}
