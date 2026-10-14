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
  // 1. Executive & Overview
  {
    id: "control-center",
    label: "Control Center",
    path: "control-center",
    icon: LayoutDashboard,
    allowedRoles: ["OWNER", "CFO", "PM", "INVESTOR"],
  },
  {
    id: "documents",
    label: "Documents",
    path: "documents",
    icon: FileText,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "documents",
  },
  {
    id: "budget",
    label: "Project Economics",
    path: "budget",
    icon: PieChart,
    allowedRoles: ["OWNER", "CFO", "PM"],
  },
  {
    id: "changes",
    label: "Changes & Approvals",
    path: "changes",
    icon: CheckSquare,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "changes",
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "alerts",
    icon: Bell,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "alerts",
  },

  // 2. Financial Management
  {
    id: "draws",
    label: "Draws",
    path: "draws",
    icon: Landmark,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "draws",
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    path: "reconciliation",
    icon: Scale,
    allowedRoles: ["OWNER", "CFO"],
    badgeKey: "reconciliation",
  },
  {
    id: "partners",
    label: "Partners & Funding",
    path: "partners",
    icon: Users,
    allowedRoles: ["OWNER", "CFO"],
  },

  // 3. Project Execution
  {
    id: "timeline",
    label: "Timeline",
    path: "timeline",
    icon: CalendarDays,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "timeline",
  },
  {
    id: "inbox",
    label: "Inbox",
    path: "inbox",
    icon: MessageSquare,
    allowedRoles: ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
  },

  // 4. Project Settings
  {
    id: "settings",
    label: "Project Settings",
    path: "settings",
    icon: Settings,
    allowedRoles: ["OWNER"],
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
  "control-center": ["OWNER", "CFO", "PM", "INVESTOR"],
  "documents": ["OWNER", "CFO", "PM"],
  "budget": ["OWNER", "CFO", "PM"],
  "economics": ["OWNER", "CFO", "PM"],
  "changes": ["OWNER", "CFO", "PM"],
  "reconciliation": ["OWNER", "CFO"],
  "draws": ["OWNER", "CFO", "PM"],
  "timeline": ["OWNER", "CFO", "PM"],
  "alerts": ["OWNER", "CFO", "PM"],
  "partners": ["OWNER", "CFO", "INVESTOR"],
  "inbox": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
  "directs": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
  "build-packet": ["OWNER", "CFO", "PM"],
  // "investor-updates": ["OWNER", "INVESTOR"],
  "settings": ["OWNER"],
};

export function getDefaultWorkspaceRoute(role: UserRole, projectId: string): string {
  switch (role) {
    case "OWNER":
    case "CFO":
      return `/projects/${projectId}/control-center`;
    case "PM":
      return `/projects/${projectId}/timeline`;
    case "GC":
      return `/projects/${projectId}/inbox`;
    case "INVESTOR":
      return `/projects/${projectId}/control-center`;
    default:
      return `/projects/${projectId}/control-center`;
  }
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
  "/projects": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
  "/projects/new": ["OWNER"],
  "/account": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
  "/settings": ["OWNER"],
  "/onboarding": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
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
