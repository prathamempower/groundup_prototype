import { Roboto_Mono, Plus_Jakarta_Sans } from "next/font/google";

// Primary Google Products typography (clean, modern, highly legible)
export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

// Backward-compatibility aliases so existing imports work seamlessly
export const ibmPlexSans = fontSans;
export const ibmPlexMono = fontMono;

