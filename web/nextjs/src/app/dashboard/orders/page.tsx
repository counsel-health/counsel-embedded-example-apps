
import { OrderPage } from "@/components/OrderPage";
import { getAllOrders } from "@/lib/mocks";

export default function OrdersPage() {
  const orders = getAllOrders();
  return <OrderPage orders={orders} />;
}
