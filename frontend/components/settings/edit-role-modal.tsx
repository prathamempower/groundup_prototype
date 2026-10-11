"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TeamMember, UserRole } from "@/lib/types";
import { Shield, X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface EditRoleModalProps {
  projectId: string;
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditRoleModal({
  projectId,
  member,
  isOpen,
  onClose,
  onSuccess,
}: EditRoleModalProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<UserRole>(member.role);
  const [title, setTitle] = useState(member.title);
  const [scope, setScope] = useState(member.scope || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.team.updateRole(projectId, member.id, {
        role,
        title: title.trim() || undefined,
        scope: scope.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-text-primary">
                Update Member Role & Scope
              </h3>
              <p className="text-caption text-text-secondary">
                {member.name} ({member.email})
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
          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-body font-semibold text-text-primary focus:border-primary focus:outline-hidden"
            >
              <option value="OWNER">OWNER — Principal Developer</option>
              <option value="CFO">CFO — Head of Project Finance & Treasury</option>
              <option value="PM">PM — Senior Project Manager</option>
              <option value="GC">GC — General Contractor / Submissions</option>
              <option value="INVESTOR">INVESTOR — LP Syndicate Lead</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-caption font-semibold text-text-primary">
              Authority Scope
            </label>
            <textarea
              rows={2}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-md border border-border bg-surface p-2.5 text-body text-text-primary focus:border-primary focus:outline-hidden"
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
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Role Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
