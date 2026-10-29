"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatMoney } from "@/lib/format";
import {
  FileText,
  Check,
  ChevronRight,
  ChevronLeft,
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
  Landmark,
  Pencil,
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
  const [periodStart, setPeriodStart] = useState("2026-09-25");
  const [inspectionDate, setInspectionDate] = useState("2026-10-18");

  // Step 2: SOV Line Items state
  const [sovLines, setSovLines] = useState<SovLineItemState[]>([]);

  // Step 3: Photos state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Array<{ id: string; title: string; url: string }>>([
    {
      id: "photo-0",
      title: "Site Excavation",
      url: "/inspection_images/0.jpg",
    },
    {
      id: "photo-1",
      title: "Trench Shoring",
      url: "/inspection_images/1.jpg",
    },
    {
      id: "photo-2",
      title: "Subgrade Liner",
      url: "/inspection_images/2.jpg",
    },
    {
      id: "photo-3",
      title: "Marine Piling",
      url: "/inspection_images/3.jpg",
    },
    {
      id: "photo-4",
      title: "Foundation Drilling",
      url: "/inspection_images/4.jpg",
    },
    {
      id: "photo-5",
      title: "Cofferdam Assembly",
      url: "/inspection_images/5.jpg",
    },
    {
      id: "photo-6",
      title: "Sheet Pile Wall",
      url: "/inspection_images/6.jpg",
    },
    {
      id: "photo-7",
      title: "Rebar & Concrete Pour",
      url: "/inspection_images/7.jpg",
    },
  ]);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [urlTitleInput, setUrlTitleInput] = useState("");
  const [urlLinkInput, setUrlLinkInput] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<{ id: string; title: string; url: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [pendingUpload, setPendingUpload] = useState<{ url: string; defaultTitle: string } | null>(null);
  const [uploadTitleInput, setUploadTitleInput] = useState("");

  const currentPhotoIndex = previewPhoto ? photos.findIndex((p) => p.id === previewPhoto.id) : -1;

  const handlePrevPhoto = () => {
    if (photos.length <= 1 || currentPhotoIndex === -1) return;
    const prevIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    setPreviewPhoto(photos[prevIndex]);
  };

  const handleNextPhoto = () => {
    if (photos.length <= 1 || currentPhotoIndex === -1) return;
    const nextIndex = (currentPhotoIndex + 1) % photos.length;
    setPreviewPhoto(photos[nextIndex]);
  };

  useEffect(() => {
    if (!previewPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewPhoto(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (photos.length > 1 && currentPhotoIndex !== -1) {
          const prevIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
          setPreviewPhoto(photos[prevIndex]);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (photos.length > 1 && currentPhotoIndex !== -1) {
          const nextIndex = (currentPhotoIndex + 1) % photos.length;
          setPreviewPhoto(photos[nextIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewPhoto, currentPhotoIndex, photos]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim();

    const titleCandidate = cleanName
      ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
      : `Inspection Photo #${photos.length + 1}`;

    const objectUrl = URL.createObjectURL(file);
    setPendingUpload({ url: objectUrl, defaultTitle: titleCandidate });
    setUploadTitleInput(titleCandidate);
    e.target.value = "";
  };

  const handleConfirmUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUpload) return;

    setPhotos((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}`,
        title: uploadTitleInput.trim() || pendingUpload.defaultTitle,
        url: pendingUpload.url,
      },
    ]);
    setPendingUpload(null);
    setUploadTitleInput("");
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
    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (previewPhoto?.id === id) {
        if (remaining.length > 0) {
          const removedIdx = prev.findIndex((p) => p.id === id);
          const nextIdx = Math.min(removedIdx, remaining.length - 1);
          setPreviewPhoto(remaining[nextIdx]);
        } else {
          setPreviewPhoto(null);
        }
      }
      return remaining;
    });
  };

  // Step 4: Submission state
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
  const netPayableCents = totalRequestedCents;

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
        period_start: periodStart,
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
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-xs space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Draw Packet Submitted
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {drawAppNumber} has been submitted to{" "}
              <span className="font-semibold text-slate-800">Capital Reserve Trust</span> for review and inspection approval.
            </p>
          </div>

          {/* Clean Receipt Summary */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5 text-left text-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Application</span>
              <span className="font-semibold text-slate-900">{drawAppNumber}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Lender</span>
              <span className="font-semibold text-slate-900">Capital Reserve Trust</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Target Inspection</span>
              <span className="font-semibold text-slate-900">{inspectionDate}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Inspection Proof</span>
              <span className="font-semibold text-slate-900">{photos.length} photos attached</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-700 font-semibold">Total Claim Amount</span>
              <span className="font-mono font-bold text-emerald-600 text-sm tabular-nums">
                {formatMoney(totalRequestedCents)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={() => router.push(`/projects/${projectId}/draws`)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-xs cursor-pointer"
            >
              View in Draws Register
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/control-center`)}
              className="w-full sm:w-auto text-xs font-semibold px-5 py-2.5 rounded-lg border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer"
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
      {/* Top Breadcrumb & Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/draws`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Back to Draws Register"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link href={`/projects/${projectId}/draws`} className="hover:text-slate-800 hover:underline">
                Draws Register
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{drawAppNumber}</span>
              <span>/</span>
              <span className="text-slate-900 font-medium">Packet Builder</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {drawAppNumber} Packet
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Builder Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden mb-12">
        {/* Step Progression Bar - Fully Responsive, Clean Numbers */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 max-w-3xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 gap-2 sm:gap-4 py-1 px-1">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${currentStep === 1
                ? "text-slate-900 font-bold"
                : currentStep > 1
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 1
                  ? "bg-slate-900 text-white shadow-2xs"
                  : currentStep > 1
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {currentStep > 1 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "01"}
              </span>
              <span className="whitespace-nowrap text-xs">Header & Facility</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${currentStep === 2
                ? "text-slate-900 font-bold"
                : currentStep > 2
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 2
                  ? "bg-slate-900 text-white shadow-2xs"
                  : currentStep > 2
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {currentStep > 2 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "02"}
              </span>
              <span className="whitespace-nowrap text-xs">Line Items (SOV)</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${currentStep === 3
                ? "text-slate-900 font-bold"
                : currentStep > 3
                  ? "text-emerald-700 font-medium"
                  : "text-slate-400"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 3
                  ? "bg-slate-900 text-white shadow-2xs"
                  : currentStep > 3
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {currentStep > 3 ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "03"}
              </span>
              <span className="whitespace-nowrap text-xs">Inspection Proof</span>
            </button>

            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

            {/* Step 4 */}
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${currentStep === 4
                ? "text-slate-900 font-bold"
                : "text-slate-400"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${currentStep === 4
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-200 text-slate-600"
                  }`}
              >
                04
              </span>
              <span className="whitespace-nowrap text-xs">Review & Submit</span>
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* STEP 1: HEADER & FACILITY SPECIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Draw Details & Facility Terms
                </h2>
              </div>

              {/* Primary Form Parameters (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Draw Application Number
                  </label>
                  <input
                    type="text"
                    value={drawAppNumber}
                    onChange={(e) => setDrawAppNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="e.g. Draw #4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Draw Cycle Start
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Lender Inspection
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 shadow-2xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SOV LINE ITEMS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Schedule of Values (SOV) Claims
                  </h2>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomLine}
                  className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs hover:bg-slate-50 hover:text-slate-900 shrink-0 self-start sm:self-auto cursor-pointer"
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
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                          Approved Budget
                        </span>
                        <span className="font-mono font-semibold text-slate-700 tabular-nums">
                          {formatMoney(line.budgetCents)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                          Previously Drawn
                        </span>
                        <span className="font-mono font-semibold text-slate-500 tabular-nums">
                          {formatMoney(line.previouslyDrawnCents)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        Claim Amount ($):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-semibold text-xs">$</span>
                        <input
                          type="number"
                          value={line.claimCents / 100}
                          onChange={(e) =>
                            handleUpdateLineClaim(line.id, Number(e.target.value) || 0)
                          }
                          className="w-32 text-right rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 tabular-nums focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[580px]">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Line Item</th>
                      <th className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-slate-500">Approved Budget</th>
                      <th className="py-3 px-4 text-right font-bold text-[11px] uppercase tracking-wider text-slate-500">Previously Drawn</th>
                      <th className="py-3 px-4 text-right font-bold text-[11px] uppercase tracking-wider text-slate-500">Claim Amount ($)</th>
                      <th className="py-3 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sovLines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {line.codeAndDesc}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                          {formatMoney(line.budgetCents)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
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
                              className="w-28 text-right rounded-md border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold text-slate-900 tabular-nums focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {sovLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(line.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
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

              {/* Summary Totals Bar */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Total Claim
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {formatMoney(totalRequestedCents)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                      Net Payable to Borrower
                    </span>
                    <span className="text-xl font-mono font-bold text-emerald-600 tabular-nums">
                      {formatMoney(netPayableCents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VISUAL PROOF PHOTOS */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Visual Inspection Proof
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </span>
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
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 gap-1.5 shadow-2xs cursor-pointer font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload Photos</span>
                  </Button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">No photos attached yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Attach site inspection photos from the job site to support line item claims.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 gap-1.5 cursor-pointer font-semibold shadow-2xs"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setPreviewPhoto(photo)}
                      className="group rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Top Action buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPhoto(photo);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/80 hover:bg-slate-900 text-white transition-colors shadow-sm cursor-pointer"
                            title="Preview full size"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemovePhoto(photo.id, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-sm cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Photo Caption */}
                      <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center bg-white min-h-[42px]">
                        <span className="text-xs font-semibold text-slate-800 leading-snug truncate" title={photo.title}>
                          {photo.title}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Add Image Tile in Grid */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-800 bg-slate-50/50 hover:bg-slate-100/60 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[160px]"
                  >
                    <div className="h-9 w-9 rounded-full bg-white group-hover:bg-slate-900 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-slate-900 flex items-center justify-center transition-all mb-2 shadow-2xs">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                      Add Site Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      JPG, PNG up to 15MB
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PACKET REVIEW & TRANSMISSION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="pb-2 border-b border-slate-200/80">
                <h2 className="text-base font-bold text-slate-900">
                  Review Draw Packet
                </h2>
              </div>

              {/* Financial Key Figures Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                  <div className="text-xs font-medium text-slate-500">
                    Total Claim
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {formatMoney(totalRequestedCents)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                  <div className="text-xs font-medium text-slate-500">
                    Net Payable to Borrower
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                    {formatMoney(netPayableCents)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                  <div className="text-xs font-medium text-slate-500">
                    Site Photos
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {photos.length}
                  </div>
                </div>
              </div>

              {/* SECTION 1: Header & Facility */}
              <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="text-xs font-bold text-slate-900">
                    Header & Facility
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[11px]">Draw Application</div>
                    <div className="font-semibold text-slate-900">{drawAppNumber}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[11px]">Billing Cycle Start</div>
                    <div className="font-semibold text-slate-900">{periodStart}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[11px]">Target Lender Inspection</div>
                    <div className="font-semibold text-slate-900">{inspectionDate}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[11px]">Lending Facility</div>
                    <div className="font-semibold text-slate-900">Capital Reserve Trust</div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-4 pt-3 border-t border-slate-100 space-y-1">
                    <div className="text-slate-500 text-[11px]">Project Location</div>
                    <div className="font-medium text-slate-800">{projectAddress}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Line Items (SOV) */}
              <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="text-xs font-bold text-slate-900">
                    Line Items (SOV)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                        <th className="py-2.5 px-4 font-semibold">SOV Code & Description</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Total Budget</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Previously Drawn</th>
                        <th className="py-2.5 px-4 font-semibold text-right">This Period Claim</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sovLines.map((line) => {
                        const remaining = Math.max(0, line.budgetCents - line.previouslyDrawnCents - line.claimCents);
                        return (
                          <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {line.codeAndDesc}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 text-right tabular-nums">
                              {formatMoney(line.budgetCents)}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 text-right tabular-nums">
                              {formatMoney(line.previouslyDrawnCents)}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right tabular-nums">
                              {formatMoney(line.claimCents)}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 text-right tabular-nums">
                              {formatMoney(remaining)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 font-mono text-right tabular-nums">
                          {formatMoney(sovLines.reduce((acc, l) => acc + l.budgetCents, 0))}
                        </td>
                        <td className="py-3 px-4 font-mono text-right tabular-nums">
                          {formatMoney(sovLines.reduce((acc, l) => acc + l.previouslyDrawnCents, 0))}
                        </td>
                        <td className="py-3 px-4 font-mono text-right text-emerald-700 text-sm tabular-nums">
                          {formatMoney(totalRequestedCents)}
                        </td>
                        <td className="py-3 px-4 font-mono text-right tabular-nums">
                          {formatMoney(
                            sovLines.reduce(
                              (acc, l) =>
                                acc + Math.max(0, l.budgetCents - l.previouslyDrawnCents - l.claimCents),
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* SECTION 3: Inspection Proof */}
              <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="text-xs font-bold text-slate-900">
                    Inspection Proof
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setPreviewPhoto(photo)}
                        className="group rounded-lg border border-slate-200/80 bg-slate-50 overflow-hidden hover:border-slate-400 transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <div className="px-2.5 py-1.5 bg-white border-t border-slate-100 truncate">
                          <span className="text-[11px] font-semibold text-slate-700 truncate block" title={photo.title}>
                            {photo.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white px-4 py-2 rounded-lg disabled:opacity-40 cursor-pointer"
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
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {currentStep === 4 ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isSubmitting ? "Transmitting..." : "Submit Packet to Lender"}</span>
                </>
              ) : (
                "Next Step"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {isMounted && previewPhoto && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-hidden animate-in fade-in-0 duration-150"
          onClick={() => setPreviewPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {previewPhoto.title}
                </span>
                {photos.length > 0 && currentPhotoIndex !== -1 && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono shrink-0">
                    {currentPhotoIndex + 1} of {photos.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(previewPhoto.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove photo"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center p-6 bg-slate-50/70 select-none overflow-hidden">
              {/* Previous Photo Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Previous photo"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[calc(90vh-90px)] max-w-full w-auto h-auto object-contain rounded-xl shadow-md border border-slate-200/80 bg-white"
              />

              {/* Next Photo Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md border border-slate-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label="Next photo"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add from URL Modal */}
      {isMounted && isAddUrlOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in-0 duration-150"
          onClick={() => setIsAddUrlOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Image from URL</h3>
              <button
                type="button"
                onClick={() => setIsAddUrlOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer font-semibold"
                >
                  Add Photo
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Upload Photo Confirmation & Title Modal */}
      {isMounted && pendingUpload && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in-0 duration-150"
          onClick={() => setPendingUpload(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Site Photo Details</h3>
              <button
                type="button"
                onClick={() => setPendingUpload(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingUpload.url}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
            </div>

            <form onSubmit={handleConfirmUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Photo Title / Description
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={uploadTitleInput}
                  onChange={(e) => setUploadTitleInput(e.target.value)}
                  placeholder="e.g. Foundation Concrete Pour"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Specify a clear label for inspector and lender verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingUpload(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer font-semibold shadow-xs"
                >
                  Attach to Draw
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
