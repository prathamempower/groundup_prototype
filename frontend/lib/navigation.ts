import { UserRole } from "./types";
import {
  LayoutDashboard,
  FileText,
  PieChart,
  Scale,
  Landmark,
  CalendarDays,
  TrendingUp,
  Inbox,
  Eye,
  Settings,
  AlertTriangle,
  Bell,
  Users,
  MessageSquare,
  Send,
  CheckSquare,
  LucideIcon,
} from "lucide-react";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
  badgeKey?: "documents" | "draws" | "reconciliation" | "timeline" | "alerts" | "changes";
}

export interface WorkspaceNavItem {
  id: string;
  label: string;
  path: string; // e.g. "control-center"
  icon: LucideIcon;
  allowedRoles: UserRole[];
  badgeKey?: "documents" | "draws" | "reconciliation" | "timeline" | "alerts" | "changes";
}

/**
 * Project Workspace Navigation Matrix (11 items)
 * Strict order and role matrix matching design_system.md:
 * 1. Control center (Owner, CFO, PM - PM gets schedule-focused view)
 * 2. Documents (Owner, CFO, PM)
 * 3. Budget (Owner, CFO, PM)
 * 4. Reconciliation (Owner, CFO)
 * 5. Draws (Owner, CFO, PM)
 * 6. Timeline (Owner, CFO, PM)
 * 7. Economics (Owner, CFO)
 * 8. Alerts & exceptions (Owner, CFO, PM)
 * 9. Investor updates (Owner only)
 * 10. Project settings (Owner only)
 */
export const PROJECT_WORKSPACE_NAV: WorkspaceNavItem[] = [
  {
    id: "control-center",
    label: "Control Center",
    path: "control-center",
    icon: LayoutDashboard,
    allowedRoles: ["OWNER"],
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    path: "reconciliation",
    icon: Scale,
    allowedRoles: ["OWNER"],
    badgeKey: "reconciliation",
  },
  {
    id: "draws",
    label: "Draws",
    path: "draws",
    icon: Landmark,
    allowedRoles: ["OWNER"],
    badgeKey: "draws",
  },
  {
    id: "documents",
    label: "Documents",
    path: "documents",
    icon: FileText,
    allowedRoles: ["OWNER"],
    badgeKey: "documents",
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "alerts",
    icon: Bell,
    allowedRoles: ["OWNER"],
    badgeKey: "alerts",
  },
  {
    id: "settings",
    label: "Project Settings",
    path: "settings",
    icon: Settings,
    allowedRoles: [],
  },
];

export function getProjectNavItems(projectId: string, role: UserRole): NavItemConfig[] {
  return PROJECT_WORKSPACE_NAV
    .filter((item) => item.allowedRoles.includes(role))
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: `/projects/${projectId}/${item.path}`,
      icon: item.icon,
      allowedRoles: item.allowedRoles,
      badgeKey: item.badgeKey,
    }));
}

export const WORKSPACE_ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "control-center": ["OWNER"],
  "documents": ["OWNER"],
  "budget": ["OWNER"],
  "economics": ["OWNER"],
  "changes": ["OWNER"],
  "reconciliation": ["OWNER"],
  "draws": ["OWNER"],
  "timeline": ["OWNER"],
  "alerts": ["OWNER"],
  "partners": ["OWNER"],
  "inbox": ["OWNER"],
  "directs": ["OWNER"],
  "build-packet": ["OWNER"],
  "settings": ["OWNER"],
};

export function getDefaultWorkspaceRoute(role: UserRole, projectId: string): string {
  return `/projects/${projectId}/control-center`;
}

// Keep NAV_ITEMS for backward compatibility where static lists are queried
export const NAV_ITEMS = PROJECT_WORKSPACE_NAV.map(item => ({
  id: item.id,
  label: item.label,
  href: `/${item.path}`,
  icon: item.icon,
  allowedRoles: item.allowedRoles,
  badgeKey: item.badgeKey,
}));

export const ROUTE_ACCESS_MAP: Record<string, UserRole[]> = {
  "/projects": ["OWNER"],
  "/projects/new": ["OWNER"],
  "/account": ["OWNER"],
  "/settings": ["OWNER"],
  "/onboarding": ["OWNER"],
};

export function getDefaultRouteForRole(role: UserRole): string {
  return "/projects";
}

/**
 * Resolves the strict active project ID for workspace views.
 * Prioritizes the route path param `/projects/[projectId]/...` so workspace views
 * NEVER leak or bleed data from other projects.
 */
export function useActiveProjectId(fallbackProjectId?: string): string {
  if (typeof window === "undefined") return fallbackProjectId || "";
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/projects\/([^\/]+)/);
  if (match && match[1] && match[1] !== "new") {
    return match[1];
  }
  return fallbackProjectId || "";
}
