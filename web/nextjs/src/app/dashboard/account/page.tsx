import { getUser } from "@/lib/mocks";
import { AccountPage } from "@/components/AccountPage";

export default async function Account() {
  const user = getUser();
  return <AccountPage user={user} />;
}
