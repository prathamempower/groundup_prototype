'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Reveal } from '../reveal';
import { MaskedText } from '../ui/masked-text';

interface FaqItem {
  question: string;
  answer: string;
  category: 'draws' | 'liens' | 'inspections' | 'general';
}

const FAQS: FaqItem[] = [
  {
    category: 'general',
    question: 'How does GroundUp differ from general construction tools like Procore?',
    answer: 'General construction apps focus on job site project management: RFIs, submittals, punch lists, and daily superintendent logs. GroundUp is a specialized financial control layer built for owners and developers. It continuously reconciles four synchronized truths: baseline budgets, actual trade spend with mandatory 10% retainage withholdings, certified municipal building inspections, and commercial bank loan disbursements.',
  },
  {
    category: 'draws',
    question: 'Do commercial bank loan officers need to create an account or log into a portal?',
    answer: 'No. GroundUp treats commercial lenders as inbound data sources and outbound delivery targets. Lenders never need to learn or adopt third-party software. GroundUp automatically compiles standard AIA Document G702 and G703 pay application packages, backed by verified municipal inspection signoffs and lien waivers, and delivers them directly in the bank’s expected audit format.',
  },
  {
    category: 'draws',
    question: 'How does same-day draw package assembly work in practice?',
    answer: 'Instead of spending 10 to 14 business days chasing subcontractor invoices and matching spreadsheet lines, GroundUp ingests vendor bills, verifies 10% retainage withholdings, matches items against CSI MasterFormat cost codes, and compiles a complete, lender-ready draw package with statutory lien waivers within hours.',
  },
  {
    category: 'liens',
    question: 'How does GroundUp prevent mechanics liens and title clouds?',
    answer: 'GroundUp enforces statutory compliance under California Civil Code Sections 8132, 8134, 8136, and 8138. Subcontractors sign conditional progress lien waivers upon invoice submission, and unconditional progress waivers are automatically verified before any subsequent draw disbursement is authorized, preventing double billing and surprise mechanics liens.',
  },
  {
    category: 'inspections',
    question: 'How are physical job site inspections verified before invoices are approved?',
    answer: 'Municipal building department inspection cards (foundation, framing, rough MEP, insulation) and geotagged, timestamped mobile field evidence are mapped directly to CSI MasterFormat budget codes. If an inspection fails, only the affected trade cost code is frozen for re-inspection, while unaffected trades proceed without project-wide halts.',
  },
  {
    category: 'general',
    question: 'Does GroundUp integrate with our existing accounting and ERP systems?',
    answer: 'Yes. GroundUp synchronizes approved payables and draw receipts directly with QuickBooks Online, Sage 300 CRE (Timberline), and Yardi Voyager general ledgers, maintaining real-time audit parity between accounting books and job site construction financing.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'draws', label: 'Draws & Banking' },
  { id: 'liens', label: 'Lien Defense' },
  { id: 'inspections', label: 'Inspections & CSI' },
  { id: 'general', label: 'Platform & Accounting' },
] as const;

export interface FaqSectionProps {
  onStartOnboarding?: () => void;
}

export function FaqSection({ onStartOnboarding }: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const filteredFaqs = activeCategory === 'all'
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory);

  const toggleFaq = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section 
      id="faq" 
      className="scroll-mt-16 border-b border-slate-200/80 bg-white py-16 sm:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <HelpCircle className="size-3.5 text-primary" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 id="faq-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Answers for real estate developers and finance controllers.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-1">
            Learn how GroundUp automates loan draw packets, protects against lien clouds, and keeps development budgets synchronized.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedIndex(0);
              }}
              className={cn(
                'px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none',
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interactive Accordion List */}
        <div className="mt-10 space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = expandedIndex === index;
            const headingId = `faq-title-${index}`;
            const panelId = `faq-content-${index}`;

            return (
              <div
                key={faq.question}
                className={cn(
                  'rounded-2xl border transition-all duration-200 overflow-hidden',
                  isOpen
                    ? 'border-slate-300 bg-slate-50/60 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                )}
              >
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 pr-2">
                    {faq.question}
                  </span>
                  <div className={cn(
                    'size-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200',
                    isOpen ? 'bg-slate-200 rotate-180 text-slate-900' : 'bg-slate-100 text-slate-500'
                  )}>
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200/50 animate-in fade-in-50 duration-150"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Intake Prompt */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Have specific questions about your loan structure or draw process?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Our development onboarding process models your CSI budget lines in minutes.
            </p>
          </div>

          {onStartOnboarding && (
            <button
              type="button"
              onClick={onStartOnboarding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>Start project intake</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

      </div>
    </section>
  );
}

export default FaqSection;
