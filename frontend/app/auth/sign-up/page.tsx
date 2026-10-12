"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Building2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Users,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";

// Common personal & disposable email providers forbidden for business account creation
const DISALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "yahoo.co.uk",
  "yahoo.ca",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "mail.com",
  "zoho.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.net",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "tutanota.com",
  "fastmail.com",
  "inbox.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
]);

function isPersonalEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return Boolean(domain && DISALLOWED_EMAIL_DOMAINS.has(domain));
}

interface TeamInviteRow {
  id: string;
  email: string;
  role: UserRole;
}

const roleOptions: Array<{ role: UserRole; label: string }> = [
  { role: "CFO", label: "Finance Lead / CFO" },
  { role: "PM", label: "Project Manager" },
  { role: "GC", label: "General Contractor" },
  { role: "INVESTOR", label: "Equity Investor" },
];

export default function SignUpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [organization, setOrganization] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Interaction tracking for smooth real-time validation UI
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Step 2 fields (Team Invites)
  const [teamInvites, setTeamInvites] = useState<TeamInviteRow[]>([
    { id: "1", email: "", role: "CFO" },
  ]);

  const [errorMessage, setErrorMessage] = useState("");

  // Live Password Checklist Criteria
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      numberOrSymbol: /[\d\W]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.numberOrSymbol;

  // Live Email Validation State
  const emailValidation = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return { isValid: false, message: "" };

    const formatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!formatValid) {
      return { isValid: false, message: "Enter a valid email address format" };
    }

    if (isPersonalEmail(trimmed)) {
      const domain = trimmed.split("@")[1];
      return {
        isValid: false,
        message: `Personal domains like @${domain} are not permitted. Please use your official company or work email.`,
      };
    }

    return { isValid: true, message: "" };
  }, [email]);

  const addInviteRow = () => {
    setTeamInvites((prev) => [
      ...prev,
      { id: String(Date.now()), email: "", role: "PM" },
    ]);
  };

  const removeInviteRow = (id: string) => {
    setTeamInvites((prev) => prev.filter((r) => r.id !== id));
  };

  const updateInviteRow = (id: string, updates: Partial<TeamInviteRow>) => {
    setTeamInvites((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const signUp = useMutation({
    mutationFn: async () => {
      // 1. Create Owner account and Organization
      const authSession = await authAdapter.signUp({
        organization_name: organization.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
      });

      // 2. Dispatch team invitations if provided
      const validInvites = teamInvites.filter(
        (inv) => inv.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inv.email.trim())
      );

      if (validInvites.length > 0) {
        await Promise.allSettled(
          validInvites.map((inv) =>
            api.invitations.create({
              email: inv.email.trim(),
              role: inv.role,
              scope: "ORGANIZATION",
            })
          )
        );
      }

      return authSession;
    },
    onSuccess: (authSession) => {
      window.localStorage.setItem("groundup_session_seen", "1");
      window.sessionStorage.setItem("groundup_signup_completed", "1");
      queryClient.setQueryData(["auth-session"], authSession);
      queryClient.setQueryData(["me"], { data: authSession.user });
      router.replace("/projects");
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to create account.");
    },
  });

  const validateStep1 = () => {
    if (!organization.trim()) {
      setErrorMessage("Enter your organization name.");
      return false;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your first and last name.");
      return false;
    }
    if (!email.trim() || !emailValidation.isValid) {
      setErrorMessage(emailValidation.message || "Enter a valid company work email address.");
      return false;
    }
    if (!isPasswordValid) {
      setErrorMessage("Please fulfill all password security requirements.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setEmailTouched(true);
    setErrorMessage("");
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    signUp.mutate();
  };

  return (
    <div className="w-full space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm mb-1">
          {currentStep === 1 ? <Building2 className="h-6 w-6" /> : <Users className="h-6 w-6" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {currentStep === 1 ? "Create account" : "Invite your team"}
        </h1>
        <p className="text-sm text-slate-500">
          {currentStep === 1
            ? "Sign up as owner to set up your organization"
            : "Invite key collaborators to manage capital and schedule"}
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <div
            className={`h-1 rounded-full transition-all duration-200 ${
              currentStep === 1 ? "w-7 bg-slate-900" : "w-3 bg-slate-200"
            }`}
          />
          <div
            className={`h-1 rounded-full transition-all duration-200 ${
              currentStep === 2 ? "w-7 bg-slate-900" : "w-3 bg-slate-200"
            }`}
          />
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {/* Step 1: Account Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="organization"
              className="block text-xs font-semibold text-slate-700"
            >
              Organization name
            </label>
            <input
              id="organization"
              autoComplete="organization"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
              placeholder="e.g. Vance Development LLC"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="first-name"
                className="block text-xs font-semibold text-slate-700"
              >
                First name
              </label>
              <input
                id="first-name"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
                placeholder="Marcus"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="last-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Last name
              </label>
              <input
                id="last-name"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
                placeholder="Vance"
              />
            </div>
          </div>

          {/* Work Email with Company Domain Check */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Work email
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Work email only</span>
            </div>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onBlur={() => setEmailTouched(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className={`h-10 w-full rounded-lg border bg-white px-3.5 pr-9 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-3 ${
                  email && !emailValidation.isValid
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : email && emailValidation.isValid
                    ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/15"
                    : "border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-600/15"
                }`}
                placeholder="name@company.com"
              />
              {email && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {emailValidation.isValid ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  )}
                </div>
              )}
            </div>

            {/* Email Feedback Message */}
            {email && !emailValidation.isValid && (
              <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1.5 pt-0.5 leading-snug">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{emailValidation.message}</span>
              </p>
            )}
          </div>

          {/* Password with Real-Time List-Wise Validation */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onFocus={() => setPasswordFocused(true)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className={`h-10 w-full rounded-lg border bg-white px-3.5 pr-10 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:ring-3 ${
                  password && isPasswordValid
                    ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/15"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/15"
                }`}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Clean List-Wise Password Validation */}
            {(password || passwordFocused) && (
              <div className="pt-1.5 pb-0.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs transition-colors">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                      passwordCriteria.length
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span
                    className={
                      passwordCriteria.length
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs transition-colors">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                      passwordCriteria.uppercase
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span
                    className={
                      passwordCriteria.uppercase
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    At least one uppercase letter
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs transition-colors">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                      passwordCriteria.numberOrSymbol
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span
                    className={
                      passwordCriteria.numberOrSymbol
                        ? "text-emerald-700 font-medium"
                        : "text-slate-500"
                    }
                  >
                    At least one number or special character
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="h-10 w-full rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Structured Team Invitations */}
      {currentStep === 2 && (
        <form onSubmit={handleFinish} noValidate className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Team Member Email</span>
            <span>Assigned Role</span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-0.5">
            {teamInvites.map((invite) => (
              <div
                key={invite.id}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="relative flex-1 min-w-0">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    value={invite.email}
                    onChange={(e) => updateInviteRow(invite.id, { email: e.target.value })}
                    className="h-9 w-full rounded-lg border-0 bg-transparent pl-8 pr-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    placeholder="colleague@company.com"
                  />
                </div>

                <div className="w-[145px] shrink-0 border-l border-slate-100 pl-2">
                  <select
                    value={invite.role}
                    onChange={(e) =>
                      updateInviteRow(invite.id, { role: e.target.value as UserRole })
                    }
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2 text-xs font-semibold text-slate-800 cursor-pointer focus:border-blue-600 focus:outline-none"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.role} value={opt.role}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {teamInvites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInviteRow(invite.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Remove invite"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={addInviteRow}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Plus className="h-3 w-3" />
              </div>
              <span>Add another member</span>
            </button>
            <span className="text-[11px] text-slate-400">Can also invite anytime later</span>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={signUp.isPending}
              className="h-10 flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {signUp.isPending ? "Creating account…" : "Complete registration"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      {currentStep === 1 && (
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
