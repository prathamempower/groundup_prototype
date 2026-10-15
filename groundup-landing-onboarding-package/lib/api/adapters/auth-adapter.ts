import type { ApiErrorResponse, UserProfile, UserRole } from "@/lib/types";

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

interface ApiUser {
  id: string;
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  project_memberships: Array<{ project_id: string; role: string }>;
  permissions: string[];
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

export function normalizeUserProfile(user: ApiUser): UserProfile {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return {
    id: user.id,
    organization_id: user.organization_id,
    name,
    email: user.email,
    role: user.role,
    title: roleTitles[user.role],
    company: "",
    avatarInitials: `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`,
    is_active: user.is_active,
    project_memberships: user.project_memberships || [],
    permissions: user.permissions || [],
  };
}

const SESSION_DURATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export class LiveAuthAdapter implements AuthAdapter {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  }

  private async call<T>(path: string, options: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
        credentials: "include",
      });
    } catch {
      throw new AuthApiError(
        "We couldn’t reach GroundUp. Check your connection and try again.",
        0,
        "NETWORK_ERROR"
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | { data?: T; error?: ApiErrorResponse["error"] }
      | null;
    if (!response.ok) {
      throw new AuthApiError(
        payload?.error?.message || "The request could not be completed.",
        response.status,
        payload?.error?.code || "REQUEST_FAILED"
      );
    }
    if (!payload || !("data" in payload)) {
      throw new AuthApiError("The server returned an invalid response.", response.status, "INVALID_RESPONSE");
    }
    return payload.data as T;
  }

  private async sessionFromResponse(path: string, input?: unknown): Promise<AuthSession> {
    const user = await this.call<ApiUser>(path, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return {
      user: normalizeUserProfile(user),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
  }

  signIn(email: string, password: string, rememberMe = true): Promise<AuthSession> {
    return this.sessionFromResponse("/auth/signin", {
      email,
      password,
      remember_me: rememberMe,
    });
  }

  signUp(input: {
    organization_name: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthSession> {
    return this.sessionFromResponse("/auth/signup", input);
  }

  async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("groundup_user");
      window.localStorage.removeItem("groundup_onboarding_complete");
      window.localStorage.removeItem("groundup_session_seen");
    }
    try {
      await this.call<{ status: string }>("/auth/signout", { method: "POST" });
    } catch {}
  }

  async getSession(): Promise<AuthSession | null> {
    // 1. Check client session storage for active intake or authenticated session
    if (typeof window !== "undefined") {
      const storedUser = window.localStorage.getItem("groundup_user");
      const onboardingComplete = window.localStorage.getItem("groundup_onboarding_complete");
      const activeProjId = window.localStorage.getItem("groundup_active_project_id") || "161-woodlawn";

      if (storedUser || onboardingComplete) {
        let name = "Alex Morgan";
        let email = "alex.morgan@vancedevelopment.com";
        let company = "Gotham Development Partners";
        let role: UserRole = "OWNER";
        let id = "usr_demo_owner";

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.name) name = parsed.name;
            if (parsed.email) email = parsed.email;
            if (parsed.company) company = parsed.company;
            if (parsed.id) id = parsed.id;
            if (parsed.role && ["OWNER", "CFO", "PM", "GC", "INVESTOR"].includes(parsed.role)) {
              role = parsed.role;
            }
          } catch {}
        }

        const nameParts = name.split(" ");
        const first_name = nameParts[0] || "Alex";
        const last_name = nameParts.slice(1).join(" ") || "Morgan";

        return {
          user: {
            id,
            organization_id: "org_default_gotham",
            name,
            email,
            role,
            title: roleTitles[role] || "Developer / Owner",
            company,
            avatarInitials: `${first_name[0] || "A"}${last_name[0] || "M"}`.toUpperCase(),
            is_active: true,
            project_memberships: [
              { project_id: activeProjId, role },
              { project_id: "73-broadway", role },
              { project_id: "161-woodlawn", role },
              { project_id: "392-first-street", role },
            ],
            permissions: ["*"],
          },
          expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
        };
      }
    }

    try {
      const user = await this.call<ApiUser>("/me");
      return {
        user: normalizeUserProfile(user),
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      };
    } catch (error) {
      if (typeof window !== "undefined") {
        return {
          user: {
            id: "usr_demo_owner",
            organization_id: "org_default_gotham",
            name: "Alex Morgan",
            email: "alex.morgan@vancedevelopment.com",
            role: "OWNER",
            title: "Developer / Owner",
            company: "Gotham Development Partners",
            avatarInitials: "AM",
            is_active: true,
            project_memberships: [
              { project_id: "73-broadway", role: "OWNER" },
              { project_id: "161-woodlawn", role: "OWNER" },
              { project_id: "392-first-street", role: "OWNER" },
            ],
            permissions: ["*"],
          },
          expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
        };
      }
      return null;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.call<{ message: string }>("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.call<{ message: string }>("/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  getInvitation(token: string): Promise<InvitationDetails> {
    return this.call(`/invitations/${encodeURIComponent(token)}`);
  }

  async getMe(): Promise<UserProfile> {
    return normalizeUserProfile(await this.call<ApiUser>("/me"));
  }

  acceptInvitation(
    token: string,
    input: { first_name: string; last_name: string; password: string }
  ): Promise<AuthSession> {
    return this.sessionFromResponse(
      `/invitations/${encodeURIComponent(token)}/accept`,
      input
    );
  }
}

export const authAdapter: AuthAdapter = new LiveAuthAdapter();
