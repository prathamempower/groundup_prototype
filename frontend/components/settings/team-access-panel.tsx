"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TeamMember, ProjectInvitation } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { InviteMemberModal } from "./invite-member-modal";
import { EditRoleModal } from "./edit-role-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  Mail,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

interface TeamAccessPanelProps {
  projectId: string;
}

export function TeamAccessPanel({ projectId }: TeamAccessPanelProps) {
  const queryClient = useQueryClient();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team", projectId],
    queryFn: () => api.team.list(projectId),
  });

  const { data: invitationsData } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => api.invitations.list(),
  });

  const teamMembers = teamData?.data || [];
  const invitations = invitationsData?.data || [];

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.team.revoke(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", projectId] });
      queryClient.invalidateQueries({ queryKey: ["audit-events"] });
    },
  });

  const handleCopyInviteLink = (url: string) => {
    navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    setCopiedToken(url);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Project Team Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all">
        {/* Header with Title and Invite Button */}
        <div className="flex items-center justify-between p-5 px-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
              <Users className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Project Team
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {teamMembers.length}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 shadow-sm shrink-0 font-medium h-8 px-3 text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Member</span>
          </Button>
        </div>

        {/* Team Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                <th className="py-3 px-6 min-w-[240px]">Member</th>
                <th className="py-3 px-5 min-w-[220px]">Email</th>
                <th className="py-3 px-5 min-w-[140px]">Status</th>
                <th className="py-3 px-6 text-right min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-xs">
              {teamMembers.map((member) => {
                const roleConfig: Record<string, { badge: string; avatar: string; roleLabel: string }> = {
                  OWNER: {
                    badge: "bg-purple-50 text-purple-700 border-purple-200/60",
                    avatar: "bg-purple-700 text-white shadow-2xs",
                    roleLabel: "Owner",
                  },
                  CFO: {
                    badge: "bg-blue-50 text-blue-700 border-blue-200/60",
                    avatar: "bg-blue-700 text-white shadow-2xs",
                    roleLabel: "CFO / Finance",
                  },
                  PM: {
                    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                    avatar: "bg-emerald-700 text-white shadow-2xs",
                    roleLabel: "Project Manager",
                  },
                  GC: {
                    badge: "bg-amber-50 text-amber-700 border-amber-200/60",
                    avatar: "bg-amber-700 text-white shadow-2xs",
                    roleLabel: "General Contractor",
                  },
                  INVESTOR: {
                    badge: "bg-purple-50 text-purple-700 border-purple-200/60",
                    avatar: "bg-indigo-700 text-white shadow-2xs",
                    roleLabel: "Investor (LP)",
                  },
                };

                const currentRoleConfig = roleConfig[member.role] || {
                  badge: "bg-slate-50 text-slate-700 border-slate-200",
                  avatar: "bg-slate-700 text-white shadow-2xs",
                  roleLabel: member.role,
                };

                return (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Member Name + Role Subtitle */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 aspect-square rounded-full flex items-center justify-center font-bold text-xs shrink-0 tracking-tight select-none shadow-2xs",
                          currentRoleConfig.avatar
                        )}>
                          {member.avatarInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {member.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn(
                              "inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold border tracking-tight",
                              currentRoleConfig.badge
                            )}>
                              {currentRoleConfig.roleLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-5 text-slate-600 font-normal">
                      {member.email}
                    </td>

                    {/* Status (Clickable to change) */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => setEditingMember(member)}
                        className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80 cursor-pointer"
                        title="Click to change member status"
                      >
                        {member.status === "REVOKED" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-200/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMember(member)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Manage Member Access"
                        >
                          <span className="font-bold tracking-widest text-sm leading-none select-none">···</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 px-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Role Permissions Matrix
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-blue-600 shadow-2xs shrink-0 rounded-lg h-8 px-3"
          >
            <Edit2 className="h-3 w-3 text-slate-400" />
            <span>Edit Permissions</span>
          </Button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs">
                <th className="py-3.5 px-6 font-semibold text-slate-600 min-w-[280px]">Feature / Capability</th>
                <th className="py-3.5 px-4 text-center min-w-[120px] bg-purple-50/30 text-purple-900 border-x border-slate-200/50">
                  <div className="font-bold text-xs text-purple-950">Owner</div>
                  <div className="text-[10px] text-purple-600/80 font-medium">GP</div>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[120px] bg-blue-50/30 text-blue-900 border-r border-slate-200/50">
                  <div className="font-bold text-xs text-blue-950">CFO</div>
                  <div className="text-[10px] text-blue-600/80 font-medium">Finance</div>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[120px] bg-emerald-50/30 text-emerald-900 border-r border-slate-200/50">
                  <div className="font-bold text-xs text-emerald-950">PM</div>
                  <div className="text-[10px] text-emerald-600/80 font-medium">Field</div>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[120px] bg-amber-50/30 text-amber-900 border-r border-slate-200/50">
                  <div className="font-bold text-xs text-amber-950">GC</div>
                  <div className="text-[10px] text-amber-600/80 font-medium">Contractor</div>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[120px] bg-slate-50/50 text-slate-900">
                  <div className="font-bold text-xs text-slate-900">Investor</div>
                  <div className="text-[10px] text-slate-500 font-medium">LP</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 text-xs">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">📊</span>
                    <span>Executive Control Center & Portfolio</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">📄</span>
                    <span>Budget Baseline & Change Order Approval</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5 text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">Propose only</span>
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5 text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">COR Request only</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">🏛️</span>
                    <span>Bank Account Reconciliations & Transfers</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">💵</span>
                    <span>Draw Preparation, Decision & Wire Allocation</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5 text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">Work Verify only</span>
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">📅</span>
                    <span>Milestone Schedule & Field Inspections</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5 text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">Submit claims only</span>
                </td>
                <td className="py-3 px-4 text-center text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">Read brief only</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 text-xs font-mono">📈</span>
                    <span>Investor Snapshot Publication & Rescission</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center border-x border-slate-100/80 bg-purple-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-blue-50/5">
                  <CheckCircle2 className="mx-auto h-4.5 w-4.5 text-emerald-600" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-emerald-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center border-r border-slate-100/80 bg-amber-50/5">
                  <XCircle className="mx-auto h-4 w-4 text-slate-250 opacity-40" />
                </td>
                <td className="py-3 px-4 text-center text-slate-600 font-medium text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">Read published</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      {isInviteOpen && (
        <InviteMemberModal
          projectId={projectId}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {editingMember && (
        <EditRoleModal
          projectId={projectId}
          member={editingMember}
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
