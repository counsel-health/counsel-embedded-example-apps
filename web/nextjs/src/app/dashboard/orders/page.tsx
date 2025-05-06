import { OrderPage } from "@/components/OrderPage";
import { getAllOrders } from "@/lib/mocks";

export default function Orders() {
  const orders = getAllOrders();
  return <OrderPage orders={orders} />;
}
