import React from 'react';
import { Plus, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamSettingsTabProps {
  teamMembers: TeamMember[];
  inviteName: string;
  setInviteName: (n: string) => void;
  inviteEmail: string;
  setInviteEmail: (e: string) => void;
  inviteRole: string;
  setInviteRole: (r: string) => void;
  inviteSuccessMsg: string | null;
  setInviteSuccessMsg: (msg: string | null) => void;
  onAddMember: (e: React.FormEvent) => void;
  onResendInvite: (name: string, email: string, role: string) => void;
}

export const TeamSettingsTab: React.FC<TeamSettingsTabProps> = ({
  teamMembers,
  inviteName,
  setInviteName,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteSuccessMsg,
  setInviteSuccessMsg,
  onAddMember,
  onResendInvite,
}) => {
  return (
    <div className="space-y-6">
      {inviteSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{inviteSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setInviteSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Invite Stakeholder & Send Access Email
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            New accounts are initialized under Owner privileges. Add external partners below to automatically email them dedicated access to their portal.
          </p>
        </div>
        <form onSubmit={onAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. David Sterling"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Work Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Assigned Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none font-medium cursor-pointer"
            >
              <option value="CFO / Finance Director">CFO / Finance Director (Audits & Reconciliations)</option>
              <option value="Project Manager">Project Manager (Field & Inspections)</option>
              <option value="GC (Fixed Contract)">GC (Fixed Milestone Claims Portal)</option>
              <option value="GC (Daily Updates)">GC (Daily Work & Receipts Portal)</option>
              <option value="Construction Lender">Construction Lender (Loan Facility & Draws)</option>
              <option value="Project Accountant">Project Accountant (Invoices & SOVs)</option>
              <option value="Investor / Partner">Investor / Partner (Read-Only Portfolio Portal)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Mail Invite</span>
            </button>
          </div>
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Active Project Team Members & Stakeholders ({teamMembers.length})</span>
          <span className="text-[11px] font-normal text-slate-500">Owner-managed access control</span>
        </div>
        <table className="w-full text-xs">
          <thead className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3 text-left">Stakeholder</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role Persona</th>
              <th className="px-5 py-3 text-left">Access Level</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Email Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teamMembers.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                  {m.role === 'Developer / Owner' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  <span>{m.name}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-mono">{m.email}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{m.role}</td>
                <td className="px-5 py-3.5 text-slate-500">{m.access}</td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {m.role !== 'Developer / Owner' ? (
                    <button
                      type="button"
                      onClick={() => onResendInvite(m.name, m.email, m.role)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition cursor-pointer"
                      title={`Resend invitation email to ${m.email}`}
                    >
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Resend Mail</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Primary Admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
