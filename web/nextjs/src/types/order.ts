export type OrderType = "medication" | "lab";
export type OrderStatus = "pending" | "completed" | "cancelled" | "delivered";

export type Order = {
  id: string;
  name: string;
  type: OrderType;
  date: string;
  status: OrderStatus;
};
