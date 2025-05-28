import { Metadata } from "next";
import SettingsPageClient from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings | GMC Attendance Viewer",
  description: "Configure your Gujranwala Medical College (GMC) Attendance Viewer settings. Define the start and end dates for each quarter.",
  openGraph: {
    title: "Settings | GMC Attendance Viewer",
    description: "Configure your Gujranwala Medical College (GMC) Attendance Viewer settings. Define the start and end dates for each quarter.",
    url: "https://gmc-attendance-viewer.vercel.com/settings",
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
    title: "Settings | GMC Attendance Viewer",
    description: "Configure your Gujranwala Medical College (GMC) Attendance Viewer settings. Define the start and end dates for each quarter.",
    images: [
      {
        url: "/logo.png",
        alt: "GMC Attendance Viewer Logo",
      },
    ],
    site: "https://gmc-attendance-viewer.vercel.com/settings",
  },
  alternates: {
    canonical: "https://gmc-attendance-viewer.vercel.com/settings",
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
