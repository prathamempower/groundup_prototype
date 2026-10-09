// GroundUp AI — Dedicated Draw Packet Builder Screen (AIA G702 / G703)
// Full-screen 4-step wizard for compiling monthly construction draws with statutory retainage and condition audit

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Building2,
  DollarSign,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Percent,
  FileText,
  Camera,
  UserCheck,
} from 'lucide-react';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../../shared/types';
import { getProjectBudgetLines, getProjectDraws } from '../project-detail/initial-state';

interface DrawBuilderScreenProps {
  projects: Project[];
  summary: ProjectFourTruthsSummary | null;
  currentRole: UserRole;
  onSaveDraw?: (drawData: any) => void;
}

type DrawStep = 1 | 2 | 3 | 4;

const fmt = (n: number) => '$' + n.toLocaleString();

export function DrawBuilderScreen({
  projects,
  summary,
  currentRole,
  onSaveDraw,
}: DrawBuilderScreenProps) {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  const activeProjectId = projectId || projects[0]?.id || 'proj-73-broadway';
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectName = activeProject?.name || summary?.project_name || '73 Broadway, Hoboken';

  const [step, setStep] = useState<DrawStep>(1);

  // Initialize available lines from project budget
  const initialBudgetLines = getProjectBudgetLines(activeProjectId);
  const existingDraws = getProjectDraws(activeProjectId);
  const nextDrawNumber = existingDraws.length + 1;

  const [lines, setLines] = useState<
    Array<{
      category: string;
      budget: number;
      spent: number;
      available: number;
      selected: boolean;
      requested: number;
    }>
  >(() =>
    initialBudgetLines.map(b => {
      const available = Math.max(0, b.budget - b.spent);
      const defaultReq = Math.min(available, Math.max(0, Math.round(b.spent * 0.25)));
      return {
        category: b.category,
        budget: b.budget,
        spent: b.spent,
        available,
        selected: defaultReq > 0,
        requested: defaultReq,
      };
    })
  );

  // Audit Conditions State
  const [conditions, setConditions] = useState({
    lienWaiversCollected: true,
    inspectionsPassed: true,
    sitePhotosAttached: true,
    gcAffidavitSigned: true,
  });

  const [notes, setNotes] = useState(
    'Monthly draw request for structural framing milestones, MEP rough-in inspection sign-offs, and exterior envelope waterproofing.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Computed Financials
  const grossRequested = lines
    .filter(l => l.selected)
    .reduce((sum, l) => sum + (Number(l.requested) || 0), 0);

  const retainageRate = 0.10; // 10% statutory retainage
  const retainageAmount = Math.round(grossRequested * retainageRate);
  const netDisbursement = grossRequested - retainageAmount;

  const handleToggleLine = (idx: number) => {
    setLines(prev => {
      const next = [...prev];
      next[idx].selected = !next[idx].selected;
      if (next[idx].selected && next[idx].requested === 0) {
        next[idx].requested = Math.min(next[idx].available, 25000);
      }
      return next;
    });
  };

  const handleAmountChange = (idx: number, val: number) => {
    setLines(prev => {
      const next = [...prev];
      next[idx].requested = isNaN(val) ? 0 : Math.max(0, val);
      return next;
    });
  };

  const handleApplyPreset = (idx: number, pct: number) => {
    setLines(prev => {
      const next = [...prev];
      next[idx].selected = true;
      next[idx].requested = Math.round(next[idx].available * pct);
      return next;
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const selectedLines = lines
      .filter(l => l.selected && l.requested > 0)
      .map(l => ({ category: l.category, requested_amount: l.requested }));

    const drawPayload = {
      draw_number: nextDrawNumber,
      requested_total: grossRequested,
      lines: selectedLines,
      notes,
    };

    if (onSaveDraw) {
      onSaveDraw(drawPayload);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(`/projects/${activeProjectId}/draws`);
      }, 1200);
    }, 800);
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col w-full pb-16 select-none">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${activeProjectId}/draws`)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back to Draws"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{projectName}</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">Draw Lab</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-900">New Draw Packet</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <span>Compile Draw #{nextDrawNumber} Packet</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AIA G702 / G703
                </span>
              </h1>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
            {[
              { num: 1, label: '1. Select Lines' },
              { num: 2, label: '2. Audit Conditions' },
              { num: 3, label: '3. Retainage' },
              { num: 4, label: '4. Certification' },
            ].map(s => {
              const isActive = step === s.num;
              const isPassed = step > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num as DrawStep)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : isPassed
                      ? 'text-emerald-700 hover:bg-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Live Calculation Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Work Claimed</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{fmt(grossRequested)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {lines.filter(l => l.selected).length} SOV categories included
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statutory Retainage (10%)</div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1">-{fmt(retainageAmount)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Held in escrow until final completion</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Net Bank Wire Payable</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{fmt(netDisbursement)}</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Lender Fedwire disbursement to borrower</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lender Institution</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{activeProject?.lender_name || 'BCB Community Bank'}</div>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct Title Escrow
            </div>
          </div>
        </div>

        {/* Step 1: Select Lines */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 1: Schedule of Values (SOV) Allocation</h3>
                <p className="text-xs text-slate-500">
                  Select which trade categories to draw funds against based on verified field progress.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLines(prev => prev.map(l => ({ ...l, selected: true })))}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => setLines(prev => prev.map(l => ({ ...l, selected: false, requested: 0 })))}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">Include</th>
                    <th className="px-4 py-3 text-left">Trade Category</th>
                    <th className="px-4 py-3 text-right">Approved Budget</th>
                    <th className="px-4 py-3 text-right">Spent to Date</th>
                    <th className="px-4 py-3 text-right">Unused Balance</th>
                    <th className="px-4 py-3 text-left pl-6">Quick Presets</th>
                    <th className="px-4 py-3 text-right w-48">Requested Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => (
                    <tr
                      key={line.category}
                      className={`transition ${line.selected ? 'bg-emerald-50/20' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={line.selected}
                          onChange={() => handleToggleLine(idx)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{line.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(line.budget)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{fmt(line.spent)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-700">
                        {fmt(line.available)}
                      </td>
                      <td className="px-4 py-3 pl-6">
                        <div className="flex items-center gap-1">
                          {[0.25, 0.5, 0.75, 1.0].map(pct => (
                            <button
                              key={pct}
                              onClick={() => handleApplyPreset(idx, pct)}
                              className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            >
                              {pct * 100}%
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            value={line.requested || ''}
                            onChange={e => handleAmountChange(idx, parseFloat(e.target.value) || 0)}
                            disabled={!line.selected}
                            className={`w-32 px-2.5 py-1.5 border rounded-lg text-right font-mono font-bold text-xs ${
                              line.selected
                                ? 'bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 2: Audit Conditions */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Step 2: Statutory Compliance & Condition Precedents</h3>
              <p className="text-xs text-slate-500">
                Lenders require four verified conditions prior to disbursing loan draws.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setConditions(c => ({ ...c, lienWaiversCollected: !c.lienWaiversCollected }))}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  conditions.lienWaiversCollected
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    conditions.lienWaiversCollected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Subcontractor Lien Waivers (AIA G706 / G706A)</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Unconditional interim lien waivers verified across framing, plumbing, and electrical trades.
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700">
                    {conditions.lienWaiversCollected ? '✓ 100% Collected & Verified' : 'Click to verify'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setConditions(c => ({ ...c, inspectionsPassed: !c.inspectionsPassed }))}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  conditions.inspectionsPassed
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    conditions.inspectionsPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Municipal Township Inspection Sign-Off</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Township of Hoboken Building Dept inspection passed; green stickers posted on site.
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700">
                    {conditions.inspectionsPassed ? '✓ Passed & Signed by Inspector Miller' : 'Click to verify'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setConditions(c => ({ ...c, sitePhotosAttached: !c.sitePhotosAttached }))}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  conditions.sitePhotosAttached
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    conditions.sitePhotosAttached
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Geotagged Progress Photos & Drone Log</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    14 high-resolution photos showing rough plumbing, foundation cure, and framing completion.
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700">
                    {conditions.sitePhotosAttached ? '✓ 14 Photos Attached with EXIF Timestamp' : 'Click to verify'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setConditions(c => ({ ...c, gcAffidavitSigned: !c.gcAffidavitSigned }))}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  conditions.gcAffidavitSigned
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    conditions.gcAffidavitSigned
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">General Contractor Sworn Affidavit</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Signed declaration certifying no unpaid trade liens, stop notices, or labor disputes.
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700">
                    {conditions.gcAffidavitSigned ? '✓ Executed & Notarized' : 'Click to verify'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Retainage & Math Breakdown */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Step 3: Statutory Retainage & Ledger Calculation</h3>
              <p className="text-xs text-slate-500">
                Full transparency into gross invoice claims, retainage withholding, and net loan draw.
              </p>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-slate-300 text-xs">Total Gross Completed Trade Work</span>
                <span className="font-mono font-bold text-sm text-white">{fmt(grossRequested)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-xs">Statutory Retainage Withholding (10.0%)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    Escrow Trust
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-amber-400">-{fmt(retainageAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-emerald-400 font-bold text-sm">Net Wire Disbursement to Developer</div>
                  <div className="text-[11px] text-slate-400">Direct Fedwire deposit via BCB Community Bank Title Escrow</div>
                </div>
                <span className="font-mono font-bold text-2xl text-emerald-400">{fmt(netDisbursement)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Submission Notes & Remarks for Lender Auditor</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Certification & Submission */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Step 4: Certified AIA G702 / G703 Final Document</h3>
                <p className="text-xs text-slate-500">
                  Certified application for payment ready for immediate lender review and wire release.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Signature
              </span>
            </div>

            {/* AIA G702 Preview Card */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-3 font-sans">
                <div>
                  <div className="font-bold text-slate-900 text-base">AIA Document G702 — Application for Payment</div>
                  <div className="text-slate-500 text-xs mt-0.5">Project: {projectName} · Draw #{nextDrawNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-slate-900 font-bold">Lender: {activeProject?.lender_name || 'BCB Bank'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>1. Original Contract Sum: <span className="font-bold text-slate-900">$1,780,000.00</span></div>
                <div>2. Net Change Orders: <span className="font-bold text-slate-900">$40,000.00</span></div>
                <div>3. Contract Sum to Date: <span className="font-bold text-slate-900">$1,820,000.00</span></div>
                <div>4. Total Completed & Stored to Date: <span className="font-bold text-slate-900">{fmt(1412400 + grossRequested)}</span></div>
                <div>5. Retainage (10%): <span className="font-bold text-amber-700">{fmt(retainageAmount + 90367)}</span></div>
                <div>6. Total Earned Less Retainage: <span className="font-bold text-slate-900">{fmt(1412400 + grossRequested - (retainageAmount + 90367))}</span></div>
                <div className="col-span-2 pt-2 border-t border-slate-200 font-bold text-emerald-800 text-sm font-sans flex justify-between">
                  <span>7. CURRENT PAYMENT DUE (NET DISBURSEMENT):</span>
                  <span>{fmt(netDisbursement)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              if (step > 1) setStep((step - 1) as DrawStep);
              else navigate(`/projects/${activeProjectId}/draws`);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Previous Step'}</span>
          </button>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as DrawStep)}
                disabled={grossRequested === 0}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSuccess || grossRequested === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Compiling Certified Packet...</span>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Submitted to Lender!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>Submit Draw #{nextDrawNumber} to Lender ({fmt(netDisbursement)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
