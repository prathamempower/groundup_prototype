"use client";

import React, { useState, useEffect } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Clock,
} from "lucide-react";

interface DocumentTruthCard {
  id: string;
  type: string;
  title: string;
  vendor: string;
  statusText: string;
  verifiedStamp: string;
  icon: typeof FileText;
  accentColor: string;
  bgTint: string;
}

const DOCUMENT_CARDS: DocumentTruthCard[] = [
  {
    id: "doc-1",
    type: "AIA G702 / G703 Pay Application",
    title: "Trade Contractor Invoice #1042",
    vendor: "Structural Framing & Timber Scope",
    statusText: "Verified Against CSI Budget Division 06",
    verifiedStamp: "Contract Compliant",
    icon: FileText,
    accentColor: "text-blue-600",
    bgTint: "bg-blue-50/60 border-blue-200/80",
  },
  {
    id: "doc-2",
    type: "Civil Code § 8132 Lien Waiver",
    title: "Conditional Progress Lien Waiver",
    vendor: "Subcontractor Mechanics Lien Protection",
    statusText: "Title Cloud & Mechanics Lien Prevented",
    verifiedStamp: "Lien Cleared",
    icon: ShieldCheck,
    accentColor: "text-emerald-600",
    bgTint: "bg-emerald-50/60 border-emerald-200/80",
  },
  {
    id: "doc-3",
    type: "Jurisdictional Inspection Record",
    title: "Municipal Rough Framing Card",
    vendor: "City Building Department Sign-Off",
    statusText: "Physical Milestone On-Site Passed",
    verifiedStamp: "Milestone Verified",
    icon: CheckCircle2,
    accentColor: "text-sky-600",
    bgTint: "bg-sky-50/60 border-sky-200/80",
  },
  {
    id: "doc-4",
    type: "Senior Bank Loan Draw Wire",
    title: "Disbursement Wire Reconciliation",
    vendor: "Commercial Construction Lender Account",
    statusText: "Matched to Bank Statement & Budget Line",
    verifiedStamp: "100% Reconciled",
    icon: Landmark,
    accentColor: "text-indigo-600",
    bgTint: "bg-indigo-50/60 border-indigo-200/80",
  },
];

export function AuthShowcasePanel() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % DOCUMENT_CARDS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between p-8 xl:p-14 overflow-hidden select-none bg-gradient-to-br from-slate-50 via-blue-50/25 to-amber-50/20 text-slate-900 border-r border-slate-200/80">
      {/* ── LUMINOUS NATURAL AMBIENT MOVING GRADIENT BLOBS ──────────────────── */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-blue-100/50 blur-[110px] animate-ambient-1"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[40rem] h-[40rem] rounded-full bg-amber-100/40 blur-[120px] animate-ambient-2"
        aria-hidden="true"
      />

      {/* Blueprint Hairline Grid */}
      <div className="blueprint-grid absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden="true" />

      {/* ── TOP HEADER: HIGH-CONTRAST LOGO & SOURCE TRUTH BADGE ────────────── */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-md">
          <BrandLogo size="md" theme="light" showWordmark={true} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-slate-200/90 text-[11px] text-slate-700 font-semibold shadow-2xs">
          <Sparkles className="size-3 text-blue-600" />
          <span>Document Source Truth</span>
        </div>
      </div>

      {/* ── CENTERPIECE: FLOWING TIMELINE OF VERIFIED SOURCE DOCUMENTS ──────── */}
      <div className="relative z-10 my-auto py-6 max-w-lg w-full space-y-4">
        {/* Psychological Impact Hook */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 block">
            Verifiable Construction Finance
          </span>
          <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-slate-950 font-display leading-snug">
            Every dollar on site backed by an immutable source document.
          </h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            Eliminate blind payments and spreadsheet guesswork. Invoices, lien waivers, and city inspection cards link directly to your project budget.
          </p>
        </div>

        {/* Flowing Document Cards Stream */}
        <div className="space-y-2.5 pt-2">
          {DOCUMENT_CARDS.map((doc, idx) => {
            const Icon = doc.icon;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={doc.id}
                onClick={() => setActiveStep(idx)}
                className={`w-full rounded-xl p-3.5 border transition-all duration-300 cursor-pointer text-left ${
                  isCurrent
                    ? "bg-white border-blue-400 shadow-md ring-1 ring-blue-500/15 translate-x-1"
                    : "bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs opacity-85 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${doc.bgTint}`}>
                      <Icon className={`size-4 ${doc.accentColor}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {doc.vendor}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isCurrent
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200/80"
                    }`}
                  >
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    {doc.verifiedStamp}
                  </span>
                </div>

                {isCurrent && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 animate-in fade-in-50 duration-200">
                    <span className="font-medium text-slate-700">{doc.statusText}</span>
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">{doc.type}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM TIMELINE PROGRESS & CALLOUT ──────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          {DOCUMENT_CARDS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeStep ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-slate-600 font-semibold">
          100% Audit-Ready Verification
        </span>
      </div>
    </div>
  );
}
