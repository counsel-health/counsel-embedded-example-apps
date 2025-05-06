"use client";

import { usePathname } from "next/navigation";
import { CounselApp } from "./counsel/CounselApp";
import { cn } from "@/lib/utils";

/**
 * Explanation:
 * - The ChatPage is always mounted in the app so that the iFrame is persistent and doesn't get torn down by the browser on navigation.
 * - If the page is not the chat page, the iframe is hidden.
 *
 * Feel free to follow this pattern in order to create an experience that is seamless and performant for your users.
 * It is also okay to reload the iframe and only mount it on a single page but it will cause a flash each time a user navigates to that page.
 */
export default function ChatPage({ signedAppUrl }: { signedAppUrl: string }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat");
  const hideIframe = !isChatPage;

  return (
    <CounselApp
      signedAppUrl={signedAppUrl}
      // Importantly the parent div(s) must have an explicit height set for height: 100% to work
      // In this case the parent is h-screen so the iframe will take the full height
      className={cn("h-full w-full", hideIframe && "hidden")}
    />
  );
}
