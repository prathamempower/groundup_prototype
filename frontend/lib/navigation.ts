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
  LucideIcon,
} from "lucide-react";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
  badgeKey?: "documents" | "draws" | "reconciliation" | "timeline";
}

/**
 * Sidebar Navigation Items
 * Strict order and role matrix matching design_system.md Section 5:
 * 1. Control center (Owner, CFO, PM)
 * 2. Documents (Owner, CFO, PM)
 * 3. Budget (Owner, CFO, PM)
 * 4. Reconciliation (Owner, CFO)
 * 5. Draws (Owner, CFO, PM)
 * 6. Timeline (Owner, CFO, PM)
 * 7. Economics (Owner, CFO)
 * 8. My submissions (GC)
 * 9. Project update (Investor)
 * 10. Settings and team (Owner)
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "control-center",
    label: "Control center",
    href: "/control-center",
    icon: LayoutDashboard,
    allowedRoles: ["OWNER", "CFO", "PM"],
  },
  {
    id: "documents",
    label: "Documents",
    href: "/documents",
    icon: FileText,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "documents",
  },
  {
    id: "budget",
    label: "Budget",
    href: "/budget",
    icon: PieChart,
    allowedRoles: ["OWNER", "CFO", "PM"],
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    href: "/reconciliation",
    icon: Scale,
    allowedRoles: ["OWNER", "CFO"],
    badgeKey: "reconciliation",
  },
  {
    id: "draws",
    label: "Draws",
    href: "/draws",
    icon: Landmark,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "draws",
  },
  {
    id: "timeline",
    label: "Timeline",
    href: "/timeline",
    icon: CalendarDays,
    allowedRoles: ["OWNER", "CFO", "PM"],
    badgeKey: "timeline",
  },
  {
    id: "economics",
    label: "Economics",
    href: "/economics",
    icon: TrendingUp,
    allowedRoles: ["OWNER", "CFO"],
  },
  {
    id: "submissions",
    label: "My submissions",
    href: "/submissions",
    icon: Inbox,
    allowedRoles: ["GC"],
  },
  {
    id: "investor-update",
    label: "Project update",
    href: "/investor-update",
    icon: Eye,
    allowedRoles: ["INVESTOR"],
  },
  {
    id: "settings",
    label: "Settings and team",
    href: "/settings",
    icon: Settings,
    allowedRoles: ["OWNER"],
  },
];

/**
 * Route-level permission map for AppShell security guard.
 * Allows functional access for roles that can manage or publish features (e.g. Owner publishing investor updates),
 * while blocking forbidden routes.
 */
export const ROUTE_ACCESS_MAP: Record<string, UserRole[]> = {
  "/control-center": ["OWNER", "CFO", "PM"],
  "/documents": ["OWNER", "CFO", "PM"],
  "/budget": ["OWNER", "CFO", "PM"],
  "/reconciliation": ["OWNER", "CFO"],
  "/draws": ["OWNER", "CFO", "PM"],
  "/timeline": ["OWNER", "CFO", "PM"],
  "/economics": ["OWNER", "CFO"],
  "/readiness": ["OWNER", "CFO", "PM"],
  "/settings": ["OWNER"],
  "/submissions": ["GC", "OWNER", "PM", "CFO"],
  "/investor-update": ["INVESTOR", "OWNER", "CFO"],
  "/projects/new": ["OWNER"],
  "/onboarding": ["OWNER", "CFO", "PM", "GC", "INVESTOR"],
};

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "OWNER":
    case "CFO":
    case "PM":
      return "/control-center";
    case "GC":
      return "/submissions";
    case "INVESTOR":
      return "/investor-update";
    default:
      return "/control-center";
  }
}
