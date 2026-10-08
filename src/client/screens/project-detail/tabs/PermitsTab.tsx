import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building, 
  Calendar, 
  ShieldCheck, 
  FileCheck2,
  ExternalLink 
} from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

interface PermitsTabProps {
  currentRole: UserRole;
  projectName?: string;
}

interface PermitRecord {
  id: string;
  permitNumber: string;
  discipline: 'Demolition' | 'Foundation' | 'Building' | 'Electrical' | 'Plumbing' | 'Fire' | 'Occupancy';
  issuingAuthority: string;
  status: 'ISSUED' | 'IN_REVIEW' | 'INSPECTION_PENDING' | 'SCHEDULED';
  issueDate?: string;
  expiryDate?: string;
  inspectorName?: string;
  notes: string;
}

const INITIAL_PERMITS: PermitRecord[] = [
  {
    id: 'perm-1',
    permitNumber: 'DEM-2026-089',
    discipline: 'Demolition',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'ISSUED',
    issueDate: 'Feb 02, 2026',
    expiryDate: 'Feb 02, 2027',
    inspectorName: 'Tom Martinez (Badge #401)',
    notes: 'Prior structure demolition completed and backfill inspected.',
  },
  {
    id: 'perm-2',
    permitNumber: 'FND-2026-112',
    discipline: 'Foundation',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'ISSUED',
    issueDate: 'Mar 15, 2026',
    expiryDate: 'Mar 15, 2027',
    inspectorName: 'Dave Kowalski (Badge #312)',
    notes: 'Approved for grade beams, concrete slab, and 24 helical pile attachments.',
  },
  {
    id: 'perm-3',
    permitNumber: 'BLD-2026-304',
    discipline: 'Building',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'ISSUED',
    issueDate: 'Apr 20, 2026',
    expiryDate: 'Apr 20, 2027',
    inspectorName: 'Sarah Collins (Badge #219)',
    notes: 'Architectural structural plan set Rev-4 approved for 4-story wood frame on podium.',
  },
  {
    id: 'perm-4',
    permitNumber: 'ELE-2026-442',
    discipline: 'Electrical',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'INSPECTION_PENDING',
    issueDate: 'May 10, 2026',
    expiryDate: 'May 10, 2027',
    inspectorName: 'Mark Chen (Badge #188)',
    notes: 'Rough electrical wiring in progress; rough inspection scheduled upon drywall pre-close.',
  },
  {
    id: 'perm-5',
    permitNumber: 'PLM-2026-508',
    discipline: 'Plumbing',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'ISSUED',
    issueDate: 'May 15, 2026',
    expiryDate: 'May 15, 2027',
    inspectorName: 'Dave Kowalski (Badge #312)',
    notes: 'Rough DWV & water supply lines passed underground pressure test.',
  },
  {
    id: 'perm-6',
    permitNumber: 'CO-SCHED-01',
    discipline: 'Occupancy',
    issuingAuthority: 'City of Hoboken Construction Dept',
    status: 'SCHEDULED',
    expiryDate: 'May 30, 2028',
    notes: 'Final Certificate of Occupancy inspection slated following completion of unit punch lists.',
  },
];

export const PermitsTab: React.FC<PermitsTabProps> = ({
  currentRole,
  projectName = '73 Broadway, Hoboken',
}) => {
  const [permits] = useState<PermitRecord[]>(INITIAL_PERMITS);
  const [selectedPermit, setSelectedPermit] = useState<PermitRecord | null>(null);

  const canEdit = hasPermission(currentRole, 'permits:edit');

  const issuedCount = permits.filter(p => p.status === 'ISSUED').length;
  const inReviewCount = permits.filter(p => p.status === 'IN_REVIEW' || p.status === 'INSPECTION_PENDING').length;

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Stage 3 · Planning & Permits Active
              </span>
              <span className="text-xs text-slate-400 font-mono">Hoboken Dept of Building & Safety</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{projectName} — Municipal Authorizations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved plan sets, building codes, township licenses, and statutory milestone inspection sign-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Permits Active</div>
              <div className="text-lg font-bold font-mono text-emerald-700">
                {issuedCount} of {permits.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Issued Permits
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{issuedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Foundation, Demo, Building, Plumbing</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Inspection In-Progress
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">{inReviewCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Electrical rough-in pending sign-off</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Certificate of Occupancy
          </div>
          <div className="text-base font-bold text-slate-900 mt-1">Scheduled</div>
          <div className="text-[11px] text-slate-500 mt-1">Target Date: May 30, 2028</div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Municipal Permits & Field Inspection Registry</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Township building inspection passes are required before draw line disbursements can be authorized.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Permit #</th>
                <th className="py-2.5 px-3">Discipline</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Assigned Inspector</th>
                <th className="py-2.5 px-3">Scope & Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permits.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.permitNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{p.discipline}</span>
                  </td>
                  <td className="py-3 px-3">
                    {p.status === 'ISSUED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Issued
                      </span>
                    )}
                    {p.status === 'INSPECTION_PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Inspecting
                      </span>
                    )}
                    {p.status === 'SCHEDULED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{p.issueDate || '—'}</td>
                  <td className="py-3 px-3 text-slate-700">{p.inspectorName || 'TBD'}</td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{p.notes}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedPermit(p)}
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Permit Details Modal */}
      {selectedPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Permit #{selectedPermit.permitNumber}</h4>
              </div>
              <button
                onClick={() => setSelectedPermit(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Authority</span>
                  <span className="font-semibold text-slate-800">{selectedPermit.issuingAuthority}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Inspector</span>
                  <span className="font-semibold text-slate-800">{selectedPermit.inspectorName || 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Scope & Notes</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedPermit.notes}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPermit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
