"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TeamMember, UserRole } from "@/lib/types";
import { Shield, X, AlertTriangle, CheckCircle2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [status, setStatus] = useState<"ACTIVE" | "REVOKED">(
    member.status === "REVOKED" ? "REVOKED" : "ACTIVE"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async () => {
      // If status changed to revoked or back
      if (status === "REVOKED" && member.status !== "REVOKED") {
        await api.team.revoke(projectId, member.id);
      } else {
        await api.team.updateRole(projectId, member.id, {
          role,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update member access";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-slate-200/90 bg-white p-6 shadow-overlay space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Manage Member Access
              </h3>
              <p className="text-xs text-slate-500">
                {member.name} • <span className="font-mono text-slate-400">{member.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Assigned Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Assigned Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="OWNER">Owner — Principal Developer</option>
                <option value="CFO">CFO — Head of Project Finance</option>
                <option value="PM">PM — Senior Project Manager</option>
                <option value="GC">GC — General Contractor / Submissions</option>
                <option value="INVESTOR">Investor — LP Syndicate Lead</option>
              </select>
            </div>
          </div>

          {/* Membership Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Account Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus("ACTIVE")}
                className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                  status === "ACTIVE"
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("REVOKED")}
                className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                  status === "REVOKED"
                    ? "bg-rose-50/80 border-rose-300 text-rose-800 shadow-2xs"
                    : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                }`}
              >
                <UserX className="h-3.5 w-3.5 text-rose-600" />
                <span>Revoked / Suspended</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-slate-600 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            className="h-9 px-4 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
