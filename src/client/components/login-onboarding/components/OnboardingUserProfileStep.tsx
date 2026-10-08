import React from 'react';

interface OnboardingUserProfileStepProps {
  userName: string;
  setUserName: (name: string) => void;
  companyName: string;
  setCompanyName: (company: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

export function OnboardingUserProfileStep({
  userName,
  setUserName,
  companyName,
  setCompanyName,
  userEmail,
  setUserEmail,
  userRole,
  setUserRole,
}: OnboardingUserProfileStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
        <span className="font-semibold text-slate-900">Owner & Organization Profile:</span> Enter your identity and company details. All project reports and invoices will be assigned directly to your organization.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / User Full Name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
            placeholder="e.g. Sam"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Entity Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
            placeholder="e.g. ABC Company"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Gmail / Work Email</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
            placeholder="sam@abccompany.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Role</label>
          <input
            type="text"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
