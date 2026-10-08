import React from 'react';
import { UserCheck } from 'lucide-react';

interface ProfileSettingsTabProps {
  onRestartOnboarding?: () => void;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({ onRestartOnboarding }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs max-w-xl">
      <h3 className="text-sm font-bold text-slate-900">Developer Entity Details</h3>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Company / Entity Legal Name</label>
        <input
          type="text"
          defaultValue="GroundUp Development Partners LLC"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Managing Principal</label>
        <input
          type="text"
          defaultValue="Hardik Parikh"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Tax ID / EIN</label>
        <input
          type="text"
          defaultValue="XX-XXX9842"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
        />
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-black transition cursor-pointer"
        >
          Save Profile Updates
        </button>
        {onRestartOnboarding && (
          <button
            type="button"
            onClick={onRestartOnboarding}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Re-run Role Self-Onboarding Flow</span>
          </button>
        )}
      </div>
    </div>
  );
};
