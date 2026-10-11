import type { Metadata } from "next";
import "./globals.css";
import { ibmPlexSans, ibmPlexMono } from "@/lib/fonts";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "GroundUp AI — Development Financial Control",
  description:
    "Source-led financial control layer for real estate developers, owners, and capital partners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-app text-text-primary selection:bg-primary-subtle selection:text-primary">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
