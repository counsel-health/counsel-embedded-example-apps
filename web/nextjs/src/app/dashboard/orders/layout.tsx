import SharedLayout from "@/components/SharedLayout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}
