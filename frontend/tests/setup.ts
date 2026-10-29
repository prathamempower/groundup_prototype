import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({
    style: { fontFamily: "var(--font-plus-jakarta-sans)" },
    className: "font-plus-jakarta-sans",
    variable: "--font-plus-jakarta-sans",
  }),
  Inter: () => ({
    style: { fontFamily: "var(--font-inter)" },
    className: "font-inter",
    variable: "--font-inter",
  }),
  IBM_Plex_Mono: () => ({
    style: { fontFamily: "var(--font-mono)" },
    className: "font-mono",
    variable: "--font-mono",
  }),
}));

afterEach(() => {
  cleanup();
});

