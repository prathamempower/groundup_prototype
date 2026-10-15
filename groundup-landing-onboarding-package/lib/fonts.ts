import { Inter, IBM_Plex_Mono } from "next/font/google";

// Modern, high-clarity enterprise typography
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Wall Street & enterprise financial standard for numbers, ledgers, and tabular data
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

// Backward-compatibility and semantic aliases
export const fontSans = inter;
export const fontMono = ibmPlexMono;
export const jetbrainsMono = ibmPlexMono;
export const ibmPlexSans = inter;
