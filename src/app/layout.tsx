import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./layoutClient";
import { QuartersProvider } from "@/components/lib/QuartersContext";

export const metadata: Metadata = {
  title: "GMC Attendance Viewer",
  description: "A Progressive Web App for viewing GMC attendance records.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/logo.png", type: "image/png", sizes: "500x500" },
    { rel: "apple-touch-icon", url: "/logo.png", sizes: "500x500" },
  ],
  openGraph: {
    title: "GMC Attendance Viewer",
    description: "A Progressive Web App for viewing GMC attendance records.",
    url: "https://gmc-attendance-viewer.vercel.com/",
    siteName: "GMC Attendance Viewer",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "GMC Attendance Viewer Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GMC Attendance Viewer",
    description: "A Progressive Web App for viewing GMC attendance records.",
    images: [
      {
        url: "/logo.png",
        alt: "GMC Attendance Viewer Logo",
      },
    ],
    site: "https://gmc-attendance-viewer.vercel.com/",
  },
};

// Add viewport settings
export const viewport = {
  themeColor: "#2b4257",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QuartersProvider>
      <RootLayoutClient>{children}</RootLayoutClient>
    </QuartersProvider>
  );
}
