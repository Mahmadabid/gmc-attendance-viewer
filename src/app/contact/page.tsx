import { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | GMC Attendance Viewer",
  description: "Contact the Gujranwala Medical College (GMC) Attendance Viewer team for queries, bug reports, or feature requests.",
  openGraph: {
    title: "Contact | GMC Attendance Viewer",
    description: "Contact the Gujranwala Medical College (GMC) Attendance Viewer team for queries, bug reports, or feature requests.",
    url: "https://gmc-attendance-viewer.vercel.app/contact",
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
    title: "Contact | GMC Attendance Viewer",
    description: "Contact the Gujranwala Medical College (GMC) Attendance Viewer team for queries, bug reports, or feature requests.",
    images: [
      {
        url: "/logo.png",
        alt: "GMC Attendance Viewer Logo",
      },
    ],
    site: "https://gmc-attendance-viewer.vercel.app/contact",
  },
  alternates: {
    canonical: "https://gmc-attendance-viewer.vercel.app/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
