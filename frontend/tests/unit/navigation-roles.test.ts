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
  it("provides /projects portfolio home route for OWNER authenticated accounts", () => {
    const roles: UserRole[] = ["OWNER"];
    roles.forEach((role) => {
      expect(getDefaultRouteForRole(role)).toBe("/projects");
    });
  });

  it("provides correct workspace landing routes inside a project", () => {
    const testProjectId = "proj_test_123";
    expect(getDefaultWorkspaceRoute("OWNER", testProjectId)).toBe(`/projects/${testProjectId}/control-center`);
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

    // Hidden / sub-pages:
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/settings`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/budget`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/changes`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/partners`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/timeline`);
    expect(ownerNav).not.toContain(`/projects/${testProjectId}/inbox`);
  });

  it("verifies global route access permissions for OWNER", () => {
    expect(ROUTE_ACCESS_MAP["/projects"]).toContain("OWNER");
    expect(ROUTE_ACCESS_MAP["/projects/new"]).toContain("OWNER");
    expect(ROUTE_ACCESS_MAP["/account"]).toContain("OWNER");
    expect(ROUTE_ACCESS_MAP["/settings"]).toContain("OWNER");
    expect(ROUTE_ACCESS_MAP["/onboarding"]).toContain("OWNER");
  });
});
