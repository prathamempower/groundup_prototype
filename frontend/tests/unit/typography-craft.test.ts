import { describe, it, expect } from "vitest";
import { plusJakartaSans, fontSans, inter, ibmPlexSans, fontMono } from "@/lib/fonts";
import fs from "fs";
import path from "path";

describe("Typography Craft & Plus Jakarta Sans Integration", () => {
  it("exports plusJakartaSans as the primary application font with correct variable", () => {
    expect(plusJakartaSans).toBeDefined();
    expect(fontSans).toBe(plusJakartaSans);
    expect(inter).toBe(plusJakartaSans);
    expect(ibmPlexSans).toBe(plusJakartaSans);
    expect(fontMono).toBeDefined();

    // Check variable name
    expect(plusJakartaSans.variable).toBe("--font-plus-jakarta-sans");
  });

  it("configures Plus Jakarta Sans in tailwind.config.ts sans family", () => {
    const tailwindConfigPath = path.resolve(__dirname, "../../tailwind.config.ts");
    const content = fs.readFileSync(tailwindConfigPath, "utf-8");

    expect(content).toContain("var(--font-plus-jakarta-sans)");
  });

  it("configures Plus Jakarta Sans and typography hierarchy in globals.css", () => {
    const globalsCssPath = path.resolve(__dirname, "../../app/globals.css");
    const content = fs.readFileSync(globalsCssPath, "utf-8");

    expect(content).toContain("var(--font-plus-jakarta-sans)");
    expect(content).toContain("--font-inter: var(--font-plus-jakarta-sans)");
    expect(content).toContain("tabular-nums");
    expect(content).toContain('font-feature-settings: "tnum" 1, "lnum" 1, "cv02", "cv03", "cv04", "cv11"');
    expect(content).toContain('font-feature-settings: "cv02", "cv03", "cv04", "cv11"');
    expect(content).toContain("letter-spacing: 0.05em");
  });

  it("ensures SVG logos include Plus Jakarta Sans", () => {
    const wordmarkPath = path.resolve(__dirname, "../../public/logo-wordmark.svg");
    const logoPath = path.resolve(__dirname, "../../public/logo.svg");

    expect(fs.readFileSync(wordmarkPath, "utf-8")).toContain("Plus Jakarta Sans");
    expect(fs.readFileSync(logoPath, "utf-8")).toContain("Plus Jakarta Sans");
  });
});
