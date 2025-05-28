import Attendance from "@/components/Attendance";

export const metadata = {
  title: "GMC Attendance Viewer",
  description: "Easily check, analyze, and track your attendance records at Gujranwala Medical College (GMC) with a modern, mobile-friendly web app.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/logo.png", type: "image/png", sizes: "500x500" },
    { rel: "apple-touch-icon", url: "/logo.png", sizes: "500x500" },
  ],
  openGraph: {
    title: "GMC Attendance Viewer",
    description: "Easily check, analyze, and track your attendance records at Gujranwala Medical College (GMC) with a modern, mobile-friendly web app.",
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
    description: "Easily check, analyze, and track your attendance records at Gujranwala Medical College (GMC) with a modern, mobile-friendly web app.",
    images: [
      {
        url: "/logo.png",
        alt: "GMC Attendance Viewer Logo",
      },
    ],
    site: "https://gmc-attendance-viewer.vercel.com/",
  },
  alternates: {
    canonical: "https://gmc-attendance-viewer.vercel.com/",
  },
};

export default function Home() {
  return (
    <div>
      <Attendance />
    </div>
  );
}