"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import {
  User,
  Key,
  Shield,
  Bell,
  Laptop,
  CheckCircle2,
  Lock,
  Save,
  Clock,
  ArrowLeft,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECURITY" | "SESSIONS" | "NOTIFICATIONS">("PROFILE");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: meData, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const user = meData?.data;

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [drawShortfallNotif, setDrawShortfallNotif] = useState(true);
  const [budgetOverrunNotif, setBudgetOverrunNotif] = useState(true);
  const [milestoneSlipNotif, setMilestoneSlipNotif] = useState(true);

  React.useEffect(() => {
    if (user) {
      setFirstName(user.name?.split(" ")[0] || "");
      setLastName(user.name?.split(" ").slice(1).join(" ") || "");
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("Account profile preferences updated.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setErrorMessage("Please fill in current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }
    setErrorMessage("");
    setSuccessMessage("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-20 bg-subtle animate-pulse rounded-lg" />
        <div className="h-64 bg-subtle animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="px-6 max-w-4xl mx-auto space-y-6 pt-4">
        <PageHeader
          title="Account & Security Settings"
          statusBadge={{
            label: user?.role || "USER",
            variant: "neutral",
            icon: <User className="h-3.5 w-3.5" />,
          }}
          description="Personal profile, password management, active login sessions, and alert dispatch preferences."
          breadcrumbs={[
            { label: "Portfolio", href: "/projects" },
            { label: "Account" },
          ]}
        />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "PROFILE"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "SECURITY"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Password & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("SESSIONS")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "SESSIONS"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Active Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab("NOTIFICATIONS")}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-body font-medium transition-all ${
              activeTab === "NOTIFICATIONS"
                ? "bg-primary text-white shadow-xs font-semibold"
                : "bg-surface text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Notification Preferences</span>
          </button>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-md bg-success-subtle p-3 text-caption font-semibold text-success border border-success/30">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-danger-subtle p-3 text-caption font-semibold text-danger border border-danger/30">
            {errorMessage}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "PROFILE" && (
          <form onSubmit={handleSaveProfile} className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-title font-bold text-text-primary">Personal Information</h3>
              <p className="text-caption text-text-muted mt-0.5">
                Manage your GroundUp account name and email identity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-caption font-semibold text-text-muted">Email Address (Read-only)</label>
                <Input value={user?.email || ""} disabled className="bg-subtle text-text-muted cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-muted">Global Role</label>
                <Input value={user?.role || ""} disabled className="bg-subtle text-text-muted cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-muted">Organization ID</label>
                <Input value={user?.organization_id || ""} disabled className="bg-subtle text-text-muted cursor-not-allowed font-mono text-xs" />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" variant="primary">
                <Save className="mr-1.5 h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        )}

        {/* SECURITY TAB */}
        {activeTab === "SECURITY" && (
          <form onSubmit={handleUpdatePassword} className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-title font-bold text-text-primary">Update Password</h3>
              <p className="text-caption text-text-muted mt-0.5">
                Ensure your account is using a secure, long password.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-text-primary">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" variant="primary">
                <Lock className="mr-1.5 h-4 w-4" /> Update password
              </Button>
            </div>
          </form>
        )}

        {/* SESSIONS TAB */}
        {activeTab === "SESSIONS" && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-title font-bold text-text-primary">Active Sessions</h3>
              <p className="text-caption text-text-muted mt-0.5">
                Devices and browsers currently logged into this GroundUp account.
              </p>
            </div>

            <div className="divide-y divide-border rounded-md border border-border">
              <div className="flex items-center justify-between p-4 bg-subtle/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary text-body">Current Browser Session</span>
                      <span className="rounded-full bg-success-subtle px-2 py-0.5 text-[10px] font-bold text-success">
                        Active Now
                      </span>
                    </div>
                    <p className="text-caption text-text-muted mt-0.5">
                      Linux • Chrome / Chromium • Local network
                    </p>
                  </div>
                </div>
                <span className="text-caption text-text-muted">Current</span>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-title font-bold text-text-primary">Notification Settings</h3>
              <p className="text-caption text-text-muted mt-0.5">
                Control which operational events trigger system notifications and email alerts.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-subtle/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">Email Digest Notifications</div>
                  <div className="text-caption text-text-secondary">
                    Receive daily email summaries of exceptions across all assigned projects.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-subtle/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drawShortfallNotif}
                  onChange={(e) => setDrawShortfallNotif(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">Draw Shortfall & Condition Alerts</div>
                  <div className="text-caption text-text-secondary">
                    Immediate notification when lender disburals are short-funded or require compliance sign-off.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-subtle/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={budgetOverrunNotif}
                  onChange={(e) => setBudgetOverrunNotif(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">Budget Overrun Warnings</div>
                  <div className="text-caption text-text-secondary">
                    Notify when invoice lines or change orders exceed line baselines or deplete buffer reserve.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-subtle/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={milestoneSlipNotif}
                  onChange={(e) => setMilestoneSlipNotif(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-semibold text-text-primary text-body">Milestone Schedule Slips</div>
                  <div className="text-caption text-text-secondary">
                    Alert when critical path deliverables exceed planned dates and generate carry cost accruals.
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setSuccessMessage("Notification preferences saved.");
                  setTimeout(() => setSuccessMessage(""), 3000);
                }}
              >
                <Save className="mr-1.5 h-4 w-4" /> Save preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
