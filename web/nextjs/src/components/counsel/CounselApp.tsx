import dynamic from "next/dynamic";
import CounselLoading from "./CounselLoading";

export type CounselAppProps = {
  signedAppUrl: string;
  className?: string;
};

/**
 * CounselApp is a dynamic import of CounselAppClient that is not server-side rendered.
 * This is because the signedAppUrl is a one-time use url and rendering on the server-side will not work.
 */
export const CounselApp = dynamic<CounselAppProps>(
  () => {
    console.log("importing CounselAppClient");
    return import("./CounselAppClient");
  },

  /**
   * Turn off SSR for this component.
   * This is extremely important as the signedAppUrl is a one-time use url.
   * Do not server render an iFrame as it will not work.
   * By default NextJS will server render all components.
   */
  {
    ssr: false,
    loading: () => <CounselLoading />,
  }
);
