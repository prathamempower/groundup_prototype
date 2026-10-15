'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Scale, 
  Building2, 
  Printer, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

export interface LegalPageContentProps {
  defaultTab?: 'terms' | 'privacy';
}

export function LegalPageContent({ defaultTab = 'terms' }: LegalPageContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-slate-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandLogo size="md" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <ChevronRight className="size-3.5" />
            <span className="font-semibold text-slate-700">Legal &amp; Compliance Standards</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
            aria-label="Print compliance document"
          >
            <Printer className="size-3.5 text-slate-500" />
            <span>Print PDF</span>
          </button>

          <Link
            href="/auth/login"
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 transition shadow-2xs"
          >
            Log In
          </Link>

          <Link
            href="/auth/sign-up"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Document Header Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="size-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  GroundUp AI Compliance &amp; Legal Terms
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Real Estate Development Operating Standards · Updated October 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="size-3.5" />
                <span>Verified Legal Standards</span>
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <FileText className="size-4" />
              <span>Terms of Service</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Lock className="size-4" />
              <span>Privacy Policy</span>
            </button>
          </div>
        </div>

        {/* Legal Text Content Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm">
          {activeTab === 'terms' ? (
            <>
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">SECTION 1</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Real Estate Development Workspace Scope
                  </h2>
                </div>
                <p className="text-slate-600">
                  GroundUp AI provides financial intelligence, automated draw packet assembly, and statutory lien tracking for commercial real estate developers, owners, and general contractors. By accessing or using our platform, you agree to comply with all applicable municipal building codes and banking regulations.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">SECTION 2</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Construction Retainage and Pay Applications
                  </h2>
                </div>
                <p className="text-slate-600">
                  All automated pay applications assembled within GroundUp conform to AIA Document A201 standard 10% retainage withholdings and AIA G702 / G703 format. Net payable calculations mathematically enforce: Net Payable = Gross Amount - Retainage Withholding.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800">
                  Net Payable = Gross Incurred Spend - 10% Retainage Withholding
                </div>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">SECTION 3</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Statutory Lien Waiver Compliance
                  </h2>
                </div>
                <p className="text-slate-600">
                  GroundUp strictly enforces California Civil Code Section 8132 (conditional progress), 8134 (unconditional progress), 8136 (conditional final), and 8138 (unconditional final) lien waivers prior to payment authorization to protect property titles from mechanic liens.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li><strong>CA Civil Code § 8132:</strong> Conditional progress release required prior to invoice clearing.</li>
                  <li><strong>CA Civil Code § 8134:</strong> Unconditional progress release upon verified bank fund disbursement.</li>
                  <li><strong>CA Civil Code § 8136:</strong> Conditional final release upon substantial project completion.</li>
                  <li><strong>CA Civil Code § 8138:</strong> Unconditional final release upon zero balance and retainage release.</li>
                </ul>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">SECTION 4</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Commercial Lending Reality and SLA Disclaimer
                  </h2>
                </div>
                <p className="text-slate-600">
                  GroundUp provides same-day draw package assembly and automated line extraction. We do not manufacture unrealistic bank turnaround SLAs or promise commercial lenders will disburse loan wires within arbitrary timelines. Bank loan agreements and inspecting architect sign-offs remain governed by the respective lending institution.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">SECTION 5</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Account Authority and Age Requirement
                  </h2>
                </div>
                <p className="text-slate-600">
                  The registering user affirms they are at least 18 years of age and hold financial signing authority or authorized project sponsorship on behalf of the registered development entity.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">POLICY 1</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Multi-Tenant Data Isolation
                  </h2>
                </div>
                <p className="text-slate-600">
                  Every GroundUp project ledger, bank feed, invoice line, and corporate document is strictly isolated by organization identity (org_id). Cross-tenant queries are blocked at the relational engine level.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">POLICY 2</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Tamper-Proof Document Tracking
                  </h2>
                </div>
                <p className="text-slate-600">
                  Universal document uploads (PDF, spreadsheets, images, archives) are processed with a permanent digital audit trail to verify chain of custody, detect duplicate invoices, and prevent tampering.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">POLICY 3</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Bank Wire and Financial Confidentiality
                  </h2>
                </div>
                <p className="text-slate-600">
                  Bank wire instructions, HUD settlement statements, and contractor pay records are encrypted both in transit and at rest using industry-standard TLS 1.3 and AES-256 protocols. Your financial information is never sold or used to train external public language models.
                </p>
              </section>

              <section className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">POLICY 4</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Audit Trails and Immutability
                  </h2>
                </div>
                <p className="text-slate-600">
                  Approved financial transactions and lender draw submissions remain permanently logged in an immutable audit trail. Revision draws reference their parent draw ID to ensure transparent auditability for lending institutions.
                </p>
              </section>
            </>
          )}

          {/* Quick Return Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
            >
              <ArrowLeft className="size-4" />
              <span>Return to workspace registration</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/sign-up"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition shadow-sm"
              >
                Accept &amp; Continue Registration
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Copyright &copy; 2026 GroundUp AI Technologies Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LegalPageContent;
