import SharedLayout from "@/components/SharedLayout";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}
