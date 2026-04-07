import { useCallback, useEffect, useRef, useState } from "react";
import type { CounselAppProps } from "./CounselApp";

/**
 * Message types sent from the host to the Counsel iframe.
 */
type CounselHostMessage =
  | {
      type: "counsel:startChat";
      payload: {
        requestId: string;
        hiddenContext?: string;
        module?: string;
      };
    }
  | {
      type: "counsel:resumeChat";
      payload: {
        requestId: string;
        threadId: string;
        hiddenContext?: string;
      };
    };

/**
 * Message types received from the Counsel iframe.
 */
type CounselIframeMessage =
  | { type: "counsel:ready" }
  | {
      type: "counsel:chatStarted";
      payload: { requestId: string; threadId: string; convoId: string };
    }
  | {
      type: "counsel:chatResumed";
      payload: { requestId: string; threadId: string };
    }
  | {
      type: "counsel:error";
      payload: { requestId: string; code: string; message: string };
    };

export type CounselAppClientProps = CounselAppProps & {
  onReady?: () => void;
  onChatStarted?: (threadId: string, convoId: string) => void;
  onChatResumed?: (threadId: string) => void;
  onError?: (code: string, message: string) => void;
};

/**
 * CounselAppClient renders the Counsel app inside an iframe and provides
 * a postMessage bridge for the host application to communicate with it.
 */
export default function CounselAppClient({
  signedAppUrl,
  className,
  onReady,
  onChatStarted,
  onChatResumed,
  onError,
}: CounselAppClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeOrigin, setIframeOrigin] = useState<string | null>(null);

  // Derive the iframe origin from the signedAppUrl
  useEffect(() => {
    try {
      const url = new URL(signedAppUrl);
      setIframeOrigin(url.origin);
    } catch {
      console.error("Invalid signedAppUrl:", signedAppUrl);
    }
  }, [signedAppUrl]);

  // Listen for messages from the Counsel iframe
  useEffect(() => {
    if (!iframeOrigin) return;

    const handler = (event: MessageEvent) => {
      if (event.origin !== iframeOrigin) return;

      const data = event.data as CounselIframeMessage;
      if (typeof data?.type !== "string" || !data.type.startsWith("counsel:")) {
        return;
      }

      switch (data.type) {
        case "counsel:ready":
          console.log("[CounselApp] Iframe is ready");
          onReady?.();
          break;
        case "counsel:chatStarted":
          console.log("[CounselApp] Chat started:", data.payload);
          onChatStarted?.(data.payload.threadId, data.payload.convoId);
          break;
        case "counsel:chatResumed":
          console.log("[CounselApp] Chat resumed:", data.payload);
          onChatResumed?.(data.payload.threadId);
          break;
        case "counsel:error":
          console.error("[CounselApp] Error:", data.payload);
          onError?.(data.payload.code, data.payload.message);
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [iframeOrigin, onReady, onChatStarted, onChatResumed, onError]);

  /**
   * Send a message to the Counsel iframe.
   */
  const sendMessage = useCallback(
    (message: CounselHostMessage) => {
      if (!iframeRef.current?.contentWindow || !iframeOrigin) {
        console.error("[CounselApp] Cannot send message: iframe not ready");
        return;
      }
      iframeRef.current.contentWindow.postMessage(message, iframeOrigin);
    },
    [iframeOrigin]
  );

  // Expose sendMessage via a ref-stable callback on the window for easy access
  useEffect(() => {
    (window as Record<string, unknown>).__counselSendMessage = sendMessage;
    return () => {
      delete (window as Record<string, unknown>).__counselSendMessage;
    };
  }, [sendMessage]);

  return (
    <iframe
      title="Counsel App"
      ref={iframeRef}
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
