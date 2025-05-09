import type React from "react";
import Header from "@/components/Header";
import { getCounselSignedAppUrl } from "@/lib/server";
import { getUser } from "@/lib/mocks";
import ChatPage from "@/components/ChatPage";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = getUser(session.userId);
  const signedAppUrl = await getCounselSignedAppUrl(user.id);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      {/* Main Content */}
      <main className="flex-1 h-full min-h-0">
        {/* Always render the ChatPage in the main content so that it doesn't get torn down by the browser on navigation */}
        <ChatPage signedAppUrl={signedAppUrl} />
        {children}
      </main>
    </div>
  );
}
