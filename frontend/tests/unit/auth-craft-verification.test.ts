import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { analyzePasswordStrength } from "../../lib/auth-password-validator";

describe("Auth System & UI Craft Verification", () => {
  describe("1. Password Security Standard Protocol (Minimum 12 Characters)", () => {
    it("rejects passwords shorter than 12 characters even with high complexity", () => {
      // 8 characters, complex mix
      const result = analyzePasswordStrength("Alex9#zZ");
      expect(result.hasMinLength).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.label).toContain("Weak");
    });

    it("rejects 11-character password on boundary check", () => {
      // 11 characters exactly: 'Alex' (4) + 'Vanc' (4) + '12!' (3) = 11
      const result = analyzePasswordStrength("AlexVanc12!");
      expect(result.hasMinLength).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.label).toContain("Weak");
    });

    it("accepts valid 12+ character password meeting all criteria", () => {
      const result = analyzePasswordStrength("GroundUp2026!Secure");
      expect(result.hasMinLength).toBe(true);
      expect(result.hasCaseMix).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSymbol).toBe(true);
      expect(result.hasNumberAndSymbol).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(4);
      expect(result.label).toBe("Strong password");
    });

    it("requires mixed case (upper and lower)", () => {
      const lowercaseOnly = analyzePasswordStrength("alllowercase123!long");
      expect(lowercaseOnly.hasCaseMix).toBe(false);
      expect(lowercaseOnly.isValid).toBe(false);
      expect(lowercaseOnly.label).toContain("Fair");

      const uppercaseOnly = analyzePasswordStrength("ALLUPPERCASE123!LONG");
      expect(uppercaseOnly.hasCaseMix).toBe(false);
      expect(uppercaseOnly.isValid).toBe(false);
      expect(uppercaseOnly.label).toContain("Fair");
    });

    it("requires BOTH number AND symbol (either missing fails validation)", () => {
      // Missing symbol (has letters and numbers)
      const missingSymbol = analyzePasswordStrength("LettersAndNumbers12345");
      expect(missingSymbol.hasNumber).toBe(true);
      expect(missingSymbol.hasSymbol).toBe(false);
      expect(missingSymbol.hasNumberAndSymbol).toBe(false);
      expect(missingSymbol.isValid).toBe(false);
      expect(missingSymbol.label).toContain("symbol");

      // Missing number (has letters and symbols)
      const missingNumber = analyzePasswordStrength("LettersAndSymbols!@#$%");
      expect(missingNumber.hasNumber).toBe(false);
      expect(missingNumber.hasSymbol).toBe(true);
      expect(missingNumber.hasNumberAndSymbol).toBe(false);
      expect(missingNumber.isValid).toBe(false);
      expect(missingNumber.label).toContain("number");
    });
  });

  describe("2. Auth Component Source Integrity & SVG Sizing", () => {
    const authCardPath = path.resolve(__dirname, "../../components/auth/AuthSwitchCard.tsx");
    const authLayoutPath = path.resolve(__dirname, "../../app/auth/layout.tsx");

    it("ensures Google and Apple SVGs have strict explicit width and height attributes", () => {
      const content = fs.readFileSync(authCardPath, "utf-8");
      // Google must have width="18" and height="18"
      const widthMatches = content.match(/width="18"/g);
      const heightMatches = content.match(/height="18"/g);
      expect(widthMatches?.length).toBeGreaterThanOrEqual(2);
      expect(heightMatches?.length).toBeGreaterThanOrEqual(2);

      // Apple SVG must have width="17" and height="17"
      const appleWidthMatches = content.match(/width="17"/g);
      const appleHeightMatches = content.match(/height="17"/g);
      expect(appleWidthMatches?.length).toBeGreaterThanOrEqual(2);
      expect(appleHeightMatches?.length).toBeGreaterThanOrEqual(2);

      // Must NOT contain uncompiled or invalid size-4.5
      expect(content).not.toContain("size-4.5");
    });

    it("ensures 44px clickable touch targets on inputs and buttons", () => {
      const content = fs.readFileSync(authCardPath, "utf-8");
      // All primary inputs must have h-11 (44px)
      expect(content).toContain("h-11");
    });

    it("enforces sharp architectural corners (rounded-sm) rather than rounded pills", () => {
      const content = fs.readFileSync(authCardPath, "utf-8");
      // Primary action buttons must use crisp rounded-sm (2px)
      expect(content).toContain("rounded-sm");
      // Input fields must use rounded-sm
      expect(content).toContain("rounded-sm border border-slate-300");
    });

    it("guarantees zero em dashes across auth files", () => {
      const cardContent = fs.readFileSync(authCardPath, "utf-8");
      const layoutContent = fs.readFileSync(authLayoutPath, "utf-8");

      expect(cardContent).not.toMatch(/\u2014|&mdash;|--/);
      expect(layoutContent).not.toMatch(/\u2014|&mdash;|--/);
    });

    it("guarantees zero CEO or CTO executive acronyms", () => {
      const cardContent = fs.readFileSync(authCardPath, "utf-8");
      const layoutContent = fs.readFileSync(authLayoutPath, "utf-8");

      expect(cardContent).not.toMatch(/\bCEO\b|\bCTO\b/);
      expect(layoutContent).not.toMatch(/\bCEO\b|\bCTO\b/);
    });

    it("enforces containerless switch prompts and divider labels (zero artificial containers)", () => {
      const content = fs.readFileSync(authCardPath, "utf-8");
      // Prompts must NOT be wrapped in artificial pill boxes or background borders
      expect(content).not.toContain("bg-white/80 border border-slate-200/90");
      expect(content).not.toContain("backdrop-blur-xs text-sm text-slate-700");
      // Clean hairline dividers must not use fake opaque background cutout boxes
      expect(content).not.toContain("bg-[#FAF9F6] px-3");
    });

    it("enforces refined text gradient effects on auth headings", () => {
      const content = fs.readFileSync(authCardPath, "utf-8");
      // Headings must utilize the auth-title-gradient class
      expect(content).toContain("auth-title-gradient");
      const matches = content.match(/auth-title-gradient/g);
      expect(matches?.length).toBeGreaterThanOrEqual(2); // In both Login and SignUp
    });

    it("strictly prohibits shadow-xs across auth layout and inputs", () => {
      const cardContent = fs.readFileSync(authCardPath, "utf-8");
      const layoutContent = fs.readFileSync(authLayoutPath, "utf-8");

      expect(cardContent).not.toContain("shadow-xs");
      expect(layoutContent).not.toContain("shadow-xs");
    });

    it("verifies single-column fluid layout with min-h-dvh and Golden Ratio max-w-2xl container", () => {
      const layoutContent = fs.readFileSync(authLayoutPath, "utf-8");

      expect(layoutContent).toContain("min-h-dvh");
      expect(layoutContent).toContain("max-w-2xl");
      expect(layoutContent).not.toContain("h-screen max-h-screen");
    });

    it("enforces kinetic transition animation on auth card switching", () => {
      const cardContent = fs.readFileSync(authCardPath, "utf-8");
      expect(cardContent).toContain("animate-auth-transition");
      expect(cardContent).toContain('key="login"');
      expect(cardContent).toContain('key="signup"');
    });

    it("verifies top-bar uses semantic Building SVG icon and no fake emerald dot for company", () => {
      const topBarPath = path.resolve(__dirname, "../../components/layout/top-bar.tsx");
      const topBarContent = fs.readFileSync(topBarPath, "utf-8");

      expect(topBarContent).toContain("<Building");
      expect(topBarContent).not.toContain("rounded-full bg-emerald-500");
    });
  });
});
