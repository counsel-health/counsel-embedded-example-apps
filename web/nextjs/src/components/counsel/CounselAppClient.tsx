import type { CounselAppProps } from "./CounselApp";

/**
 * CounselApp is a component that renders a Counsel app inside an iframe.
 */
export default function CounselAppClient({
  signedAppUrl,
  className,
}: CounselAppProps) {
  return <iframe src={signedAppUrl} className={className} />;
}
