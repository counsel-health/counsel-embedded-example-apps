import DashboardPage from "@/components/DashboardPage";
import { getRecentOrders } from "@/lib/mocks";

export default function Dashboard() {
  const recentOrders = getRecentOrders();
  return <DashboardPage recentOrders={recentOrders} />;
}
