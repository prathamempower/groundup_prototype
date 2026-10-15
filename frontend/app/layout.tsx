import type { Metadata } from "next";
import "./globals.css";
import { fontSans, fontMono, ibmPlexSans, ibmPlexMono } from "@/lib/fonts";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "GroundUp AI",
    template: "%s | GroundUp AI",
  },
  description:
    "Source-led financial control layer for real estate developers, owners, and capital partners.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
    >
      <body className="font-sans antialiased bg-app text-text-primary selection:bg-primary-subtle selection:text-primary">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
