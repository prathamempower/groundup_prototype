import { describe, it, expect } from "vitest";
import {
  PROJECT_WORKSPACE_NAV,
  getProjectNavItems,
  getDefaultWorkspaceRoute,
  getDefaultRouteForRole,
  ROUTE_ACCESS_MAP,
} from "@/lib/navigation";
import { UserRole } from "@/lib/types";

describe("Role Permissions & Navigation Matrix", () => {
  it("provides /projects portfolio home route for all authenticated account roles", () => {
    const roles: UserRole[] = ["OWNER", "CFO", "PM", "GC", "INVESTOR"];
    roles.forEach((role) => {
      expect(getDefaultRouteForRole(role)).toBe("/projects");
    });
  });

  it("provides correct workspace landing routes inside a project", () => {
    const testProjectId = "proj_test_123";
    expect(getDefaultWorkspaceRoute("OWNER", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
    expect(getDefaultWorkspaceRoute("CFO", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
    expect(getDefaultWorkspaceRoute("PM", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
    expect(getDefaultWorkspaceRoute("GC", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
    expect(getDefaultWorkspaceRoute("INVESTOR", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
  });

  it("strictly enforces GC project workspace boundaries (GC blocked from financials and hidden pages)", () => {
    const testProjectId = "proj_test_123";
    const gcNav = getProjectNavItems(testProjectId, "GC").map((item) => item.href);

    expect(gcNav).not.toContain(`/projects/${testProjectId}/draws`);
    expect(gcNav).not.toContain(`/projects/${testProjectId}/reconciliation`);
    expect(gcNav).not.toContain(`/projects/${testProjectId}/settings`);
    expect(gcNav).not.toContain(`/projects/${testProjectId}/control-center`);
  });

  it("strictly enforces INVESTOR project workspace boundaries (Investor only sees control center)", () => {
    const testProjectId = "proj_test_123";
    const investorNav = getProjectNavItems(testProjectId, "INVESTOR").map((item) => item.href);

    expect(investorNav).toContain(`/projects/${testProjectId}/control-center`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/documents`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/budget`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/reconciliation`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/draws`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/timeline`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/submissions`);
    expect(investorNav).not.toContain(`/projects/${testProjectId}/settings`);
  });

  it("grants OWNER access to the 5 kept project workspace pages", () => {
    const testProjectId = "proj_test_123";
    const ownerNav = getProjectNavItems(testProjectId, "OWNER").map((item) => item.href);

    // Kept pages:
    expect(ownerNav).toContain(`/projects/${testProjectId}/control-center`);
    expect(ownerNav).toContain(`/projects/${testProjectId}/reconciliation`);
    expect(ownerNav).toContain(`/projects/${testProjectId}/draws`);
    expect(ownerNav).toContain(`/projects/${testProjectId}/documents`);
    expect(ownerNav).toContain(`/projects/${testProjectId}/alerts`);

    // Hidden pages:
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/settings`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/budget`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/changes`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/partners`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/timeline`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/inbox`);
  });

  it("strictly scopes PM role (no reconciliation or project settings)", () => {
    const testProjectId = "proj_test_123";
    const pmNav = getProjectNavItems(testProjectId, "PM").map((item) => item.href);

    expect(pmNav).toContain(`/projects/${testProjectId}/control-center`);
    expect(pmNav).toContain(`/projects/${testProjectId}/draws`);
    expect(pmNav).toContain(`/projects/${testProjectId}/documents`);
    expect(pmNav).toContain(`/projects/${testProjectId}/alerts`);
    expect(pmNav).not.toContain(`/projects/${testProjectId}/reconciliation`);
    expect(pmNav).not.toContain(`/projects/${testProjectId}/settings`);
  });

  it("strictly scopes CFO role (no project settings)", () => {
    const testProjectId = "proj_test_123";
    const cfoNav = getProjectNavItems(testProjectId, "CFO").map((item) => item.href);

    expect(cfoNav).toContain(`/projects/${testProjectId}/control-center`);
    expect(cfoNav).toContain(`/projects/${testProjectId}/reconciliation`);
    expect(cfoNav).toContain(`/projects/${testProjectId}/draws`);
    expect(cfoNav).toContain(`/projects/${testProjectId}/documents`);
    expect(cfoNav).toContain(`/projects/${testProjectId}/alerts`);
    expect(cfoNav).not.toContain(`/projects/${testProjectId}/settings`);
  });
});
