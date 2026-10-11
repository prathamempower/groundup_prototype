import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatAsOf,
  truncateText,
} from "@/lib/format";

describe("Format Utility Functions", () => {
  describe("formatMoney", () => {
    it("formats cent values into standard currency strings", () => {
      expect(formatMoney(100000)).toBe("$1,000.00");
      expect(formatMoney(420000000)).toBe("$4,200,000.00");
      expect(formatMoney(0)).toBe("$0.00");
    });

    it("handles compact formatting when requested", () => {
      expect(formatMoney(420000000, { compact: true })).toBe("$4.2M");
      expect(formatMoney(15000000, { compact: true })).toBe("$150K");
    });

    it("handles negative amounts correctly", () => {
      expect(formatMoney(-500000)).toBe("-$5,000.00");
    });
  });

  describe("formatPercent", () => {
    it("formats decimals and whole numbers into percent strings", () => {
      expect(formatPercent(18.4)).toBe("18.4%");
      expect(formatPercent(100)).toBe("100.0%");
      expect(formatPercent(0)).toBe("0.0%");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date strings into readable dates", () => {
      const formatted = formatDate("2026-03-15T00:00:00Z");
      expect(formatted).toContain("Mar");
      expect(formatted).toContain("2026");
    });
  });

  describe("truncateText", () => {
    it("truncates long strings with ellipsis", () => {
      const text = "This is a very long note that exceeds maximum character length limit";
      expect(truncateText(text, 20)).toBe("This is a very lo...");
      expect(truncateText("Short", 20)).toBe("Short");
    });
  });
});
