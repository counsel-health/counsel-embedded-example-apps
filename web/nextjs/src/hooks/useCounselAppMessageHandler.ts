import { useCallback, type RefObject } from "react";

/**
 * Outbound message types accepted by the Counsel iframe.
 * Source of truth: See Counsel API documentation.
 */
type SwitchThreadMessage = {
  type: "switch_thread";
  thread_id: string;
};

type CounselOutboundMessage = SwitchThreadMessage;

/**
 * Inbound message types emitted by the Counsel iframe.
 */
export type CounselInboundMessage =
  | { type: "counsel:thread_created"; threadId: string }


type Options = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  iframeOrigin: string | null;
};

/**
 * Returns stable send-helpers for communicating with the Counsel iframe
 * via postMessage. Add new methods here as the Counsel embedded message
 * interface expands.
 */
export function useCounselAppMessageHandler({ iframeRef, iframeOrigin }: Options) {
  const sendMessage = useCallback(
    (message: CounselOutboundMessage) => {
      if (!iframeRef.current?.contentWindow || !iframeOrigin) return;
      iframeRef.current.contentWindow.postMessage(message, iframeOrigin);
    },
    [iframeRef, iframeOrigin],
  );

  const switchThread = useCallback(
    (threadId: string) => {
      sendMessage({ type: "switch_thread", thread_id: threadId });
    },
    [sendMessage],
  );

  return { switchThread };
}
