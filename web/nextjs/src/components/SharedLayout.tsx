export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 w-full">
      {children}
    </div>
  );
}
