import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";

// Modern, high-clarity enterprise typography: Plus Jakarta Sans
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

// Wall Street & enterprise financial standard for numbers, ledgers, and tabular data
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "monospace",
  ],
});

// Primary application typography and backward-compatibility aliases
export const fontSans = plusJakartaSans;
export const inter = plusJakartaSans;
export const ibmPlexSans = plusJakartaSans;
export const fontMono = ibmPlexMono;
export const jetbrainsMono = ibmPlexMono;
