"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UserRole } from "@/lib/types";
import { UserPlus, X, AlertTriangle, ShieldCheck, Mail, Building, User } from "lucide-react";

interface InviteMemberModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("PM");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [scope, setScope] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.team.invite(projectId, {
        project_id: projectId,
        email: email.trim(),
        name: name.trim() || undefined,
        role,
        title: title.trim() || undefined,
        company: company.trim() || undefined,
        scope: scope.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to invite team member";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  const isValidEmail = email.includes("@") && email.includes(".");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Invite New Project Team Member
              </h3>
              <p className="text-caption text-text-secondary">
                Assign role-based access permissions and security boundary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-md border border-danger-border bg-danger-subtle p-3 text-caption font-medium text-danger flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-caption font-semibold text-text-primary flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-text-muted" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-caption font-semibold text-text-primary flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-text-muted" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First & Last Name"
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-caption font-semibold text-text-primary">
                Assigned Role Boundary *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body font-medium text-text-primary focus:border-primary focus:outline-hidden"
              >
                <option value="OWNER">OWNER — Full Portfolio & Budget Authority</option>
                <option value="CFO">CFO — Treasury, Banking & Reconciliations</option>
                <option value="PM">PM — Field Progress, Milestones & Inspections</option>
                <option value="GC">GC — Limited Submissions & Lien Intake</option>
                <option value="INVESTOR">INVESTOR — Read-Only Published Briefs</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-caption font-semibold text-text-primary flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-text-muted" />
                <span>Company / Organization</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Organization name"
                className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Project Manager / Owner's Rep"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Custom Authority Scope Description (Optional)
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="e.g. Division 02-09 structural works & Draw inspection signoffs"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-surface px-4 py-2 text-body font-medium text-text-secondary hover:bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValidEmail || inviteMutation.isPending}
            onClick={() => inviteMutation.mutate()}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-body font-medium text-white transition-all shadow-xs ${
              isValidEmail && !inviteMutation.isPending
                ? "bg-primary hover:bg-primary-hover cursor-pointer"
                : "bg-text-muted/40 cursor-not-allowed opacity-60"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            {inviteMutation.isPending ? "Sending Invite..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
