"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TeamMember, ProjectInvitation } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { InviteMemberModal } from "./invite-member-modal";
import { EditRoleModal } from "./edit-role-modal";
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
      {/* Top Banner with Invite Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 shadow-xs">
        <div>
          <h3 className="text-section font-bold text-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Team Permissions & Security Boundary Management</span>
          </h3>
          <p className="text-caption text-text-secondary mt-0.5">
            Manage authorized stakeholders, role scopes, and project access boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Active Team Members Register */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Active Project Team Members ({teamMembers.length})
        </h4>

        <div className="divide-y divide-border">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-bold text-caption text-primary border border-primary/20">
                  {member.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-body font-bold text-text-primary">{member.name}</h5>
                    <span
                      className={`rounded px-2 py-0.5 text-caption font-bold ${
                        member.role === "OWNER"
                          ? "bg-purple-100 text-purple-800"
                          : member.role === "CFO"
                          ? "bg-blue-100 text-blue-800"
                          : member.role === "PM"
                          ? "bg-emerald-100 text-emerald-800"
                          : member.role === "GC"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.status === "REVOKED" && (
                      <span className="rounded bg-danger-subtle px-2 py-0.5 text-caption font-semibold text-danger">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="text-caption text-text-muted mt-0.5">
                    {member.title} &bull; {member.company} &bull; <span className="font-mono">{member.email}</span>
                  </div>
                  {member.scope && (
                    <div className="text-caption text-text-secondary mt-1 bg-subtle/40 rounded px-2 py-1 inline-block">
                      <strong className="text-text-primary">Scope:</strong> {member.scope}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setEditingMember(member)}
                  className="flex items-center gap-1 rounded-md border border-border bg-subtle px-2.5 py-1 text-caption font-medium text-text-primary hover:bg-subtle/80"
                >
                  <Edit2 className="h-3.5 w-3.5 text-text-muted" />
                  Edit Role
                </button>
                {member.status !== "REVOKED" && member.role !== "OWNER" && (
                  <button
                    onClick={() => {
                      if (confirm(`Revoke access for ${member.name}?`)) {
                        revokeMutation.mutate(member.id);
                      }
                    }}
                    className="flex items-center gap-1 rounded-md border border-danger-border bg-danger-subtle px-2.5 py-1 text-caption font-medium text-danger hover:bg-danger/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
          <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
            Pending Project Invitations ({invitations.length})
          </h4>

          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-left text-body">
              <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
                <tr>
                  <th className="py-2.5 px-4">Invited Email</th>
                  <th className="py-2.5 px-4">Target Role</th>
                  <th className="py-2.5 px-4">Assigned Scope</th>
                  <th className="py-2.5 px-4">Invited By</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Invite Token / Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-subtle/30">
                    <td className="py-2.5 px-4 font-mono font-medium text-text-primary">{inv.email}</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-subtle px-2 py-0.5 text-caption font-bold text-text-primary">
                        {inv.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-caption text-text-secondary">{inv.scope || "Standard scope"}</td>
                    <td className="py-2.5 px-4 text-caption text-text-muted">{inv.invited_by}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-caption font-semibold ${
                          inv.status === "ACCEPTED"
                            ? "bg-success-subtle text-success border border-success-border"
                            : "bg-warning-subtle text-warning border border-warning-border"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => inv.invitation_url && handleCopyInviteLink(inv.invitation_url)}
                        disabled={!inv.invitation_url}
                        title={!inv.invitation_url ? "The invitation link is only available when it is created." : undefined}
                        className="inline-flex items-center gap-1 rounded bg-subtle border border-border px-2 py-1 text-caption font-medium text-text-primary hover:bg-subtle/80"
                      >
                        {copiedToken === inv.invitation_url ? (
                          <>
                            <Check className="h-3 w-3 text-success" />
                            <span className="text-success">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-text-muted" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Security Permissions Matrix */}
      <div className="rounded-lg border border-border bg-surface p-6 shadow-xs space-y-4">
        <h4 className="text-caption font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Role Security Boundaries & Permissions Matrix</span>
        </h4>

        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-left text-body">
            <thead className="bg-subtle border-b border-border text-caption font-semibold text-text-secondary">
              <tr>
                <th className="py-2.5 px-4">Capability / Operation</th>
                <th className="py-2.5 px-4 text-center">Owner (GP)</th>
                <th className="py-2.5 px-4 text-center">CFO (Finance)</th>
                <th className="py-2.5 px-4 text-center">PM (Field)</th>
                <th className="py-2.5 px-4 text-center">GC (Contractor)</th>
                <th className="py-2.5 px-4 text-center">Investor (LP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface text-caption">
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Executive Control Center & Portfolio</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Budget Baseline & Change Order Approval</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted">Propose only</td>
                <td className="py-2.5 px-4 text-center text-text-muted">COR Request only</td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Bank Account Reconciliations & Transfers</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Draw Preparation, Decision & Wire Allocation</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted">Work Verify only</td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Milestone Schedule & Field Inspections</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted">Submit claims only</td>
                <td className="py-2.5 px-4 text-center text-text-muted">Read brief only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-text-primary">Investor Snapshot Publication & Rescission</td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-success"><CheckCircle2 className="mx-auto h-4 w-4" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-text-muted"><XCircle className="mx-auto h-4 w-4 text-text-muted/40" /></td>
                <td className="py-2.5 px-4 text-center text-success">Read published</td>
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
