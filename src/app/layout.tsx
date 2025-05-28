import "./globals.css";
import RootLayoutClient from "./layoutClient";

export const viewport = {
  themeColor: "#2b4257",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
