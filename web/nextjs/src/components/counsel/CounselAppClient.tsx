import type { CounselAppProps } from "./CounselApp";

/**
 * CounselApp is a component that renders a Counsel app inside an iframe.
 */
export default function CounselAppClient({ signedAppUrl, className }: CounselAppProps) {
  return (
    <iframe
      src={signedAppUrl}
      className={className}
      onError={(error) => {
        console.error("Failed to load Counsel app", error);
      }}
      // If you want to sandbox our iFrame, please add the following:
      // sandbox="allow-storage-access-by-user-activation allow-same-origin allow-scripts allow-forms"
    />
  );
}
