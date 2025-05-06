export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-6 mx-auto container">{children}</div>;
}
