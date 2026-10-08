// GroundUp AI — Data Intake Center
// Multi-role ingestion hub for Budget/SOV, Invoices, Schedule, and Loan Facility Terms

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../shared/types';
import { MultiDocExtractionReview } from '../components/MultiDocExtractionReview';
import { services } from '../../services';
import { IntakeTab, SovLineInput, MilestoneInput } from './data-intake/types';
import { INITIAL_SOV_LINES, INITIAL_SCHEDULE_MILESTONES } from './data-intake/initial-data';
import { DataIntakeHeader } from './data-intake/components/DataIntakeHeader';
import { DataIntakeNav } from './data-intake/components/DataIntakeNav';
import { BudgetIntakeTab } from './data-intake/tabs/BudgetIntakeTab';
import { InvoiceIntakeTab } from './data-intake/tabs/InvoiceIntakeTab';
import { ScheduleIntakeTab } from './data-intake/tabs/ScheduleIntakeTab';
import { AIExtractionTab } from './data-intake/tabs/AIExtractionTab';

interface DataIntakeCenterProps {
  projectId: string;
  activeRole: UserRole;
  onIntakeSuccess: () => void;
  onClose: () => void;
}

export const DataIntakeCenter: React.FC<DataIntakeCenterProps> = ({
  projectId,
  activeRole,
  onIntakeSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<IntakeTab>('budget');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [batchReviewData, setBatchReviewData] = useState<any>(null);

  const [sovLines, setSovLines] = useState<SovLineInput[]>(INITIAL_SOV_LINES);
  const [milestones, setMilestones] = useState<MilestoneInput[]>(INITIAL_SCHEDULE_MILESTONES);

  const [invoiceCategory, setInvoiceCategory] = useState('Plumbing');
  const [vendorName, setVendorName] = useState('Apex Commercial Plumbing');
  const [invoiceAmount, setInvoiceAmount] = useState('45000');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDesc, setInvoiceDesc] = useState('Copper fittings and water pressure manifold testing');
  const [lienWaiver, setLienWaiver] = useState(true);

  const handleSaveBudget = async () => {
    setLoading(true);
    try {
      await services.intake.saveMasterBudgetSOV(projectId, sovLines, activeRole);
      setSuccessMsg('Master Budget & Schedule of Values (SOV) saved successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await services.intake.addDirectExpense(
        projectId,
        {
          category: invoiceCategory,
          vendor_name: vendorName,
          amount: parseFloat(invoiceAmount),
          expense_date: invoiceDate,
          description: invoiceDesc,
          lien_waiver_received: lienWaiver,
        },
        activeRole
      );
      setSuccessMsg('Invoice recorded to Spend Truth successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      await services.intake.saveScheduleMilestones(projectId, milestones, activeRole);
      setSuccessMsg('Schedule milestones and physical progress % updated successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <DataIntakeHeader onClose={onClose} />
        <DataIntakeNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold text-xs cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'budget' && (
            <BudgetIntakeTab
              sovLines={sovLines}
              setSovLines={setSovLines}
              loading={loading}
              onSaveBudget={handleSaveBudget}
            />
          )}

          {activeTab === 'invoice' && (
            <InvoiceIntakeTab
              invoiceCategory={invoiceCategory}
              setInvoiceCategory={setInvoiceCategory}
              vendorName={vendorName}
              setVendorName={setVendorName}
              invoiceAmount={invoiceAmount}
              setInvoiceAmount={setInvoiceAmount}
              invoiceDate={invoiceDate}
              setInvoiceDate={setInvoiceDate}
              invoiceDesc={invoiceDesc}
              setInvoiceDesc={setInvoiceDesc}
              lienWaiver={lienWaiver}
              setLienWaiver={setLienWaiver}
              loading={loading}
              onSubmit={handleSaveInvoice}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleIntakeTab
              milestones={milestones}
              setMilestones={setMilestones}
              loading={loading}
              onSaveSchedule={handleSaveSchedule}
            />
          )}

          {activeTab === 'ai_parse' && (
            <AIExtractionTab
              projectId={projectId}
              setLoading={setLoading}
              setSuccessMsg={setSuccessMsg}
              setBatchReviewData={setBatchReviewData}
              onIntakeSuccess={onIntakeSuccess}
            />
          )}
        </div>
      </div>

      {batchReviewData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full">
            <MultiDocExtractionReview
              batchResult={batchReviewData}
              mode="full"
              onClose={() => setBatchReviewData(null)}
              onApplySOV={async (items) => {
                await services.documents.applyBatchDocuments({ projectId, sovLines: items });
                onIntakeSuccess();
                setBatchReviewData(null);
                setSuccessMsg(`Applied ${items.length} extracted budget lines to Master SOV.`);
              }}
              onApplyInvoices={async (items) => {
                await services.documents.applyBatchDocuments({ projectId, invoices: items });
                onIntakeSuccess();
                setBatchReviewData(null);
                setSuccessMsg(`Imported ${items.length} extracted contractor invoices into project ledger.`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
