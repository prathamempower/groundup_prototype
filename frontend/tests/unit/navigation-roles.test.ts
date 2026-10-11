import { describe, it, expect } from "vitest";
import { NAV_ITEMS, getDefaultRouteForRole } from "@/lib/navigation";
import { UserRole } from "@/lib/types";

describe("Role Permissions & Navigation Matrix", () => {
  it("provides correct default home routes for each account role", () => {
    expect(getDefaultRouteForRole("OWNER")).toBe("/control-center");
    expect(getDefaultRouteForRole("CFO")).toBe("/control-center");
    expect(getDefaultRouteForRole("PM")).toBe("/control-center");
    expect(getDefaultRouteForRole("GC")).toBe("/submissions");
    expect(getDefaultRouteForRole("INVESTOR")).toBe("/investor-update");
  });

  it("strictly enforces GC role boundaries (GC cannot see budget, draws, or settings)", () => {
    const gcAllowedHrefs = NAV_ITEMS.filter((item) =>
      item.allowedRoles.includes("GC")
    ).map((item) => item.href);

    expect(gcAllowedHrefs).toContain("/submissions");
    expect(gcAllowedHrefs).not.toContain("/budget");
    expect(gcAllowedHrefs).not.toContain("/draws");
    expect(gcAllowedHrefs).not.toContain("/reconciliation");
    expect(gcAllowedHrefs).not.toContain("/settings");
  });

  it("strictly enforces INVESTOR role boundaries (Investor only sees project updates)", () => {
    const investorAllowedHrefs = NAV_ITEMS.filter((item) =>
      item.allowedRoles.includes("INVESTOR")
    ).map((item) => item.href);

    expect(investorAllowedHrefs).toContain("/investor-update");
    expect(investorAllowedHrefs).not.toContain("/documents");
    expect(investorAllowedHrefs).not.toContain("/budget");
    expect(investorAllowedHrefs).not.toContain("/reconciliation");
    expect(investorAllowedHrefs).not.toContain("/settings");
  });

  it("grants OWNER access to master settings and control center", () => {
    const ownerAllowedHrefs = NAV_ITEMS.filter((item) =>
      item.allowedRoles.includes("OWNER")
    ).map((item) => item.href);

    expect(ownerAllowedHrefs).toContain("/control-center");
    expect(ownerAllowedHrefs).toContain("/settings");
    expect(ownerAllowedHrefs).toContain("/budget");
    expect(ownerAllowedHrefs).toContain("/draws");
  });
});
