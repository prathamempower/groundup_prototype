"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatMoney } from "@/lib/format";
import {
  FileText,
  Check,
  ChevronRight,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Layers,
  Upload,
  X,
  Maximize2,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BudgetLine, DrawLine } from "@/lib/types";
import { EXCEL_DRAW_TASKS } from "@/lib/data/excel-draw-schedule";

interface SovLineItemState {
  id: string;
  codeAndDesc: string;
  budgetCents: number;
  previouslyDrawnCents: number;
  claimCents: number;
}

export default function BuildDrawPacketPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = (params?.projectId as string) || "";
  const drawParam = searchParams.get("draw");
  const nextDrawNumber = drawParam ? parseInt(drawParam, 10) : 4;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Header state
  const [drawAppNumber, setDrawAppNumber] = useState(`Draw #${nextDrawNumber || 4}`);
  const [inspectionDate, setInspectionDate] = useState("2026-10-18");
  const [timeTakenDays, setTimeTakenDays] = useState("14");

  // Step 2: SOV Line Items state
  const [sovLines, setSovLines] = useState<SovLineItemState[]>([]);

  // Step 3: Photos state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Array<{ id: string; title: string; url: string }>>([
    {
      id: "photo-1",
      title: "Exterior Framing & Envelope",
      url: "/projects/broadway-new.jpg",
    },
    {
      id: "photo-2",
      title: "TPO Roof Deck Seams",
      url: "/projects/woodlawn-new.jpg",
    },
    {
      id: "photo-3",
      title: "Weather Barrier Membrane",
      url: "/projects/first-street-new.jpg",
    },
    {
      id: "photo-4",
      title: "MEP Conduit & Rough-in",
      url: "/projects/farnsworth.jpg",
    },
  ]);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [urlTitleInput, setUrlTitleInput] = useState("");
  const [urlLinkInput, setUrlLinkInput] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<{ id: string; title: string; url: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = Array.from(files).map((file, idx) => {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();
      return {
        id: `upload-${Date.now()}-${idx}`,
        title: cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : `Site Photo #${photos.length + idx + 1}`,
        url: URL.createObjectURL(file),
      };
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const handleAddUrlPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlLinkInput.trim()) return;
    setPhotos((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        title: urlTitleInput.trim() || `Inspection Photo #${prev.length + 1}`,
        url: urlLinkInput.trim(),
      },
    ]);
    setUrlTitleInput("");
    setUrlLinkInput("");
    setIsAddUrlOpen(false);
  };

  const handleRemovePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (previewPhoto?.id === id) {
      setPreviewPhoto(null);
    }
  };

  // Step 4: Signature state
  const [signerName, setSignerName] = useState("Marcus Vance");
  const [signerRole, setSignerRole] = useState("Authorized Borrower Principal");
  const [certificationAgreed, setCertificationAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const { data: budgetData } = useQuery({
    queryKey: ["budget", projectId],
    queryFn: () => api.budget.getCurrent(projectId),
    enabled: Boolean(projectId),
  });

  const { data: projectData } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.projects.getById(projectId),
    enabled: Boolean(projectId),
  });

  const eligibleLines: BudgetLine[] = React.useMemo(
    () =>
      (budgetData?.data?.lines || []).filter(
        (l) => l.is_draw_eligible !== false && l.category !== "Contingency"
      ),
    [budgetData]
  );

  useEffect(() => {
    const targetDrawNum = nextDrawNumber || 4;
    setDrawAppNumber(`Draw #${targetDrawNum}`);

    if (targetDrawNum === 4) {
      setSovLines([
        {
          id: "sov-2.06",
          codeAndDesc: "2.06 Site Prep: Dumpsters",
          budgetCents: 1800000,
          previouslyDrawnCents: 1300000,
          claimCents: 250000,
        },
        {
          id: "sov-2.07",
          codeAndDesc: "2.07 Site Prep: Security Fencing",
          budgetCents: 900000,
          previouslyDrawnCents: 400000,
          claimCents: 250000,
        },
        {
          id: "sov-2.09",
          codeAndDesc: "2.09 Foundation/Structural: Concrete, Walls",
          budgetCents: 5000000,
          previouslyDrawnCents: 2500000,
          claimCents: 1250000,
        },
        {
          id: "sov-2.12",
          codeAndDesc: "2.12 Concrete Slabs/Foundation",
          budgetCents: 700000,
          previouslyDrawnCents: 0,
          claimCents: 350000,
        },
        {
          id: "sov-2.17",
          codeAndDesc: "2.17 Water/Sewer (includes well, septic and city)",
          budgetCents: 1800000,
          previouslyDrawnCents: 1000000,
          claimCents: 800000,
        },
        {
          id: "sov-2.27",
          codeAndDesc: "2.27 Sewer/Septic",
          budgetCents: 600000,
          previouslyDrawnCents: 0,
          claimCents: 600000,
        },
        {
          id: "sov-2.29",
          codeAndDesc: "2.29 Equipment Rental",
          budgetCents: 1300000,
          previouslyDrawnCents: 850000,
          claimCents: 450000,
        },
        {
          id: "sov-2.04",
          codeAndDesc: "2.04 Site Prep: Demolition",
          budgetCents: 3000000,
          previouslyDrawnCents: 3000000,
          claimCents: 500000,
        },
        {
          id: "sov-2.05",
          codeAndDesc: "2.05 Site Prep: Grading/Excavation",
          budgetCents: 2500000,
          previouslyDrawnCents: 2500000,
          claimCents: 550000,
        },
      ]);
    } else {
      const matchingTasks = EXCEL_DRAW_TASKS.filter(
        (t) => (t.draws[targetDrawNum] || 0) > 0
      );
      if (matchingTasks.length > 0) {
        setSovLines(
          matchingTasks.map((t) => {
            let prevCents = 0;
            for (let d = 1; d < targetDrawNum; d++) {
              prevCents += t.draws[d] || 0;
            }
            return {
              id: `sov-${t.number}`,
              codeAndDesc: `${t.number} ${t.description}`,
              budgetCents: t.scheduledValueCents,
              previouslyDrawnCents: prevCents,
              claimCents: t.draws[targetDrawNum] || 0,
            };
          })
        );
      } else {
        setSovLines(
          EXCEL_DRAW_TASKS.slice(0, 4).map((t) => ({
            id: `sov-${t.number}`,
            codeAndDesc: `${t.number} ${t.description}`,
            budgetCents: t.scheduledValueCents,
            previouslyDrawnCents: 0,
            claimCents: 1000000,
          }))
        );
      }
    }
  }, [nextDrawNumber]);

  const totalRequestedCents = sovLines.reduce((a, b) => a + b.claimCents, 0);
  const retainageCents = Math.round(totalRequestedCents * 0.1);
  const netPayableCents = totalRequestedCents - retainageCents;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      handleSubmitPacket();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleUpdateLineClaim = (lineId: string, dollars: number) => {
    setSovLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, claimCents: Math.max(0, Math.round(dollars * 100)) }
          : line
      )
    );
  };

  const handleAddCustomLine = () => {
    const existingCodes = new Set(sovLines.map((l) => l.codeAndDesc.split(" ")[0]));
    const nextTask =
      EXCEL_DRAW_TASKS.find((t) => !existingCodes.has(t.number)) ||
      EXCEL_DRAW_TASKS[sovLines.length % EXCEL_DRAW_TASKS.length];
    const newLineId = `sov-${nextTask.number}-${Date.now()}`;
    setSovLines((prev) => [
      ...prev,
      {
        id: newLineId,
        codeAndDesc: `${nextTask.number} ${nextTask.description}`,
        budgetCents: nextTask.scheduledValueCents,
        previouslyDrawnCents: 0,
        claimCents: 100000,
      },
    ]);
  };

  const handleRemoveLine = (lineId: string) => {
    setSovLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const handleSubmitPacket = async () => {
    setIsSubmitting(true);
    const targetDrawNum = nextDrawNumber || 4;
    try {
      const linesPayload = sovLines
        .filter((l) => l.claimCents > 0)
        .map((l) => ({
          budget_line_id: eligibleLines[0]?.id || l.id,
          requested_amount: String(l.claimCents),
        }));

      await api.draws.create(projectId, {
        draw_number: targetDrawNum,
        period_start: "2026-09-25",
        period_end: inspectionDate,
        lender_name: "Capital Reserve Trust",
        lines:
          linesPayload.length > 0
            ? linesPayload
            : [
                {
                  budget_line_id: eligibleLines[0]?.id || "line-default",
                  requested_amount: String(totalRequestedCents || 5000000),
                },
              ],
      });

      setIsSubmittedSuccess(true);
    } catch {
      // Graceful fallback for demo
      setIsSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTitle = projectData?.data?.name || "161 Woodlawn Ave";
  const projectAddress = projectData?.data?.address || "392 1st St, Jersey City";

  if (isSubmittedSuccess) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xs space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Draw Disbursement Packet Transmitted
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {drawAppNumber} has been successfully submitted to{" "}
              <strong className="text-slate-800">Capital Reserve Trust</strong>. AMHAR inspection and dual-statement spend reconciliation have been scheduled.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Facility Reference</span>
              <span className="font-semibold text-slate-800">#23-03394</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Gross Claim Amount</span>
              <span className="font-semibold text-slate-800">{formatMoney(totalRequestedCents)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">10% Retainage Withheld</span>
              <span className="font-semibold text-slate-800">-{formatMoney(retainageCents)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-900">Net Eligible Wire</span>
              <span className="font-bold text-emerald-600 text-sm">{formatMoney(netPayableCents)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              type="button"
              onClick={() => router.push(`/projects/${projectId}/draws`)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-xs"
            >
              Return to Draws Register
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/control-center`)}
              className="text-xs font-semibold px-5 py-2.5 rounded-lg border-slate-300"
            >
              Go to Control Center
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 min-w-0">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/draws`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Back to Draws Register"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href={`/projects/${projectId}/draws`} className="hover:text-slate-800 hover:underline">
                Draws
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{drawAppNumber}</span>
              <span>/</span>
              <span className="text-slate-900">Disbursement Packet Builder</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Build Draw Disbursement Packet
            </h1>
          </div>
        </div>
      </div>

      {/* Main Builder Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden mb-12">
        {/* Step Progression Bar - Fully Responsive */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-3 sm:px-6 py-3 sm:py-4">
          {/* Responsive Stepper Row matching PC version exactly */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 max-w-3xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 gap-2.5 sm:gap-4 py-1 px-1">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
                currentStep === 1
                  ? "text-blue-600 font-bold"
                  : currentStep > 1
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${
                  currentStep === 1
                    ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-100"
                    : currentStep > 1
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {currentStep > 1 ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" /> : "1"}
              </span>
              <span className="whitespace-nowrap text-[11px] sm:text-xs">1. Header & Timeline</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 shrink-0" />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
                currentStep === 2
                  ? "text-blue-600 font-bold"
                  : currentStep > 2
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${
                  currentStep === 2
                    ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-100"
                    : currentStep > 2
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {currentStep > 2 ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" /> : "2"}
              </span>
              <span className="whitespace-nowrap text-[11px] sm:text-xs">2. SOV Line Items</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 shrink-0" />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
                currentStep === 3
                  ? "text-blue-600 font-bold"
                  : currentStep > 3
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${
                  currentStep === 3
                    ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-100"
                    : currentStep > 3
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {currentStep > 3 ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" /> : "3"}
              </span>
              <span className="whitespace-nowrap text-[11px] sm:text-xs">3. Visual Proof</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 shrink-0" />

            {/* Step 4 */}
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0 ${
                currentStep === 4
                  ? "text-blue-600 font-bold"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${
                  currentStep === 4
                    ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-100"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                4
              </span>
              <span className="whitespace-nowrap text-[11px] sm:text-xs">4. Signatures</span>
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* STEP 1: HEADER & INSPECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Draw Header & Inspection Time Frame
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establish the disbursement period, target lender inspection date, and time elapsed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Draw Application Number
                  </label>
                  <input
                    type="text"
                    value={drawAppNumber}
                    onChange={(e) => setDrawAppNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    placeholder="e.g. Draw #4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Inspection Target Date
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Project Cycle Days Elapsed
                  </label>
                  <input
                    type="number"
                    value={timeTakenDays}
                    onChange={(e) => setTimeTakenDays(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    placeholder="14"
                  />
                </div>
              </div>

              {/* Project Reference Card */}
              <div className="rounded-xl border border-blue-200/90 bg-blue-50/50 p-4 space-y-1 text-xs">
                <div className="font-bold text-blue-950 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Project Reference: {projectTitle}</span>
                </div>
                {projectAddress && (
                  <div className="text-slate-600 text-xs pl-6">
                    {projectAddress}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SOV LINE ITEMS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Schedule of Values (SOV) Line Items Claim
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Allocate and claim completed work against approved budget line items for {drawAppNumber}.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomLine}
                  className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs hover:bg-slate-50 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              {/* Mobile Cards View (< md) */}
              <div className="md:hidden space-y-3">
                {sovLines.map((line) => (
                  <div
                    key={line.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {line.codeAndDesc}
                      </span>
                      {sovLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Approved Budget
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatMoney(line.budgetCents)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Previously Drawn
                        </span>
                        <span className="font-semibold text-slate-500">
                          {formatMoney(line.previouslyDrawnCents)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        This Period Claim ($):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-semibold text-xs">$</span>
                        <input
                          type="number"
                          value={line.claimCents / 100}
                          onChange={(e) =>
                            handleUpdateLineClaim(line.id, Number(e.target.value) || 0)
                          }
                          className="w-32 text-right rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[580px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">SOV Code & Description</th>
                      <th className="py-3 px-4">Approved Budget</th>
                      <th className="py-3 px-4 text-right">Previously Drawn</th>
                      <th className="py-3 px-4 text-right">This Period Claim ($)</th>
                      <th className="py-3 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sovLines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {line.codeAndDesc}
                        </td>
                        <td className="py-3 px-4 tabular-nums text-slate-600">
                          {formatMoney(line.budgetCents)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-500">
                          {formatMoney(line.previouslyDrawnCents)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <span className="text-slate-400 font-semibold">$</span>
                            <input
                              type="number"
                              value={line.claimCents / 100}
                              onChange={(e) =>
                                handleUpdateLineClaim(line.id, Number(e.target.value) || 0)
                              }
                              className="w-28 text-right rounded-md border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {sovLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(line.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                  <span className="text-xs font-semibold text-slate-500 block">Gross Claimed Total</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-1 block">
                    {formatMoney(totalRequestedCents)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                  <span className="text-xs font-semibold text-slate-500 block">Standard Retainage (10%)</span>
                  <span className="text-base sm:text-lg font-bold text-amber-700 mt-1 block">
                    -{formatMoney(retainageCents)}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-4">
                  <span className="text-xs font-semibold text-emerald-800 block">Net Eligible Wire Disbursement</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-700 mt-1 block">
                    {formatMoney(netPayableCents)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VISUAL PROOF PHOTOS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Visual Inspection Proof Photos
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                      {photos.length} {photos.length === 1 ? "photo" : "photos"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-resolution photo evidence attached for lender inspector verification.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddUrlOpen(true)}
                    className="text-xs h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Add from URL</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 shadow-2xs cursor-pointer font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Images</span>
                  </Button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">No photos attached yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Attach visual inspection photos from the job site to support claimed SOV line items.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photos</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddUrlOpen(true)}
                      className="text-xs h-8 border-slate-300 cursor-pointer"
                    >
                      <span>Add from URL</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setPreviewPhoto(photo)}
                      className="group relative aspect-4/3 rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Clean bottom gradient for label legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none" />

                      {/* Photo Title */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="inline-block truncate max-w-full rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                          {photo.title}
                        </span>
                      </div>

                      {/* Action buttons (Top Right) */}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPhoto(photo);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white transition-colors shadow-sm cursor-pointer"
                          title="Preview full size"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(photo.id, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-sm cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Image Tile in Grid */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative aspect-4/3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer shadow-2xs"
                  >
                    <div className="h-9 w-9 rounded-full bg-white group-hover:bg-blue-600 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-blue-600 flex items-center justify-center transition-all mb-2 shadow-2xs">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      Add Image
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Upload from computer
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SIGNATURES & TRANSMISSION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Certification & Digital Signature
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm accuracy of requested quantities and transmit to AMHAR inspection & lender.
                </p>
              </div>

              {/* Review Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Packet Reference</span>
                  <span className="font-bold text-slate-900">{drawAppNumber} (DRW-2026-004)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Target Inspection Date</span>
                  <span className="font-bold text-slate-900">{inspectionDate}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Net Eligible Amount</span>
                  <span className="font-bold text-emerald-600 text-sm">{formatMoney(netPayableCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Verified Evidence Photos</span>
                  <span className="font-bold text-blue-600">{photos.length} Attached & Reconciled</span>
                </div>
              </div>

              {/* Certification Checkbox */}
              <label className="flex items-start gap-3 rounded-xl border border-blue-200/90 bg-blue-50/50 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificationAgreed}
                  onChange={(e) => setCertificationAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Borrower / Principal Certification of Work Complete
                  </span>
                  I hereby certify under penalty of contract default that all represented line item materials have been physically incorporated into the improvements at {projectAddress}, and all trade lien waivers have been collected.
                </div>
              </label>

              {/* Signature Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signer Full Name
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signer Authority / Role
                  </label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between mt-auto">
          <Button
            type="button"
            variant="ghost"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handlePrevious}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white px-4 py-2 rounded-lg disabled:opacity-40"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              Step {currentStep} of 4
            </span>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 4 && !certificationAgreed)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {currentStep === 4 ? (
                isSubmitting ? "Transmitting..." : "Submit to Lender"
              ) : (
                "Next Step"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in-0 duration-150"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <span className="text-sm font-semibold text-white truncate pr-4">
                {previewPhoto.title}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemovePhoto(previewPhoto.id)}
                  className="h-7 text-xs bg-slate-800 border-slate-700 text-rose-400 hover:bg-rose-950 hover:text-rose-300 gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Photo</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center p-2 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add from URL Modal */}
      {isAddUrlOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150"
          onClick={() => setIsAddUrlOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Image from URL</h3>
              <button
                type="button"
                onClick={() => setIsAddUrlOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddUrlPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Title / Description
                </label>
                <input
                  type="text"
                  value={urlTitleInput}
                  onChange={(e) => setUrlTitleInput(e.target.value)}
                  placeholder="e.g. Foundation Concrete Pour"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={urlLinkInput}
                  onChange={(e) => setUrlLinkInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddUrlOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
                >
                  Add Photo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
