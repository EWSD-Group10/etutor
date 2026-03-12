import LayoutClient from "../LayoutClient";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutClient>{children}</LayoutClient>;
}
