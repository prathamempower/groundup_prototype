// GroundUp AI — Draw Tracker & Revision Chains Screen
// Section 8: State machine preserving historical draw records

import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle, Clock, ShieldAlert, FileUp, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { Draw, DrawLine, UserRole } from '../../shared/types';

interface DrawsScreenProps {
  projectId: string;
  activeRole: UserRole;
  onOpenProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', cat?: string) => void;
}

export const DrawsScreen: React.FC<DrawsScreenProps> = ({ projectId, activeRole, onOpenProvenance }) => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);

  const [resubmitting, setResubmitting] = useState(false);
  const [disbursing, setDisbursing] = useState(false);

  const loadDraws = () => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/draws`)
      .then((res) => res.json())
      .then((data) => {
        setDraws(data.draws || []);
        setDrawLines(data.drawLines || []);
        if (data.draws?.length > 0 && !selectedDrawId) {
          setSelectedDrawId(data.draws[data.draws.length - 1].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDraws();
  }, [projectId]);

  const activeDraw = draws.find((d) => d.id === selectedDrawId) || draws[0];
  const activeLines = drawLines.filter((l) => l.draw_id === activeDraw?.id);

  const handleResubmit = async () => {
    if (!activeDraw) return;
    setResubmitting(true);

    const correctiveLines = activeLines
      .filter((l) => l.status === 'rejected' || l.status === 'partially_approved')
      .map((l) => ({
        category: l.category,
        requested_amount: l.requested_amount - l.approved_amount,
        corrective_document_id: 'doc-corrective-waiver',
        notes: 'Attached executed unconditional progress lien waiver',
      }));

    try {
      const res = await fetch(`/api/draws/${activeDraw.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctiveLines, actorRole: activeRole }),
      });
      const data = await res.json();
      loadDraws();
      setSelectedDrawId(data.revisionDraw.id);
      setResubmitting(false);
    } catch (err) {
      console.error(err);
      setResubmitting(false);
    }
  };

  const handleDisburse = async () => {
    if (!activeDraw) return;
    setDisbursing(true);

    try {
      await fetch(`/api/draws/${activeDraw.id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disbursedAmount: activeDraw.approved_total, actorRole: activeRole }),
      });
      loadDraws();
      setDisbursing(false);
    } catch (err) {
      console.error(err);
      setDisbursing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" /> Draw Tracker & Revisions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Append-only revision chains • Historical records are never overwritten.
          </p>
        </div>
        <button
          onClick={loadDraws}
          className="p-2 rounded-xl bg-surface-900 border border-slate-700 text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Draw Revision Chain Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {draws.map((d) => {
          const isSelected = d.id === selectedDrawId;

          return (
            <button
              key={d.id}
              onClick={() => setSelectedDrawId(d.id)}
              className={`p-4 rounded-3xl shrink-0 text-left border transition ${
                isSelected
                  ? 'bg-surface-800 border-brand-500 shadow-lg shadow-brand-500/10'
                  : 'bg-surface-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Draw #{d.draw_number}</span>
                {d.revision_number > 0 && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    Rev {d.revision_number}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-300 mt-1">
                ${d.requested_total.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Draw Detail Card */}
      {activeDraw && (
        <div className="p-6 rounded-3xl bg-surface-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-400">
                Draw #{activeDraw.draw_number} Details {activeDraw.revision_number > 0 ? `(Revision ${activeDraw.revision_number})` : ''}
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                ${activeDraw.requested_total.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">Requested</span>
              </div>
            </div>

            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border self-start ${
                activeDraw.status === 'approved_full'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : activeDraw.status === 'approved_partial' || activeDraw.status === 'rejected'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
              }`}
            >
              {activeDraw.status.replace('_', ' ')}
            </span>
          </div>

          {/* Lender Response Memo */}
          {activeDraw.lender_notes && (
            <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Construction Lender Response:
              </span>
              <p className="text-slate-300 leading-relaxed">{activeDraw.lender_notes}</p>
            </div>
          )}

          {/* Line-Item Breakdown Table */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Line Items ({activeLines.length})
            </div>

            <div className="space-y-2">
              {activeLines.map((line) => {
                const isRejected = line.status === 'rejected';

                return (
                  <div
                    key={line.id}
                    className={`p-4 rounded-2xl border ${
                      isRejected ? 'bg-rose-950/20 border-rose-500/40' : 'bg-surface-950 border-slate-800'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{line.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          line.status === 'disbursed'
                            ? 'bg-purple-500/20 text-purple-300'
                            : line.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {line.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Requested</span>
                        <span className="text-slate-200 font-bold">${line.requested_amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Approved</span>
                        <span className="text-emerald-400 font-bold">${line.approved_amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Funded</span>
                        <span className="text-purple-300 font-bold">${line.funded_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {line.rejection_reason_code && (
                      <div className="pt-2 text-xs text-rose-300 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rejection Code: {line.rejection_reason_code}</strong>
                          {line.rejection_notes && <p className="text-[11px] text-slate-400">{line.rejection_notes}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons for Resubmission & Disbursement */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            {(activeDraw.status === 'rejected' || activeDraw.status === 'approved_partial') && (
              <button
                onClick={handleResubmit}
                disabled={resubmitting}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                <FileUp className="w-4 h-4" />
                {resubmitting ? 'Creating Revision...' : `Upload Corrective Docs & Resubmit (Rev ${activeDraw.revision_number + 1})`}
              </button>
            )}

            {activeDraw.status === 'approved_partial' && activeDraw.disbursed_total === 0 && (
              <button
                onClick={handleDisburse}
                disabled={disbursing}
                className="py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition"
              >
                <ArrowDownCircle className="w-4 h-4" />
                {disbursing ? 'Recording Wire...' : `Record Wire Disbursement ($${activeDraw.approved_total.toLocaleString()})`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
