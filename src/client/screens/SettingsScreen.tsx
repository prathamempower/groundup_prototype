// GroundUp AI — Settings & Team Organization Screen
// Stakeholder management, GC contract model configuration, and banking integrations

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Mail, 
  Landmark, 
  CreditCard, 
  Zap, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { UserRole, USER_ROLES } from '../../shared/types';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'contract' | 'integrations' | 'profile'>('team');

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    { id: 'm1', name: 'Hardik Parikh', email: 'hardik@empowerbpo.com', role: 'Developer / Owner', access: 'Full Control', status: 'Active' },
    { id: 'm2', name: 'Sarah Jenkins', email: 'sarah.jenkins@groundup.ai', role: 'CFO / Accounting', access: 'Financial Modules', status: 'Active' },
    { id: 'm3', name: 'Marcus Vance', email: 'marcus@vancepm.com', role: 'Project Manager', access: 'Timeline & Evidence', status: 'Active' },
    { id: 'm4', name: 'Kunal Shah', email: 'kunalshah0323@gmail.com', role: 'GC (Fixed Contract)', access: 'Milestone Claims', status: 'Active' },
    { id: 'm5', name: 'Sylvia Concrete', email: 'sylvia@concretepros.com', role: 'GC (Daily Updates)', access: 'Daily Logs & Receipts', status: 'Active' },
    { id: 'm6', name: 'Krutarth Shah', email: 'skrutarth08@gmail.com', role: 'Investor / Partner', access: 'Read-Only Portal', status: 'Active' },
  ]);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Investor / Partner');

  // Commercial model settings
  const [gcModel, setGcModel] = useState<'FIXED_PRICE' | 'DAILY_UPDATES'>('DAILY_UPDATES');
  const [interestModel, setInterestModel] = useState<'RESERVE' | 'MONTHLY'>('RESERVE');
  const [contingencyPct, setContingencyPct] = useState('10');

  // Integrations state
  const [integrations, setIntegrations] = useState({
    bcbBank: true,
    amexCard: true,
    inboundEmail: true,
    quickbooks: false,
  });

  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const newMemberEmail = inviteEmail;
    const newMemberRole = inviteRole;

    setTeamMembers(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: inviteName,
        email: newMemberEmail,
        role: newMemberRole,
        access: newMemberRole.includes('Investor') ? 'Read-Only Portal' : newMemberRole.includes('Lender') ? 'Lender Facility Review' : 'Custom Scoped',
        status: 'Invited (Mail Dispatched)',
      }
    ]);
    setInviteName('');
    setInviteEmail('');
    setInviteSuccessMsg(`Invitation email successfully sent to ${newMemberEmail} with login link for "${newMemberRole}" portal access.`);
    setTimeout(() => {
      setInviteSuccessMsg(null);
    }, 7000);
  };

  const handleResendInvite = (name: string, email: string, role: string) => {
    setInviteSuccessMsg(`Invitation email resent to ${email} with credentials for ${role} portal.`);
    setTimeout(() => {
      setInviteSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your project team, commercial GC contracting rules, and banking feeds
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'team', label: 'Team & Stakeholders', icon: Users },
          { id: 'contract', label: 'Commercial Contract Models', icon: Layers },
          { id: 'integrations', label: 'Connected Integrations', icon: Zap },
          { id: 'profile', label: 'Development Entity Profile', icon: Building2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Team & Stakeholders */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Email Invite Notification Banner */}
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
            <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {m.role !== 'Developer / Owner' ? (
                        <button
                          type="button"
                          onClick={() => handleResendInvite(m.name, m.email, m.role)}
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
      )}

      {/* Tab 2: Commercial Contract Models */}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">General Contractor Commercial Framework</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                The owner sets the GC contract model per project to determine the level of invoice visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setGcModel('FIXED_PRICE')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  gcModel === 'FIXED_PRICE'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Model 1: Fixed / Milestone Contract</span>
                  {gcModel === 'FIXED_PRICE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Lump-sum contract with agreed milestone payments (e.g. Site Work $300K, Framing $400K). The GC submits milestone claims with completion proof. Subcontractor invoices are hidden.
                </p>
              </div>

              <div
                onClick={() => setGcModel('DAILY_UPDATES')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  gcModel === 'DAILY_UPDATES'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">Model 2: Daily Updates / Open-Book</span>
                  {gcModel === 'DAILY_UPDATES' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Cost-plus or partnership structure. The GC posts daily work logs, receipts, and invoices with a separate GC markup % line item. High granularity for CFO ledger reconciliation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Construction Financing & Carrying Cost Model</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interest Payment Method</label>
                  <select
                    value={interestModel}
                    onChange={(e) => setInterestModel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="RESERVE">Model A: Interest Reserve Account (Lender holds & deducts monthly)</option>
                    <option value="MONTHLY">Model B: Monthly Out-of-Pocket Interest Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standard Reserve Contingency (%)</label>
                  <input
                    type="number"
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Connected Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-4 text-xs">
          {[
            {
              id: 'bcbBank',
              title: 'BCB Community Bank — Construction Loan Direct Feed',
              desc: 'Syncs loan draw approval statements, wire confirmations, and remaining interest reserve balances.',
              connected: integrations.bcbBank,
              icon: Landmark,
            },
            {
              id: 'amexCard',
              title: 'American Express Corporate Card Feed (Project Cards)',
              desc: 'Automatically ingests card swipes and associates charges with project numbers (Home Depot, lumber, etc.).',
              connected: integrations.amexCard,
              icon: CreditCard,
            },
            {
              id: 'inboundEmail',
              title: 'Automated Inbound Email Ingestion',
              desc: 'Dedicated email (draws@hoboken73.groundup.ai) automatically parsing PDF invoices and lien waivers.',
              connected: integrations.inboundEmail,
              icon: Mail,
            },
            {
              id: 'quickbooks',
              title: 'Intuit QuickBooks Online Ledger Sync',
              desc: 'Nightly two-way sync for bills, vendor checks, and cost code chart of accounts.',
              connected: integrations.quickbooks,
              icon: Zap,
            },
          ].map((int) => {
            const Icon = int.icon;
            return (
              <div key={int.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{int.title}</div>
                    <div className="text-slate-500 mt-0.5">{int.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIntegrations(prev => ({ ...prev, [int.id]: !(prev as any)[int.id] }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    int.connected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {int.connected ? '✓ Connected' : 'Connect Integration'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Entity Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-xl">
          <h3 className="text-sm font-bold text-slate-900">Developer Entity Details</h3>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Entity Legal Name</label>
            <input
              type="text"
              defaultValue="GroundUp Development Partners LLC"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Managing Principal</label>
            <input
              type="text"
              defaultValue="Hardik Parikh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tax ID / EIN</label>
            <input
              type="text"
              defaultValue="XX-XXX9842"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-black transition cursor-pointer"
          >
            Save Profile Updates
          </button>
        </div>
      )}
    </div>
  );
}
