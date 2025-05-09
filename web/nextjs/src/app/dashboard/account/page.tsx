import { getUser } from "@/lib/mocks";
import { AccountPage } from "@/components/AccountPage";
import { getSession } from "@/lib/session";

export default async function Account() {
  const session = await getSession();
  const user = getUser(session.userId);
  return <AccountPage user={user} />;
}
