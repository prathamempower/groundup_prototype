import { Inter, JetBrains_Mono } from "next/font/google";

// Modern, high-clarity enterprise typography
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Backward-compatibility aliases
export const fontSans = inter;
export const fontMono = jetbrainsMono;
export const ibmPlexSans = inter;
export const ibmPlexMono = jetbrainsMono;
