import type { Metadata, Viewport } from "next";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export const metadata: Metadata = {
  title: "GroundUp AI: Development Financial Control & Construction Intelligence",
  description:
    "Source-led financial control layer for real estate developers, owners, and capital partners. Automated draw package assembly, statutory lien protection, and live forecast at completion.",
  keywords: [
    "construction finance",
    "real estate development",
    "draw requests",
    "AIA G702",
    "construction loan management",
    "lien waivers",
    "CSI MasterFormat",
    "pro forma forecast",
  ],
  authors: [{ name: "GroundUp AI" }],
  openGraph: {
    title: "GroundUp AI: Development Financial Control & Construction Intelligence",
    description:
      "Source-led financial control layer for real estate developers, owners, and capital partners.",
    url: "https://groundup.ai",
    siteName: "GroundUp AI",
    images: [
      {
        url: "/landing/hero-building.jpg",
        width: 1200,
        height: 630,
        alt: "GroundUp AI Construction Financial Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GroundUp AI: Development Financial Control",
    description:
      "Source-led financial control layer for real estate developers, owners, and capital partners.",
    images: ["/landing/hero-building.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function HomePage() {
  return <LandingPageClient />;
}
