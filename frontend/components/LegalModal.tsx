// GroundUp AI: Legal & Compliance Modal (Terms of Service and Privacy Policy)
// Governance: Zero em dashes, zero executive acronyms, pure compliance with California Civil Code
// Sections 8132/8134/8136/8138 and AIA Document A201 retainage standards.

'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Building, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
}

export function LegalModal({ isOpen, initialTab = 'terms', onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-slate-900">
                GroundUp AI Compliance &amp; Legal Terms
              </h2>
              <p className="text-xs text-slate-500">
                Real Estate Development Operating Standards · Updated October 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'terms'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition ml-6 ${
              activeTab === 'privacy'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  1. Real Estate Development Workspace Scope
                </h3>
                <p>
                  GroundUp AI provides financial intelligence, automated draw packet assembly, and statutory lien tracking
                  for commercial real estate developers, owners, and general contractors. By accessing or using our
                  platform, you agree to comply with all applicable municipal building codes and banking regulations.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  2. Construction Retainage and Pay Applications
                </h3>
                <p>
                  All automated pay applications assembled within GroundUp conform to AIA Document A201 standard
                  10% retainage withholdings and AIA G702 / G703 format. Net payable calculations mathematically enforce:
                  Net Payable = Gross Amount - Retainage Withholding.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  3. Statutory Lien Waiver Compliance
                </h3>
                <p>
                  GroundUp strictly enforces California Civil Code Section 8132 (conditional progress), 8134 (unconditional progress),
                  8136 (conditional final), and 8138 (unconditional final) lien waivers prior to payment authorization
                  to protect property titles from mechanic liens.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  4. Commercial Lending Reality and SLA Disclaimer
                </h3>
                <p>
                  GroundUp provides same-day draw package assembly and automated line extraction. We do not manufacture
                  unrealistic bank turnaround SLAs or promise commercial lenders will disburse loan wires within arbitrary timelines.
                  Bank loan agreements and inspecting architect sign-offs remain governed by the respective lending institution.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  5. Account Authority and Age Requirement
                </h3>
                <p>
                  The registering user affirms they are at least 18 years of age and hold financial signing authority
                  or authorized project sponsorship on behalf of the registered development entity.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  1. Multi-Tenant Data Isolation
                </h3>
                <p>
                  Every GroundUp project ledger, bank feed, invoice line, and corporate document is strictly isolated
                  by organization identity (org_id). Cross-tenant queries are blocked at the relational engine level.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  2. Tamper-Proof Document Tracking
                </h3>
                <p>
                  Universal document uploads (PDF, spreadsheets, images, archives) are processed with a permanent digital audit trail to verify chain of custody, detect duplicate invoices, and prevent tampering.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  3. Bank Wire and Financial Confidentiality
                </h3>
                <p>
                  Bank wire instructions, HUD settlement statements, and contractor pay records are encrypted both in transit
                  and at rest using industry-standard TLS 1.3 and AES-256 protocols. Your financial information is never sold
                  or used to train external public language models.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  4. Audit Trails and Immutability
                </h3>
                <p>
                  Approved financial transactions and lender draw submissions remain permanently logged in an immutable audit trail.
                  Revision draws reference their parent draw ID to ensure transparent auditability for lending institutions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Developer Security &amp; Tenant Isolation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
}
