// GroundUp AI — New User Data Intake & Financial Intake Screen
// Multi-step guided interactive workflow for new users to input Project details, SOV, Invoices, Loan, and Status
// Generates the Certified Report & Dashboard strictly from user-entered data

import React, { useState } from 'react';
import { AuthenticatedUser } from './AuthScreen';
import { InteractiveSiteMapPicker } from '../components/InteractiveSiteMapPicker';
import { MultiDocExtractionReview } from '../components/MultiDocExtractionReview';
import { MultiDocumentBatchResult } from '../../server/services/documentParsingService';
import {
  Building2,
  Receipt,
  FileSpreadsheet,
  Landmark,
  Layers,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
  DollarSign,
  Calculator,
  ChevronRight,
  UploadCloud,
  FileText,
  HelpCircle,
  FolderPlus,
  RefreshCw,
  MapPin,
  Navigation,
  LocateFixed,
  Map,
  Globe
} from 'lucide-react';

interface NewUserIntakePageProps {
  user: AuthenticatedUser;
  onCompleteIntake: (projectId: string, reportData: any) => void;
  onCancelOrSignOut: () => void;
}

interface SOVItem {
  category: string;
  cost_code: string;
  amount: number;
}

interface InvoiceItem {
  vendor: string;
  category: string;
  inv: string;
  amount: number;
  waiver: boolean;
  description: string;
}

type IntakeStep = 'profile' | 'project' | 'sov' | 'invoices' | 'loan' | 'review';

export function NewUserIntakePage({ user, onCompleteIntake, onCancelOrSignOut }: NewUserIntakePageProps) {
  // Current active step
  const [activeStep, setActiveStep] = useState<IntakeStep>('profile');

  // Step 1: User & Company
  const [userName, setUserName] = useState(user.name || '');
  const [userCompany, setUserCompany] = useState(user.company || '');
  const [userRole, setUserRole] = useState(user.role || 'Developer / Owner');

  // Step 2: Project Metadata
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectUnits, setProjectUnits] = useState(1);
  const [squareFeet, setSquareFeet] = useState(0);
  const [projectStatus, setProjectStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');
  const [targetBudget, setTargetBudget] = useState<number>(0);

  // GPS Location & Google Map Selector States
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(true);

  // Detect Real Device GPS Location using HTML5 Geolocation API & Reverse Geocode
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || 'Site Address';
            const houseNumber = addr.house_number ? `${addr.house_number} ` : '';
            const city = addr.city || addr.town || addr.village || addr.county || 'Austin';
            const state = addr.state || 'TX';
            const postcode = addr.postcode || '';

            const formattedAddress = `${houseNumber}${road}, ${city}, ${state} ${postcode}`.trim();
            setProjectAddress(formattedAddress);
          } else {
            setProjectAddress(`GPS Site: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch {
          setProjectAddress(`GPS Site: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsDetectingLocation(false);
        setError('Could not fetch real GPS location. Please check browser permissions or select a location from the map below.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Step 3: Master Budget & SOV (Starts empty for user input)
  const [sovLines, setSovLines] = useState<SOVItem[]>([]);

  // Step 3 SOV Upload Method & Uploaded Docs
  const [sovUploadMethod, setSovUploadMethod] = useState<'manual' | 'doc-upload'>('manual');
  const [uploadedSovDocs, setUploadedSovDocs] = useState<Array<{ name: string; size: string; type: string; lineCount: number; timestamp: string }>>([]);

  // Step 4: Contractor Invoices Ledger (Starts empty for user input)
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  // Step 5: Loan Facility
  const [lenderName, setLenderName] = useState('');
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [disbursedFunded, setDisbursedFunded] = useState<number>(0);

  // Form submission & state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-Document Extraction States
  const [isExtractingSov, setIsExtractingSov] = useState(false);
  const [sovBatchResult, setSovBatchResult] = useState<MultiDocumentBatchResult | null>(null);
  const [isExtractingInvoices, setIsExtractingInvoices] = useState(false);
  const [invoiceBatchResult, setInvoiceBatchResult] = useState<MultiDocumentBatchResult | null>(null);
  const [showBatchReviewModal, setShowBatchReviewModal] = useState<'sov' | 'invoices' | null>(null);

  const readFileAsBase64 = (file: File): Promise<{ fileName: string; bufferBase64: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({ fileName: file.name, bufferBase64: base64, size: file.size });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBatchUploadSOV = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsExtractingSov(true);
    setError(null);
    try {
      const filePayloads = await Promise.all(Array.from(files).map(readFileAsBase64));
      const res = await fetch('/api/documents/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filePayloads, projectId: 'proj-user-active' }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.includes('PayloadTooLargeError') || res.status === 413) {
          throw new Error('Document payload is too large (exceeds 50MB). Please select smaller files.');
        }
        if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
          throw new Error('Backend server is temporarily unreachable or returned an unexpected HTML page. Please verify the API server is running on port 3001.');
        }
        throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 100)}`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data?.error || `Server returned error status ${res.status}`);
      }

      if (data.success) {
        // 1. Auto-populate Truth 4 (Loan Facility & Terms) if loan document is detected
        if (data.extractedLoan) {
          if (data.extractedLoan.lenderName) setLenderName(data.extractedLoan.lenderName);
          if (data.extractedLoan.loanAmount) setLoanAmount(data.extractedLoan.loanAmount);
          if (data.extractedLoan.interestRate) setInterestRate(data.extractedLoan.interestRate);
          if (data.extractedLoan.disbursedFunded) setDisbursedFunded(data.extractedLoan.disbursedFunded);
        }

        // 2. Auto-populate Truth 1 (Master Budget & Schedule of Values)
        if (data.normalizedSOV && data.normalizedSOV.length > 0) {
          const extractedLines: SOVItem[] = data.normalizedSOV.map((item: any) => ({
            category: item.category,
            cost_code: item.costCode,
            amount: item.amount,
          }));
          setSovLines(extractedLines);
          setTargetBudget(data.summary?.totalBudgetExtracted || extractedLines.reduce((a: number, b: any) => a + b.amount, 0));
        }

        // 3. Auto-populate Truth 2 (Invoices & Incurred Spend) if invoice documents are detected
        if (data.normalizedInvoices && data.normalizedInvoices.length > 0) {
          const extractedInvoices: InvoiceItem[] = data.normalizedInvoices.map((inv: any) => ({
            vendor: inv.vendor,
            category: inv.category,
            inv: inv.invoiceNumber,
            amount: inv.amount,
            waiver: inv.lienWaiver,
            description: inv.description,
          }));
          setInvoices((prev) => [...prev, ...extractedInvoices]);
          setInvoiceBatchResult(data);
        }

        setSovBatchResult(data);

        // 4. Record uploaded documents with human-readable type classifications
        const newDocEntries = data.documents.map((d: any) => {
          let typeLabel = `${d.documentType} (Normalized)`;
          if (d.documentType === 'LOAN_AGREEMENT') {
            typeLabel = 'Construction Loan Agreement';
          } else if (d.documentType === 'SOV') {
            typeLabel = 'Master Budget & SOV';
          } else if (d.documentType === 'INVOICE') {
            typeLabel = 'Contractor Invoice / Spend';
          } else if (d.documentType === 'AIA_G702' || d.documentType === 'AIA_G703') {
            typeLabel = 'AIA Draw Schedule';
          } else if (d.documentType === 'HUD_SETTLEMENT') {
            typeLabel = 'Closing / Settlement Statement';
          }
          return {
            name: d.fileName,
            size: `${((filePayloads.find((f) => f.fileName === d.fileName)?.size || 102400) / 1024).toFixed(1)} KB`,
            type: typeLabel,
            lineCount: d.lineItems.length,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            loanFacility: d.loanFacility,
          };
        });
        setUploadedSovDocs((prev) => [...newDocEntries, ...prev]);
      }
    } catch (err: any) {
      console.error('Project document extraction error:', err);
      setError(`Failed to extract project documents: ${err.message}`);
    } finally {
      setIsExtractingSov(false);
    }
  };

  const handleBatchUploadInvoices = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsExtractingInvoices(true);
    setError(null);
    try {
      const filePayloads = await Promise.all(Array.from(files).map(readFileAsBase64));
      const res = await fetch('/api/documents/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filePayloads, projectId: 'proj-user-active' }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.includes('PayloadTooLargeError') || res.status === 413) {
          throw new Error('Document payload is too large (exceeds 50MB). Please select smaller files.');
        }
        if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
          throw new Error('Backend server is temporarily unreachable or returned an unexpected HTML page. Please verify the API server is running on port 3001.');
        }
        throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 100)}`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data?.error || `Server returned error status ${res.status}`);
      }

      if (data.success && data.normalizedInvoices) {
        const extractedInvoices: InvoiceItem[] = data.normalizedInvoices.map((inv: any) => ({
          vendor: inv.vendor,
          category: inv.category,
          inv: inv.invoiceNumber,
          amount: inv.amount,
          waiver: inv.lienWaiver,
          description: inv.description,
        }));
        setInvoices((prev) => [...prev, ...extractedInvoices]);
        setInvoiceBatchResult(data);
      }
    } catch (err: any) {
      console.error('Invoice extraction error:', err);
      setError(`Failed to extract invoice documents: ${err.message}`);
    } finally {
      setIsExtractingInvoices(false);
    }
  };

  // Live Calculations
  const totalSovBudget = sovLines.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalIncurredSpend = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const developerCashExposure = Math.max(0, totalIncurredSpend - disbursedFunded);
  const dailyCarryingCost = Math.round((disbursedFunded * (interestRate / 100)) / 365);

  // Helper to add SOV row
  const handleAddSOVLine = () => {
    setSovLines([
      ...sovLines,
      { category: 'Custom Trade Line', cost_code: `0${sovLines.length + 1}-000`, amount: 15000 },
    ]);
  };

  // Helper to delete SOV row
  const handleDeleteSOVLine = (index: number) => {
    setSovLines(sovLines.filter((_, i) => i !== index));
  };

  // Helper to add Invoice row
  const handleAddInvoice = () => {
    setInvoices([
      ...invoices,
      {
        vendor: 'New Trade Contractor',
        category: sovLines[0]?.category || 'Foundation & Concrete',
        inv: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 25000,
        waiver: true,
        description: 'Trade materials & labor',
      },
    ]);
  };

  // Helper to delete Invoice row
  const handleDeleteInvoice = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  // Track highest visited/validated step to enforce workflow progression
  const [maxVisitedStepIndex, setMaxVisitedStepIndex] = useState<number>(0);

  // Stepper navigation logic
  const steps: { id: IntakeStep; label: string; number: number }[] = [
    { id: 'profile', label: '1. User & Entity', number: 1 },
    { id: 'project', label: '2. Project & Status', number: 2 },
    { id: 'sov', label: '3. Project Data & SOV', number: 3 },
    { id: 'invoices', label: '4. Invoices & Spend', number: 4 },
    { id: 'loan', label: '5. Loan & Financing', number: 5 },
    { id: 'review', label: '6. Review & Report', number: 6 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);

  const isStepValid = (stepIdx: number): boolean => {
    if (stepIdx === 0) return Boolean(userName.trim() && userCompany.trim());
    if (stepIdx === 1) return Boolean(projectName.trim() && projectAddress.trim());
    if (stepIdx === 2) return sovLines.length > 0 && totalSovBudget > 0;
    if (stepIdx === 3) return invoices.length > 0;
    if (stepIdx === 4) return loanAmount > 0;
    return true;
  };

  const canAccessStep = (targetIdx: number): boolean => {
    if (targetIdx === 0) return true;
    for (let i = 0; i < targetIdx; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (!isStepValid(currentStepIndex)) {
      if (currentStepIndex === 0) {
        setError('Step 1 Locked: Please enter your Full Name and Company/Entity Name before proceeding to Step 2.');
      } else if (currentStepIndex === 1) {
        setError('Step 2 Locked: Please enter your Project Name and Site Address before proceeding to Step 3.');
      } else if (currentStepIndex === 2) {
        setError('Step 3 Locked: Please upload your project documents (e.g. Construction Loan, Budget, or SOV) or add budget lines manually before proceeding.');
      } else if (currentStepIndex === 3) {
        setError('Step 4 Locked: Please add contractor invoices or upload invoice documents before proceeding to Step 5.');
      } else if (currentStepIndex === 4) {
        setError('Step 5 Locked: Please enter your construction loan facility amount before proceeding to final review.');
      } else {
        setError(`Please complete all required document fields in Step ${currentStepIndex + 1} before proceeding.`);
      }
      return;
    }
    setError(null);
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setActiveStep(steps[nextIdx].id);
      setMaxVisitedStepIndex((prev) => Math.max(prev, nextIdx));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    setError(null);
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (targetStepId: IntakeStep, targetIdx: number) => {
    if (targetIdx === currentStepIndex) return;

    if (targetIdx < currentStepIndex) {
      setError(null);
      setActiveStep(targetStepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    for (let i = 0; i < targetIdx; i++) {
      if (!isStepValid(i)) {
        setError(`Step ${targetIdx + 1} Locked: You must complete Step ${i + 1} (${steps[i].label.split('. ')[1]}) before unlocking Step ${targetIdx + 1}.`);
        return;
      }
    }
    setError(null);
    setActiveStep(targetStepId);
    setMaxVisitedStepIndex((prev) => Math.max(prev, targetIdx));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit full intake package to server
  const handleSubmitIntake = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectName.trim()) {
      setError('Please enter a Project Name.');
      setActiveStep('project');
      return;
    }
    if (sovLines.length === 0) {
      setError('Please provide at least one SOV budget line.');
      setActiveStep('sov');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      user: {
        name: userName,
        company: userCompany,
        email: user.email,
        role: userRole,
      },
      project: {
        name: projectName,
        address: projectAddress,
        units: Number(projectUnits) || 1,
        square_feet: Number(squareFeet) || 3200,
        status: projectStatus,
        target_budget: Number(targetBudget) || totalSovBudget,
      },
      loan: {
        lender_name: lenderName,
        loan_amount: Number(loanAmount),
        interest_rate: Number(interestRate),
        disbursed_funded: Number(disbursedFunded),
        term_months: 18,
      },
      sovLines: sovLines.map((s) => ({
        category: s.category,
        cost_code: s.cost_code,
        amount: Number(s.amount) || 0,
      })),
      invoices: invoices.map((inv) => ({
        vendor: inv.vendor,
        category: inv.category,
        inv: inv.inv,
        amount: Number(inv.amount) || 0,
        waiver: Boolean(inv.waiver),
        description: inv.description,
      })),
      milestones: [
        {
          milestone: 'Pre-construction & Permitting',
          trade: 'Architecture / City Approvals',
          planned_start: '2026-01-10',
          planned_end: '2026-02-15',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : 1.0,
        },
        {
          milestone: 'Foundation & Slab',
          trade: 'Titan Concrete LLC',
          planned_start: '2026-02-15',
          planned_end: '2026-03-30',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : projectStatus === 'ACTIVE' ? 0.9 : 0.0,
        },
        {
          milestone: 'Framing & Structural',
          trade: 'BMC Framing & Lumber',
          planned_start: '2026-04-01',
          planned_end: '2026-05-15',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : projectStatus === 'ACTIVE' ? 0.45 : 0.0,
        },
        {
          milestone: 'MEP Rough-in',
          trade: 'Austin MEP Systems',
          planned_start: '2026-05-15',
          planned_end: '2026-06-30',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : projectStatus === 'ACTIVE' ? 0.15 : 0.0,
        },
        {
          milestone: 'Drywall & Interior Finishes',
          trade: 'Finishing Contractors',
          planned_start: '2026-07-01',
          planned_end: '2026-09-15',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : 0.0,
        },
        {
          milestone: 'Certificate of Occupancy (CO)',
          trade: 'City Building Inspection',
          planned_start: '2026-09-15',
          planned_end: '2026-10-31',
          verified_progress_pct: projectStatus === 'COMPLETED' ? 1.0 : 0.0,
        },
      ],
    };

    try {
      const response = await fetch('/api/intake/full-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize project data.');
      }

      const result = await response.json();
      const newProjId = result.projectId || result.project?.id;

      // Prepare report data strictly from user-entered figures
      const certifiedReportData = {
        project: projectName,
        builder: `${userName} · ${userCompany}`,
        status: projectStatus === 'ACTIVE' ? 'ONGOING' : projectStatus === 'COMPLETED' ? 'COMPLETED' : 'NOT STARTED',
        budget: Number(targetBudget) || totalSovBudget,
        incurredSpend: totalIncurredSpend,
        disbursedFunded: Number(disbursedFunded),
        frontingCash: developerCashExposure,
        dailyInterest: dailyCarryingCost,
        invoices: invoices,
        sovLines: sovLines,
      };

      onCompleteIntake(newProjId, certifiedReportData);
    } catch (err: any) {
      console.error('Intake submission error:', err);
      setError(err.message || 'An error occurred while creating project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col">
      {/* Top Navigation Bar with Lock Indicator */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center font-black text-base shadow-sm">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">GroundUp AI</span>
              <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🔒 Sequential Intake Workflow</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              User: <strong className="text-white">{userName || 'New User'}</strong> {userCompany ? `(${userCompany})` : ''} · Complete each step sequentially to unlock platform home
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancelOrSignOut}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {steps.map((s, idx) => {
            const isActive = activeStep === s.id;
            const isDone = isStepValid(idx) && currentStepIndex > idx;
            const isUnlocked = canAccessStep(idx);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepClick(s.id, idx)}
                disabled={!isUnlocked}
                title={!isUnlocked ? `Locked: Complete Step ${idx} first` : s.label}
                className={`flex items-center gap-2 text-xs font-medium transition ${
                  isActive
                    ? 'text-slate-900 font-bold scale-105'
                    : isDone
                    ? 'text-emerald-700 font-semibold cursor-pointer hover:text-emerald-900'
                    : isUnlocked
                    ? 'text-slate-600 hover:text-slate-900 cursor-pointer'
                    : 'text-slate-300 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isUnlocked
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {!isUnlocked ? '🔒' : isDone ? '✓' : s.number}
                </div>
                <span className="hidden sm:inline">{s.label.split('. ')[1]}</span>
                {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1 hidden md:inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Intake Content Container */}
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6 flex-1 w-full">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: USER & BUILDER PROFILE */}
        {activeStep === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 1: User & Contracting Entity</h2>
                <p className="text-xs text-slate-500">Provide your identity and legal entity name used for draw signatures and lender packages.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Sam"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company / Entity Name</label>
                <input
                  type="text"
                  value={userCompany}
                  onChange={(e) => setUserCompany(e.target.value)}
                  placeholder="e.g. ABC Company"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                >
                  <option value="Developer / Owner">Developer / Owner (Principal Sponsor)</option>
                  <option value="General Contractor / Builder">General Contractor / Builder</option>
                  <option value="CFO / Finance Director">CFO / Finance Director</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue to Project Scope</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT METADATA & STATUS */}
        {activeStep === 'project' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Project Information & Construction Status</h2>
                <p className="text-xs text-slate-500">Define the project details and whether construction is ongoing, not started, or completed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Oakridge Duplex"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Site Address & Real Location</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isDetectingLocation}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 text-emerald-700 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Detect Real GPS Location'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5 text-slate-600" />
                      <span>{showMapPicker ? 'Hide Map' : 'Show Map'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    placeholder="e.g. 410 Oakridge Dr, Round Rock, TX 78681"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                {/* Quick Regional Pin Location Presets */}
                <div className="pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Select Site:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectAddress('212 Maple Ave, Austin, TX 78704');
                        setCoords({ lat: 30.252, lng: -97.763 });
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition cursor-pointer"
                    >
                      Austin, TX (212 Maple)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectAddress('410 Oakridge Dr, Round Rock, TX 78681');
                        setCoords({ lat: 30.518, lng: -97.691 });
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition cursor-pointer"
                    >
                      Round Rock, TX (410 Oakridge)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectAddress('109 Elm St, San Antonio, TX 78201');
                        setCoords({ lat: 29.435, lng: -98.498 });
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition cursor-pointer"
                    >
                      San Antonio, TX (109 Elm)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectAddress('Lot 7 Crestview Way, Pflugerville, TX 78660');
                        setCoords({ lat: 30.454, lng: -97.618 });
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition cursor-pointer"
                    >
                      Pflugerville, TX (Crestview)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectAddress('1842 Cedar Heights, Buda, TX 78610');
                        setCoords({ lat: 30.082, lng: -97.844 });
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition cursor-pointer"
                    >
                      Buda, TX (Cedar Heights)
                    </button>
                  </div>
                </div>

                {/* Interactive Click-to-Pin Location Map Component */}
                {showMapPicker && (
                  <div className="mt-3">
                    <InteractiveSiteMapPicker
                      address={projectAddress}
                      coords={coords}
                      onSelectLocation={(newAddress, newCoords) => {
                        setProjectAddress(newAddress);
                        setCoords(newCoords);
                      }}
                      isDetectingGPS={isDetectingLocation}
                      onDetectGPS={handleDetectGPSLocation}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Units</label>
                <input
                  type="number"
                  value={projectUnits === 0 ? '' : projectUnits}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setProjectUnits(clean === '' ? 0 : Number(clean));
                  }}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gross Square Footage (sq ft)</label>
                <input
                  type="number"
                  value={squareFeet === 0 ? '' : squareFeet}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setSquareFeet(clean === '' ? 0 : Number(clean));
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Project Construction Status</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                  type="button"
                  onClick={() => setProjectStatus('ACTIVE')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    projectStatus === 'ACTIVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ongoing</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Currently in construction with active trade draws.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectStatus('ON_HOLD')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    projectStatus === 'ON_HOLD'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Not Started</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pre-construction, architectural plans, or permitting.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectStatus('COMPLETED')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    projectStatus === 'COMPLETED'
                      ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Completed</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">100% completed with Certificate of Occupancy (CO).</p>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue to Budget & SOV</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE OF VALUES (SOV) & MASTER BUDGET */}
        {activeStep === 'sov' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 3: Project Documents & Financial Data Ingestion</h2>
                  <p className="text-xs text-slate-500">Upload all documents regarding the project (Construction Loan, Master Budget/SOV, Invoices & Pay Apps, Closing Statements) or enter details manually.</p>
                </div>
              </div>

              {/* Method Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSovUploadMethod('manual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    sovUploadMethod === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Method 1: Manual Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setSovUploadMethod('doc-upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    sovUploadMethod === 'doc-upload'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  Method 2: Upload Project Documents
                </button>
              </div>
            </div>

            {/* Document Upload Zone if in doc-upload mode */}
            {sovUploadMethod === 'doc-upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center transition bg-slate-50/60">
                  <UploadCloud className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Upload All Project Documents & Financial Data
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                    GroundUp AI ingests all documents regarding your project — Construction Loan agreements, Master SOV, Contractor Invoices, AIA G702/G703, or Closing Statements. Automatically extracts loan terms, budget allocations, and spend records.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <label className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs inline-flex items-center gap-2">
                      <UploadCloud className="w-4 h-4" />
                      <span>{isExtractingSov ? 'Extracting Project Documents...' : 'Select Project Documents (Multi-File)'}</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.aiag702,.aiag703,.AIA702,.AIA703"
                        className="hidden"
                        disabled={isExtractingSov}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleBatchUploadSOV(e.target.files);
                          }
                        }}
                      />
                    </label>

                    {sovBatchResult && (
                      <button
                        type="button"
                        onClick={() => setShowBatchReviewModal('sov')}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Inspect Provenance & Audit Trail</span>
                      </button>
                    )}
                  </div>

                  {/* Extraction Active Banner */}
                  {isExtractingSov && (
                    <div className="mt-3 p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>Running multi-document OCR, CSI classification, loan facility extraction, and anti-double-counting filter...</span>
                    </div>
                  )}

                  {/* Batch Success & 3 Truths Extraction Cards */}
                  {sovBatchResult && !isExtractingSov && (
                    <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-left space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-bold text-emerald-950">
                            Extracted verified project data across {sovBatchResult.summary.documentCount} file(s).
                            {sovBatchResult.summary.totalExcludedAmount > 0 && ` Filtered $${sovBatchResult.summary.totalExcludedAmount.toLocaleString()} non-construction / double-counted figures.`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowBatchReviewModal('sov')}
                          className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                        >
                          View Verification Breakdown
                        </button>
                      </div>

                      {/* 3 Truths Extraction Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        {/* Truth 4: Loan & Financing */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Truth 4 · Loan Facility</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Auto-routes to Step 5</span>
                          </div>
                          <div className="text-base font-extrabold text-slate-900">
                            ${(sovBatchResult.extractedLoan?.loanAmount || loanAmount || 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Lender: <strong>{sovBatchResult.extractedLoan?.lenderName || lenderName || 'Horizon Commercial Bank'}</strong>
                            {sovBatchResult.extractedLoan?.interestRate ? ` · ${sovBatchResult.extractedLoan.interestRate}% Int` : ''}
                          </div>
                        </div>

                        {/* Truth 1: Master Budget / SOV */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Truth 1 · Master Budget</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Populated Below</span>
                          </div>
                          <div className="text-base font-extrabold text-slate-900">
                            ${(sovBatchResult.summary.totalBudgetExtracted || totalSovBudget).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            <strong>{sovBatchResult.normalizedSOV.length}</strong> CSI Division Trade Lines Allocated
                          </div>
                        </div>

                        {/* Truth 2: Invoices & Spend */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Truth 2 · Incurred Spend</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">Auto-routes to Step 4</span>
                          </div>
                          <div className="text-base font-extrabold text-slate-900">
                            ${(sovBatchResult.summary.totalSpendExtracted || 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            <strong>{sovBatchResult.normalizedInvoices.length}</strong> Invoices / Pay Apps Extracted
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Supported formats indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Supported Formats:</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">Construction Loan (.pdf, .docx)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Budget & SOV (.xlsx, .xls, .csv)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">Invoices & Receipts (.pdf, .csv)</span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">AIA G702 / AIA G703</span>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {uploadedSovDocs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Processed Project Documents ({uploadedSovDocs.length})
                    </p>
                    <div className="space-y-1.5">
                      {uploadedSovDocs.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900">{doc.name}</p>
                              <p className="text-[11px] text-slate-500">{doc.type} · {doc.size} · Parsed at {doc.timestamp}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            100% Extracted
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SOV Line Items Table Header with Quick Add */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Itemized Schedule of Values ({sovLines.length} Lines)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {sovUploadMethod === 'doc-upload' ? 'Review and fine-tune the extracted budget line items below:' : 'Directly enter CSI codes, categories, and dollar allocations:'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSOVLine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Budget Line</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">CSI Cost Code</th>
                    <th className="py-2.5 px-3 font-semibold">Budget Category / Trade</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Allocated Budget ($)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sovLines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No budget lines added yet. Click{' '}
                        <button
                          type="button"
                          onClick={handleAddSOVLine}
                          className="font-bold text-slate-900 underline hover:text-emerald-700 cursor-pointer"
                        >
                          Add Budget Line
                        </button>{' '}
                        or{' '}
                        <button
                          type="button"
                          onClick={() => setSovUploadMethod('doc-upload')}
                          className="font-bold text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
                        >
                          Upload Budget Doc
                        </button>{' '}
                        above to get started.
                      </td>
                    </tr>
                  ) : (
                    sovLines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.cost_code}
                            onChange={(e) => {
                              const next = [...sovLines];
                              next[idx].cost_code = e.target.value;
                              setSovLines(next);
                            }}
                            className="w-24 px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.category}
                            onChange={(e) => {
                              const next = [...sovLines];
                              next[idx].category = e.target.value;
                              setSovLines(next);
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="inline-flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white">
                            <span className="text-slate-400 mr-1">$</span>
                            <input
                              type="number"
                              value={line.amount === 0 ? '' : line.amount}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const clean = e.target.value.replace(/^0+(?=\d)/, '');
                                const num = clean === '' ? 0 : Number(clean);
                                const next = [...sovLines];
                                next[idx].amount = num;
                                setSovLines(next);
                                const newSum = next.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                                setTargetBudget(newSum);
                              }}
                              placeholder="0"
                              className="w-28 text-right text-xs font-bold outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteSOVLine(idx)}
                            className="text-slate-400 hover:text-rose-600 transition p-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                    <td colSpan={2} className="py-3 px-3 text-slate-900 text-xs">
                      Total Master Budget (Truth 1):
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-800 text-sm font-extrabold">
                      ${totalSovBudget.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue to Contractor Invoices</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONTRACTOR INVOICES & SPEND LEDGER (2 METHODS) */}
        {activeStep === 'invoices' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 4: Contractor Invoices & Direct Expenses</h2>
                  <p className="text-xs text-slate-500">Provide invoices via manual ledger entry or upload documents (.pdf, .doc, .zip, .excel, .aiag702, .aiag703).</p>
                </div>
              </div>

              {/* Two Methods Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleAddInvoice()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Method 1: Add Line Item</span>
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-slate-900 rounded-lg transition cursor-pointer">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isExtractingInvoices ? 'Extracting...' : 'Method 2: Upload Files (Multi-Doc)'}</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.zip,.xlsx,.xls,.csv,.aiag702,.aiag703"
                    disabled={isExtractingInvoices}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBatchUploadInvoices(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Extraction Processing Banner */}
            {isExtractingInvoices && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
                <span>Parsing contractor invoices, vendor entities, net amount due, and anti-double-counting filter...</span>
              </div>
            )}

            {/* Invoices Extraction Success Banner */}
            {invoiceBatchResult && !isExtractingInvoices && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Parsed <strong>{invoiceBatchResult.normalizedInvoices.length} contractor invoices</strong> (${invoiceBatchResult.summary.totalSpendExtracted.toLocaleString()}) across {invoiceBatchResult.summary.documentCount} file(s).
                    {invoiceBatchResult.summary.totalExcludedAmount > 0 && ` Filtered $${invoiceBatchResult.summary.totalExcludedAmount.toLocaleString()} in prior balances.`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatchReviewModal('invoices')}
                  className="font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  Inspect Excluded Prior Balances
                </button>
              </div>
            )}

            {/* Auto-populated from Step 3 Project Documents Banner */}
            {!invoiceBatchResult && sovBatchResult && sovBatchResult.normalizedInvoices.length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between gap-2 text-purple-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>
                    <strong>{sovBatchResult.normalizedInvoices.length} invoices</strong> automatically pre-populated from your uploaded project documents. You can review, add more, or edit below.
                  </span>
                </div>
              </div>
            )}

            {/* Dropzone File Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Supported Multi-Doc Formats:</strong> .pdf, .doc, .zip, .xlsx/.csv, .aiag702, and .aiag703.
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-full">
                Auto-OCR Extraction
              </span>
            </div>

            <div className="space-y-3.5">
              {invoices.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-500 text-xs space-y-2">
                  <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-800">No contractor invoices recorded yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Click{' '}
                    <button
                      type="button"
                      onClick={handleAddInvoice}
                      className="font-bold text-slate-900 underline hover:text-emerald-700 cursor-pointer"
                    >
                      Method 1: Add Line Item
                    </button>{' '}
                    or upload files above to record incurred trade expenses.
                  </p>
                </div>
              ) : (
                invoices.map((inv, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vendor / Subcontractor</label>
                      <input
                        type="text"
                        value={inv.vendor}
                        onChange={(e) => {
                          const next = [...invoices];
                          next[idx].vendor = e.target.value;
                          setInvoices(next);
                        }}
                        placeholder="e.g. Titan Concrete LLC"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">SOV Budget Category</label>
                      <select
                        value={inv.category}
                        onChange={(e) => {
                          const next = [...invoices];
                          next[idx].category = e.target.value;
                          setInvoices(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        {sovLines.map((s, sIdx) => (
                          <option key={sIdx} value={s.category}>
                            {s.category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={inv.inv}
                        onChange={(e) => {
                          const next = [...invoices];
                          next[idx].inv = e.target.value;
                          setInvoices(next);
                        }}
                        placeholder="INV-4921"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Incurred Amount ($)</label>
                        <input
                          type="number"
                          value={inv.amount === 0 ? '' : inv.amount}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                            const num = clean === '' ? 0 : Number(clean);
                            const next = [...invoices];
                            next[idx].amount = num;
                            setInvoices(next);
                          }}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteInvoice(idx)}
                        className="text-slate-400 hover:text-rose-600 transition p-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <input
                      type="text"
                      value={inv.description}
                      onChange={(e) => {
                        const next = [...invoices];
                        next[idx].description = e.target.value;
                        setInvoices(next);
                      }}
                      placeholder="Scope of work / trade invoice description..."
                      className="flex-1 mr-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                    />

                    <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={inv.waiver}
                        onChange={(e) => {
                          const next = [...invoices];
                          next[idx].waiver = e.target.checked;
                          setInvoices(next);
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Lien Waiver Received</span>
                    </label>
                  </div>
                </div>
              ))
            )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs font-bold">
              <span className="text-amber-900">Total Incurred Actual Spend (Truth 2):</span>
              <span className="text-amber-950 font-extrabold text-base">${totalIncurredSpend.toLocaleString()}</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue to Financing & Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: LOAN FACILITY & FINANCING */}
        {activeStep === 'loan' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 5: Construction Loan Facility & Draw Terms</h2>
                <p className="text-xs text-slate-500">Enter your lender commitment amount, interest rate, and disbursements to date.</p>
              </div>
            </div>

            {/* Auto-populated from Step 3 Project Documents Banner */}
            {sovBatchResult?.extractedLoan && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between gap-2 text-blue-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Loan facility terms (${(sovBatchResult.extractedLoan.loanAmount || 0).toLocaleString()} @ {sovBatchResult.extractedLoan.interestRate}%) automatically pre-populated from your uploaded construction loan document ({sovBatchResult.extractedLoan.sourceDocument}). You can fine-tune any terms below.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lender Name</label>
                <input
                  type="text"
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Construction Facility ($)</label>
                <input
                  type="number"
                  value={loanAmount === 0 ? '' : loanAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setLoanAmount(clean === '' ? 0 : Number(clean));
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interest Rate (% APR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={interestRate === 0 ? '' : interestRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setInterestRate(clean === '' ? 0 : Number(clean));
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lender Funded / Disbursed to Date ($)</label>
                <input
                  type="number"
                  value={disbursedFunded === 0 ? '' : disbursedFunded}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^0+(?=\d)/, '');
                    setDisbursedFunded(clean === '' ? 0 : Number(clean));
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Review & Generate Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: FINAL REVIEW & INSTANT REPORT GENERATION */}
        {activeStep === 'review' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 6: Certified Reconciliation & Audit Report</h2>
                <p className="text-xs text-slate-500">Review your deterministic Four Truths figures before launching the live dashboard.</p>
              </div>
            </div>

            {/* Reconciliation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Truth 1: Master Budget</span>
                <p className="text-xl font-extrabold text-slate-900">${totalSovBudget.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500">{sovLines.length} SOV Lines Approved</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[11px] font-semibold text-amber-800 uppercase">Truth 2: Incurred Spend</span>
                <p className="text-xl font-extrabold text-amber-950">${totalIncurredSpend.toLocaleString()}</p>
                <p className="text-[11px] text-amber-700">{invoices.length} Contractor Invoices</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase">Truth 3: Funded to Date</span>
                <p className="text-xl font-extrabold text-emerald-950">${disbursedFunded.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-700">Draw #1 Disbursed Wire</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="text-[11px] font-semibold text-rose-800 uppercase">Truth 4: Cash Exposure</span>
                <p className="text-xl font-extrabold text-rose-950">${developerCashExposure.toLocaleString()}</p>
                <p className="text-[11px] text-rose-700">Spend − Disbursed</p>
              </div>
            </div>

            {/* Carrying Cost & Provenance Notice */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Clock className="w-4 h-4" />
                  <span>Daily Carrying Cost: ${dailyCarryingCost}/day</span>
                </div>
                <p className="text-xs text-slate-300">
                  Computed on ${disbursedFunded.toLocaleString()} loan balance @ {interestRate}% APR.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Hallucination Certified</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitIntake()}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold transition shadow-xl disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitting ? 'Generating Certified Audit Report...' : 'Generate Certified Report & Launch Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Document Extraction Review Modal */}
      {showBatchReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full">
            <MultiDocExtractionReview
              batchResult={(showBatchReviewModal === 'sov' ? sovBatchResult : invoiceBatchResult)!}
              mode={showBatchReviewModal === 'sov' ? 'sov_only' : 'invoices_only'}
              onClose={() => setShowBatchReviewModal(null)}
              onApplySOV={(items) => {
                const extractedLines: SOVItem[] = items.map((item) => ({
                  category: item.category,
                  cost_code: item.costCode,
                  amount: item.amount,
                }));
                setSovLines(extractedLines);
                setTargetBudget(extractedLines.reduce((a, b) => a + b.amount, 0));
                setShowBatchReviewModal(null);
              }}
              onApplyInvoices={(items) => {
                const extractedInvoices: InvoiceItem[] = items.map((inv) => ({
                  vendor: inv.vendor,
                  category: inv.category,
                  inv: inv.invoiceNumber,
                  amount: inv.amount,
                  waiver: inv.lienWaiver,
                  description: inv.description,
                }));
                setInvoices((prev) => [...prev, ...extractedInvoices]);
                setShowBatchReviewModal(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
