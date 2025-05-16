import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "GMC Attendance Viewer",
  description: "A Progressive Web App for viewing GMC attendance records.",
  manifest: "/web.manifest",
  icons: [
    { rel: "icon", url: "/logo.ico", type: "image/x-icon", sizes: "48x48" },
    { rel: "icon", url: "/logo.png", type: "image/png", sizes: "512x512" },
    { rel: "apple-touch-icon", url: "/logo.png", sizes: "512x512" },
  ],
  openGraph: {
    title: "GMC Attendance Viewer",
    description: "A Progressive Web App for viewing GMC attendance records.",
    url: "https://gmc-attendance-viewer.vercel.com/",
    siteName: "GMC Attendance Viewer",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayoutClient>{children}</RootLayoutClient>
  );
}
