import LayoutClient from "../../LayoutClient";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutClient>{children}</LayoutClient>;
}
