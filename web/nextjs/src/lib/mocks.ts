import { Order } from "@/types/order";
import { User } from "@/types/user";

// ================================================
// Mock Data
// ================================================

// Recent Orders
export const getRecentOrders = (): Order[] => [
  {
    id: "ORD-2023-001",
    name: "Multivitamin Complex",
    type: "medication",
    date: "May 2, 2025",
    status: "delivered",
  },
  {
    id: "ORD-2023-002",
    name: "Blood Panel Test",
    type: "lab",
    date: "May 4, 2025",
    status: "pending",
  },
  {
    id: "ORD-2023-003",
    name: "Cholesterol Medication",
    type: "medication",
    date: "April 28, 2025",
    status: "delivered",
  },
];

export const getAllOrders = (): Order[] => [
  ...getRecentOrders(),
  {
    id: "ORD-2023-004",
    name: "Thyroid Function Test",
    type: "lab",
    date: "April 15, 2025",
    status: "completed",
  },
  {
    id: "ORD-2023-005",
    name: "Blood Pressure Medication",
    type: "medication",
    date: "April 10, 2025",
    status: "delivered",
  },
];

// ================================================
// User
// ================================================

// The ID is not a mock, it's created each time
export const getUser = (): User => {
  return {
    id: "123",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    memberSince: "January 2023",
    plan: "Premium Wellness",
    medicalConditions: "Asthma, Diabetes",
    medications: "Aspirin, Ibuprofen",
  };
};
