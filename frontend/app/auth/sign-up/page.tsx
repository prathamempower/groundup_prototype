"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Mail,
  UserCheck,
} from "lucide-react";
import { authAdapter } from "@/lib/api/adapters/auth-adapter";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

function passwordStrength(password: string): number {
  return [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function SignUpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Step 1: Owner Account Credentials & Organization
  // Step 2: First Project Workspace Onboarding
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Owner & Org fields
  const [organization, setOrganization] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: First Project Onboarding fields
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [lifecycleStage, setLifecycleStage] = useState("PRE_CONSTRUCTION");

  const [errorMessage, setErrorMessage] = useState("");
  const strength = useMemo(() => passwordStrength(password), [password]);

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

      // 2. Initialize first project if provided
      let createdProjectId = "";
      if (projectName.trim()) {
        try {
          const projectRes = await api.projects.create({
            name: projectName.trim(),
            project_entity: `${projectName.trim()} LLC`,
            address: projectAddress.trim() || "To be specified",
            lifecycle_stage: lifecycleStage as any,
            contract_model: "COST_PLUS",
            status: "ACTIVE",
            currency: "USD",
          });
          createdProjectId = projectRes.data.id;
          localStorage.setItem("groundup_active_project_id", createdProjectId);
        } catch {
          // Fallback to projects portfolio if project initialization errors
        }
      }

      return { authSession, createdProjectId };
    },
    onSuccess: ({ authSession, createdProjectId }) => {
      window.localStorage.setItem("groundup_session_seen", "1");
      window.sessionStorage.setItem("groundup_signup_completed", "1");
      queryClient.setQueryData(["auth-session"], authSession);
      queryClient.setQueryData(["me"], { data: authSession.user });

      if (createdProjectId) {
        router.replace(`/projects/${createdProjectId}/control-center`);
      } else {
        router.replace("/projects");
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to create organization account.");
    },
  });

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your first and last name.");
      return false;
    }
    if (!organization.trim()) {
      setErrorMessage("Enter your development organization or company name.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Enter a valid work email address.");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Use at least 8 characters for your password.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
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
    <div>
      {/* Stepper Indicator */}
      <div className="mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Step {currentStep} of 2</span>
          <span className="text-slate-700">
            {currentStep === 1 ? "Account & Organization" : "Project Setup"}
          </span>
        </div>
        <div className="flex gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              currentStep >= 1 ? "bg-slate-900" : "bg-slate-200"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              currentStep === 2 ? "bg-slate-900" : "bg-slate-200"
            }`}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {currentStep === 1 ? "Create account" : "Initial project"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {currentStep === 1
            ? "Set up your owner account and development organization."
            : "Configure your initial project workspace."}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          {errorMessage}
        </div>
      )}

      {/* Step 1: Owner Account & Organization */}
      {currentStep === 1 && (
        <div className="space-y-3.5">
          <div>
            <label htmlFor="organization" className="mb-1 block text-xs font-semibold text-slate-700">
              Organization / Development Company
            </label>
            <input
              id="organization"
              autoComplete="organization"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="e.g. Vance Development LLC"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="first-name" className="mb-1 block text-xs font-semibold text-slate-700">
                First name
              </label>
              <input
                id="first-name"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Marcus"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="mb-1 block text-xs font-semibold text-slate-700">
                Last name
              </label>
              <input
                id="last-name"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Vance"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold text-slate-700">
              Work email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="marcus@vancedev.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((segment) => (
                  <span
                    key={segment}
                    className={`h-1 flex-1 rounded-sm ${
                      strength >= segment ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleNext}
            className="h-10 w-full justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 cursor-pointer mt-2"
          >
            Continue to Project Setup <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Step 2: Initial Project Onboarding */}
      {currentStep === 2 && (
        <form noValidate onSubmit={handleFinish} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="mb-1 block text-xs font-semibold text-slate-700">
              Project Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              placeholder="e.g. 161 Woodlawn Ave or Grandview Tower"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Leave blank if you prefer to create projects later from the portfolio.
            </p>
          </div>

          {projectName && (
            <>
              <div>
                <label htmlFor="project-address" className="mb-1 block text-xs font-semibold text-slate-700">
                  Site Address
                </label>
                <input
                  id="project-address"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Jersey City, NJ 07305"
                />
              </div>

              <div>
                <label htmlFor="lifecycle-stage" className="mb-1 block text-xs font-semibold text-slate-700">
                  Current Lifecycle Stage
                </label>
                <select
                  id="lifecycle-stage"
                  value={lifecycleStage}
                  onChange={(e) => setLifecycleStage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="ACQUISITION">Acquisition</option>
                  <option value="PRE_CONSTRUCTION">Pre Construction</option>
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="COMPLETION">Completion</option>
                </select>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentStep(1)}
              className="h-10 rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              type="submit"
              className="h-10 flex-1 justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
              loading={signUp.isPending}
            >
              Launch Workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}

      {currentStep === 1 && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
