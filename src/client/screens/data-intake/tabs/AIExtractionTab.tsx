import React from 'react';
import { Sparkles, Upload, UploadCloud } from 'lucide-react';
import { services } from '../../../../services';

interface AIExtractionTabProps {
  projectId: string;
  setLoading: (loading: boolean) => void;
  setSuccessMsg: (msg: string | null) => void;
  setBatchReviewData: (data: any) => void;
  onIntakeSuccess: () => void;
}

export const AIExtractionTab: React.FC<AIExtractionTabProps> = ({
  projectId,
  setLoading,
  setSuccessMsg,
  setBatchReviewData,
  onIntakeSuccess,
}) => {
  const handleParseSubcontractorInvoice = async () => {
    setLoading(true);
    try {
      const result = await services.documents.parseDocument({
        fileName: 'Invoice_Titan_Concrete_INV1092.pdf',
        content: `Titan Concrete LLC\nInvoice #INV-1092\n03-300 Cast-in-Place Concrete Slab: $133,200.00\nSubtotal: $133,200.00\nPrevious Statement Balance: $45,000.00\nTotal Amount Due: $178,200.00`,
        projectId,
      });
      setSuccessMsg(`Extracted ${result.lineItems?.length || 0} valid numbers ($${(result.totalAmount || 0).toLocaleString()}) and excluded ${result.excludedFigures?.length || 0} double-count entries.`);
      setLoading(false);
      onIntakeSuccess();
    } catch (e: any) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleParseHUDStatement = async () => {
    setLoading(true);
    try {
      const result = await services.documents.parseDocument({
        fileName: 'HUD1_Settlement_Statement.pdf',
        content: `HUD-1 Settlement Statement\nLine 101 Contract Purchase Price: $168,000.00\nLine 202 Loan Principal: $592,000.00\nLine 106 County Tax Proration: $3,420.00`,
        projectId,
      });
      setSuccessMsg(`Extracted HUD Settlement Basis ($168k) and excluded non-construction tax proration ($3.4k).`);
      setLoading(false);
      onIntakeSuccess();
    } catch (e: any) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const filePayloads = await Promise.all(
        Array.from(files).map((file) => {
          return new Promise<{ fileName: string; bufferBase64: string; size: number }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              const base64 = res.includes(',') ? res.split(',')[1] : res;
              resolve({ fileName: file.name, bufferBase64: base64, size: file.size });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const result = await services.documents.parseBatchDocuments({ files: filePayloads, projectId });
      setBatchReviewData(result);
      setSuccessMsg(`Extracted ${result.summary.documentCount} file(s): ${result.normalizedSOV.length} SOV lines ($${result.summary.totalBudgetExtracted.toLocaleString()}), ${result.normalizedInvoices.length} invoices ($${result.summary.totalSpendExtracted.toLocaleString()}).`);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> GroundUp AI Extraction & Verification Engine
        </h3>
        <p className="text-xs text-slate-400">
          Parses construction documents and enforces strict <strong>KEEP vs AVOID</strong> rules to prevent double counting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Action Card */}
        <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Simulate Document Extraction</h4>
          <div className="space-y-2">
            <button
              onClick={handleParseSubcontractorInvoice}
              className="w-full p-3 rounded-xl bg-surface-900 border border-slate-700 hover:border-emerald-500/50 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-white">Parse Subcontractor Invoice</p>
                <p className="text-[11px] text-slate-400">Keeps Net Amount Due · Filters Previous Balance ($45k)</p>
              </div>
              <Upload className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={handleParseHUDStatement}
              className="w-full p-3 rounded-xl bg-surface-900 border border-slate-700 hover:border-blue-500/50 text-left transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-white">Parse HUD Settlement Sheet</p>
                <p className="text-[11px] text-slate-400">Keeps Purchase Basis ($168k) · Filters Tax Escrows ($3.4k)</p>
              </div>
              <Upload className="w-4 h-4 text-blue-400" />
            </button>

            {/* Real Multi-File Upload Button */}
            <label className="w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 hover:border-emerald-500 text-left transition flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-emerald-300">Upload & Analyze Real Files</p>
                <p className="text-[11px] text-emerald-400/80">Multi-upload .xlsx, .csv, .pdf, .docx with CSI normalization</p>
              </div>
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Filter Rules Summary Card */}
        <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 space-y-2 text-xs">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Strict Filtering Rules</h4>
          <div className="space-y-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <strong>✅ KEEP & ADD:</strong> Net Current Amount Due, Approved Budget per CSI Code, Executed Change Orders, Land Acquisition Basis.
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <strong>❌ AVOID & REJECT:</strong> Previous Balances, Excel Subtotal Rows, Non-cash Tax Prorations, Unapproved Draft Change Orders.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
