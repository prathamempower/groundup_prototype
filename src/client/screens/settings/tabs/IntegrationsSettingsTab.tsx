import React from 'react';
import { Landmark, CreditCard, Mail, Zap } from 'lucide-react';
import { IntegrationsState } from '../types';

interface IntegrationsSettingsTabProps {
  integrations: IntegrationsState;
  setIntegrations: React.Dispatch<React.SetStateAction<IntegrationsState>>;
}

export const IntegrationsSettingsTab: React.FC<IntegrationsSettingsTabProps> = ({
  integrations,
  setIntegrations,
}) => {
  const integrationItems = [
    {
      id: 'bcbBank' as const,
      title: 'BCB Community Bank — Construction Loan Direct Feed',
      desc: 'Syncs loan draw approval statements, wire confirmations, and remaining interest reserve balances.',
      connected: integrations.bcbBank,
      icon: Landmark,
    },
    {
      id: 'amexCard' as const,
      title: 'American Express Corporate Card Feed (Project Cards)',
      desc: 'Automatically imports card transactions and links charges with project cost codes (Home Depot, lumber, etc.).',
      connected: integrations.amexCard,
      icon: CreditCard,
    },
    {
      id: 'inboundEmail' as const,
      title: 'Automated Inbound Email Ingestion',
      desc: 'Dedicated email (draws@hoboken73.groundup.ai) automatically parsing PDF invoices and lien waivers.',
      connected: integrations.inboundEmail,
      icon: Mail,
    },
    {
      id: 'quickbooks' as const,
      title: 'Intuit QuickBooks Online Ledger Sync',
      desc: 'Nightly two-way sync for bills, vendor checks, and cost code chart of accounts.',
      connected: integrations.quickbooks,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {integrationItems.map((int) => {
        const Icon = int.icon;
        return (
          <div key={int.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{int.title}</div>
                <div className="text-slate-500 mt-0.5">{int.desc}</div>
              </div>
            </div>
            <button
              onClick={() => setIntegrations(prev => ({ ...prev, [int.id]: !prev[int.id] }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                int.connected
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {int.connected ? '✓ Connected' : 'Connect Integration'}
            </button>
          </div>
        );
      })}
    </div>
  );
};
