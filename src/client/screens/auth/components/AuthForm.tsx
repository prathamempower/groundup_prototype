import React from 'react';
import { ChevronRight, Mail, Lock, Building, User } from 'lucide-react';

interface AuthFormProps {
  activeTab: 'signin' | 'signup';
  isLoading: boolean;
  fullName: string;
  setFullName: (name: string) => void;
  company: string;
  setCompany: (comp: string) => void;
  email: string;
  setEmail: (em: string) => void;
  password: string;
  setPassword: (pw: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthForm({
  activeTab,
  isLoading,
  fullName,
  setFullName,
  company,
  setCompany,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {activeTab === 'signup' && (
        <>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
                placeholder="Jane Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Company / Entity Name</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
                placeholder="Horizon Development"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          {activeTab === 'signup' ? 'Work Email' : 'Email address'}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-slate-800">Password</label>
          {activeTab === 'signin' && (
            <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg text-sm font-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors shadow-2xs tracking-widest"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-xs disabled:opacity-70 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
