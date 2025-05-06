import DashboardPage from "@/components/DashboardPage";
import { getRecentOrders } from "@/lib/mocks";
import SharedLayout from "@/components/SharedLayout";

export default function Dashboard() {
  const recentOrders = getRecentOrders();
  return (
    <SharedLayout>
      <DashboardPage recentOrders={recentOrders} />
    </SharedLayout>
  );
}
