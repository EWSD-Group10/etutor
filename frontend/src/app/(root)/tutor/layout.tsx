import LayoutClient from "../../LayoutClient";

export default function TutorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutClient>{children}</LayoutClient>;
}
