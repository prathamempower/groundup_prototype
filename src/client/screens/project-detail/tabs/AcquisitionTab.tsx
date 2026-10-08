import React, { useState } from 'react';
import { 
  Building2, 
  FileCheck2, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { UserRole } from '../../../../shared/types';
import { hasPermission } from '../../../../shared/rbac/matrix';

interface AcquisitionTabProps {
  currentRole: UserRole;
  projectName?: string;
  projectAddress?: string;
}

interface DueDiligenceItem {
  id: string;
  name: string;
  category: 'Environmental' | 'Geotech' | 'Title' | 'Legal' | 'Zoning';
  status: 'COMPLETED' | 'IN_REVIEW' | 'PENDING';
  completedDate?: string;
  documentRef?: string;
  notes: string;
}

const INITIAL_CHECKLIST: DueDiligenceItem[] = [
  {
    id: 'dd-1',
    name: 'Phase I Environmental Site Assessment (ESA)',
    category: 'Environmental',
    status: 'COMPLETED',
    completedDate: 'Jan 10, 2026',
    documentRef: 'ESA_Phase1_Clean_Report.pdf',
    notes: 'No Recognized Environmental Conditions (RECs) identified. Site clear for residential.',
  },
  {
    id: 'dd-2',
    name: 'ALTA Boundary & Topographic Land Survey',
    category: 'Title',
    status: 'COMPLETED',
    completedDate: 'Jan 12, 2026',
    documentRef: 'ALTA_Boundary_Survey_Final.pdf',
    notes: 'Setbacks, utility easements, and lot dimensions (50ft x 100ft) fully validated.',
  },
  {
    id: 'dd-3',
    name: 'Geotechnical Soil Boring & Foundation Report',
    category: 'Geotech',
    status: 'COMPLETED',
    completedDate: 'Jan 14, 2026',
    documentRef: 'Geotech_Boring_Analysis_NJ.pdf',
    notes: 'Standard bearing capacity confirmed at 3,500 psf; helical piles recommended for rear garage.',
  },
  {
    id: 'dd-4',
    name: 'Fee Simple Title Policy & Municipal Lien Search',
    category: 'Title',
    status: 'COMPLETED',
    completedDate: 'Jan 15, 2026',
    documentRef: 'First_American_Title_Policy.pdf',
    notes: 'Clean fee simple title issued by First American Title Insurance; zero outstanding municipal liens.',
  },
  {
    id: 'dd-5',
    name: 'HUD-1 / ALTA Settlement Closing Statement',
    category: 'Legal',
    status: 'COMPLETED',
    completedDate: 'Jan 15, 2026',
    documentRef: 'HUD1_Settlement_Statement_Executed.pdf',
    notes: 'Final executed settlement statement recorded with Hudson County Register of Deeds.',
  },
  {
    id: 'dd-6',
    name: 'Township Zoning & Land Use Opinion Letter',
    category: 'Zoning',
    status: 'COMPLETED',
    completedDate: 'Jan 18, 2026',
    documentRef: 'Zoning_Board_Resolution_73Broadway.pdf',
    notes: 'Planning board approved 4-unit multi-family condominium development as-of-right with approved variance.',
  },
];

export const AcquisitionTab: React.FC<AcquisitionTabProps> = ({
  currentRole,
  projectName = '73 Broadway, Hoboken',
  projectAddress = '73 Broadway, Hoboken, NJ 07030',
}) => {
  const [checklist, setChecklist] = useState<DueDiligenceItem[]>(INITIAL_CHECKLIST);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const canEdit = hasPermission(currentRole, 'acquisition:edit');

  const purchasePrice = 1000000;
  const initialEquityFronted = 1000000;
  const closingCosts = 34500;
  const titleInsurance = 6200;
  const transferTaxes = 12800;

  return (
    <div className="space-y-6">
      {/* Overview Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Stage 1 & 2 · Acquisition & Closing Closed
              </span>
              <span className="text-xs text-slate-400 font-mono">Recorded Jan 15, 2026</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{projectName}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{projectAddress}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setSelectedDoc('HUD1_Settlement_Statement_Executed.pdf')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>View Executed HUD-1</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Basis Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Purchase Price</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${purchasePrice.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Land Acquisition Basis</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Developer Equity Fronted</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            ${initialEquityFronted.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">100% Cash at Closing</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Closing Settlement Fees</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${closingCosts.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Title, Transfer Tax, Escrow</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Title Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-1">
            Fee Simple Clean
          </div>
          <div className="text-[11px] text-slate-500 mt-1">First American Title #NJ-73892</div>
        </div>
      </div>

      {/* Due Diligence & Closing Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Due Diligence & Title Closing Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mandatory statutory prerequisites satisfied prior to construction loan underwriting commitment.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {checklist.filter(c => c.status === 'COMPLETED').length} / {checklist.length} Completed
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {checklist.map((item) => (
            <div key={item.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">{item.notes}</p>
                {item.documentRef && (
                  <div className="text-[11px] text-blue-600 font-mono flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setSelectedDoc(item.documentRef!)}>
                    <FileText className="w-3 h-3" />
                    <span>{item.documentRef}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Completed</span>
                  </span>
                  {item.completedDate && (
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.completedDate}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Document Modal Preview */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Executed Closing Record</h4>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                <div className="font-bold text-slate-900 mb-1">{selectedDoc}</div>
                <div>Hash: sha256-4f89d3810c92019fe827...</div>
                <div>Status: Certified & Recorded</div>
              </div>
              <p>
                This document serves as primary legal proof of clean site transfer, unencumbered land basis, and municipal zoning compliance.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
