import type { UserProfile, UserRole } from "@/lib/types";
import { mockStore } from "@/lib/mock-data/store";

export interface AuthSession {
  user: UserProfile;
  expiresAt: string;
}

export interface AuthAdapter {
  signIn(email: string, password: string, rememberMe?: boolean): Promise<AuthSession>;
  signUp(input: {
    organization_name: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  getInvitation(token: string): Promise<InvitationDetails>;
  acceptInvitation(
    token: string,
    input: { first_name: string; last_name: string; password: string }
  ): Promise<AuthSession>;
  getMe(): Promise<UserProfile>;
}

export interface InvitationDetails {
  id: string;
  organization_id: string;
  organization_name: string;
  project_id: string | null;
  project_name: string | null;
  email: string;
  role: UserRole;
  scope: string;
  expires_at: string;
  status: "PENDING" | "EXPIRED" | "REVOKED" | "ACCEPTED";
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const roleTitles: Record<UserRole, string> = {
  OWNER: "Owner",
  CFO: "Finance lead",
  PM: "Project manager",
  GC: "General contractor",
  INVESTOR: "Investor",
};

export function normalizeUserProfile(user: any): UserProfile {
  const name = user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "User";
  return {
    id: user.id,
    organization_id: user.organization_id || "org-vance-dev",
    name,
    email: user.email,
    role: user.role,
    title: user.title || roleTitles[user.role as UserRole] || "Principal",
    company: user.company || "",
    avatarInitials:
      user.avatarInitials ||
      `${user.first_name?.[0] || user.name?.[0] || "U"}${user.last_name?.[0] || ""}`.toUpperCase(),
    is_active: user.is_active ?? true,
    project_memberships: user.project_memberships || [],
    permissions: user.permissions || ["all"],
  };
}

const SESSION_DURATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const ACTIVE_SESSION_STORAGE_KEY = "groundup_active_auth_email";

export class MockAuthAdapter implements AuthAdapter {
  async signIn(email: string, _password: string, _rememberMe = true): Promise<AuthSession> {
    const trimmed = email.trim();
    let user = mockStore.getUserByEmail(trimmed);

    if (!user) {
      // Determine persona role based on email or domain
      const role: UserRole = trimmed.includes("cfo") || trimmed.includes("s.lin")
        ? "CFO"
        : trimmed.includes("pm") || trimmed.includes("d.ross")
        ? "PM"
        : trimmed.includes("gc") || trimmed.includes("frank") || trimmed.includes("apex")
        ? "GC"
        : trimmed.includes("investor") || trimmed.includes("rostova")
        ? "INVESTOR"
        : "OWNER";

      const nameParts = trimmed.split("@")[0].split(/[._-]/);
      const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || "User";
      const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || "";

      user = mockStore.createUser({
        email: trimmed,
        name: `${firstName} ${lastName}`.trim(),
        role,
      });
    }

    mockStore.setCurrentUser(user.id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, user.email);
      window.localStorage.setItem("groundup_session_seen", "1");
    }

    return {
      user: normalizeUserProfile(user),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  async signUp(input: {
    organization_name: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthSession> {
    const user = mockStore.createUser({
      name: `${input.first_name} ${input.last_name}`.trim(),
      email: input.email.trim(),
      role: "OWNER",
      company: input.organization_name,
    });

    mockStore.setCurrentUser(user.id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, user.email);
      window.localStorage.setItem("groundup_session_seen", "1");
    }

    return {
      user: normalizeUserProfile(user),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  async signOut(): Promise<void> {
    mockStore.setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      window.localStorage.removeItem("groundup_session_seen");
    }
  }

  async getSession(): Promise<AuthSession | null> {
    if (typeof window === "undefined") {
      return null;
    }

    const activeEmail = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!activeEmail) {
      return null;
    }

    let user = mockStore.getUserByEmail(activeEmail);
    if (!user) {
      user = mockStore.getCurrentUser();
    } else {
      mockStore.setCurrentUser(user.id);
    }

    return {
      user: normalizeUserProfile(user),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  async requestPasswordReset(_email: string): Promise<void> {
    // Mock successful reset email dispatch
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    // Mock successful password update
  }

  async getInvitation(token: string): Promise<InvitationDetails> {
    const inv = mockStore.getInvitationByToken(token);
    if (!inv) {
      throw new AuthApiError("This invitation link is invalid or no longer available.", 404, "INVITATION_NOT_FOUND");
    }
    return {
      id: inv.id,
      organization_id: inv.organization_id,
      organization_name: inv.organization_name || "Vance Development LLC",
      project_id: inv.project_id || null,
      project_name: inv.project_name || "73 Broadway",
      email: inv.email,
      role: inv.role,
      scope: inv.scope,
      expires_at: inv.expires_at,
      status: (inv.status as any) || "PENDING",
    };
  }

  async acceptInvitation(
    token: string,
    input: { first_name: string; last_name: string; password: string }
  ): Promise<AuthSession> {
    const inv = mockStore.getInvitationByToken(token);
    if (!inv) {
      throw new AuthApiError("This invitation link is invalid or no longer available.", 404, "INVITATION_NOT_FOUND");
    }
    const user = mockStore.createUser({
      name: `${input.first_name} ${input.last_name}`.trim(),
      email: inv.email,
      role: inv.role,
    });
    mockStore.setCurrentUser(user.id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, user.email);
      window.localStorage.setItem("groundup_session_seen", "1");
    }
    return {
      user: normalizeUserProfile(user),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  async getMe(): Promise<UserProfile> {
    return normalizeUserProfile(mockStore.getCurrentUser());
  }
}

export const authAdapter: AuthAdapter = new MockAuthAdapter();
export const LiveAuthAdapter = MockAuthAdapter;
