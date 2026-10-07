import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Mail, Lock, Building, User, ChevronDown } from 'lucide-react';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  isNewUser?: boolean;
  avatarUrl?: string;
  authProvider: 'google' | 'email' | 'demo';
}

interface AuthScreenProps {
  onAuthenticate: (user: AuthenticatedUser) => void;
}

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('Developer / Owner');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent, provider: 'email' | 'google' = 'email') => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      const derivedName = fullName.trim() || (email ? email.split('@')[0] : (activeTab === 'signup' ? 'New User' : 'Sarah Jenkins'));
      const derivedEmail = email.trim() || (activeTab === 'signup' ? 'user@company.com' : 'sarah@horizon-development.com');
      const derivedCompany = company.trim() || 'Horizon Development Group';

      onAuthenticate({
        id: `usr_${Date.now()}`,
        name: derivedName,
        email: derivedEmail,
        company: derivedCompany,
        role: role,
        isNewUser: activeTab === 'signup',
        authProvider: provider,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {/* LEFT HALF */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 text-white p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-slate-900">G</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">GroundUp AI</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Construction Finance Intelligence</h1>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Track every dollar from land acquisition to unit closing. Built for real estate developers who demand clarity.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-200">4 Domain Truths: Budget · Spend · Funding · Progress</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-200">Every number traced to its source document</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-200">AI-assisted extraction, human-confirmed accuracy</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-slate-400 text-sm">
            Trusted by developers managing $50M+ in active projects
          </p>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">GroundUp AI</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">
            {activeTab === 'signin' ? 'Sign in to GroundUp AI' : 'Create Account'}
          </h2>

          <div className="flex gap-6 border-b border-slate-200 mb-8">
            <button
              type="button"
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'signin'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
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

            {activeTab === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Account Role</label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Workspace Owner
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Developer / Owner (Principal Sponsor)"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-sm font-medium cursor-not-allowed select-none focus:outline-none"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Only the Developer / Owner can register a new workspace. Once onboarded, you can invite other roles (GC, Lender, CFO, Accountant, Investors) and email them secure portal access from Settings.
                </p>
              </div>
            )}

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

          {activeTab === 'signin' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleAuth(e, 'google')}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
