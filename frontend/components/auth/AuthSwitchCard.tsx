'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  X,
  Mail,
  Lock,
  User,
  AtSign
} from 'lucide-react';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';
import { getDefaultRouteForRole } from '@/lib/navigation';
import { BrandLogo } from '@/components/ui/brand-logo';
import { LegalModal } from '@/components/LegalModal';

export interface AuthSwitchCardProps {
  initialMode?: 'login' | 'signup';
}

export function AuthSwitchCard({ initialMode = 'login' }: AuthSwitchCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Mode: false = login, true = signup
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Legal Modal State
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  const openLegal = (tab: 'terms' | 'privacy') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  // Synchronize mode with pathname dynamically
  useEffect(() => {
    if (pathname?.includes('sign-up') || pathname?.includes('signup')) {
      setIsSignUp(true);
    } else if (pathname?.includes('login')) {
      setIsSignUp(false);
    }
  }, [pathname]);

  const handleToggle = (nextSignUp: boolean) => {
    setIsSignUp(nextSignUp);
    const targetUrl = nextSignUp ? '/auth/sign-up' : '/auth/login';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetUrl);
    }
    router.replace(targetUrl);
  };

  // ── Log In Form State ────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('m.vance@vancedev.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Sign Up Multi-Step State ─────────────────────────────────────────────────
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Vance');
  const [username, setUsername] = useState('alexvance');
  const [dob, setDob] = useState('1992-06-18');
  const [signUpEmail, setSignUpEmail] = useState('alex@vancedevelopment.com');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [signUpPassword, setSignUpPassword] = useState('GroundUp2026!Secure');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  // 18+ Max DOB Date (calculated dynamically)
  const maxDobDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  // Workspace username validation
  const isUsernameValid = useMemo(() => {
    if (!username) return null;
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  }, [username]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!signUpPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (signUpPassword.length >= 12) score += 1;
    if (/[A-Z]/.test(signUpPassword) && /[a-z]/.test(signUpPassword)) score += 1;
    if (/[0-9]/.test(signUpPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signUpPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak (min 12 chars needed)', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-600' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
      default:
        return { score: 0, label: '', color: 'bg-slate-200' };
    }
  }, [signUpPassword]);

  // ── Log In Mutation ─────────────────────────────────────────────────────────
  const signInMutation = useMutation({
    mutationFn: () => authAdapter.signIn(loginEmail.trim(), loginPassword, true),
    onSuccess: ({ user }) => {
      window.localStorage.setItem('groundup_session_seen', '1');
      queryClient.setQueryData(['auth-session'], { user });
      queryClient.setQueryData(['me'], { data: user });
      const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
      const target = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : getDefaultRouteForRole(user.role);
      router.replace(target);
    },
    onError: (err: unknown) => {
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setLoginError('Please enter a valid work email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }
    signInMutation.mutate();
  };

  // ── Sign Up Navigation & Verification ───────────────────────────────────────
  const handleSendOtp = () => {
    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      setSignUpError('Please enter a valid work email address before requesting a code.');
      return;
    }
    setSignUpError('');
    setIsOtpSent(true);
  };

  const handleVerifyOtp = (code: string) => {
    if (code.length === 6) {
      setIsEmailVerified(true);
      setSignUpError('');
    }
  };

  const handleSignUpStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    if (!firstName.trim() || !lastName.trim()) {
      setSignUpError('Please enter both your first and last name.');
      return;
    }
    if (!username.trim() || !isUsernameValid) {
      setSignUpError('Please choose a valid workspace handle (3-20 characters, alphanumeric).');
      return;
    }
    if (!dob) {
      setSignUpError('Please select your date of birth (must be 18+).');
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError('Please provide your work email address.');
      return;
    }
    setSignUpStep(2);
  };

  const handleSignUpComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    if (signUpPassword.length < 12) {
      setSignUpError('Password must contain at least 12 characters.');
      return;
    }
    if (passwordStrength.score < 2) {
      setSignUpError('Password must include uppercase, lowercase, and numbers.');
      return;
    }

    try {
      localStorage.setItem('groundup_onboarding_prefill', JSON.stringify({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: signUpEmail.trim(),
        username: username.trim(),
      }));
    } catch { }

    router.push('/onboarding');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Apple-Style Segmented Control (HIG Physical Spring Pill) ── */}
      <div
        role="tablist"
        aria-label="Authentication mode selection"
        className="mb-4 w-full max-w-[220px] p-1 bg-slate-200/60 backdrop-blur-xl border border-white/80 rounded-full flex items-center relative select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {/* Sliding Apple Pro Thumb */}
        <div
          aria-hidden="true"
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_6px_rgba(15,23,42,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-slate-900/[0.04] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${isSignUp
            ? 'left-[calc(50%+2px)]'
            : 'left-1'
            }`}
        />

        {/* Log In Tab Button */}
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          aria-controls="auth-login-panel"
          onClick={() => handleToggle(false)}
          className={`relative z-10 w-1/2 py-1.5 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 rounded-full ${!isSignUp
            ? 'text-slate-950 font-bold'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>Log In</span>
        </button>

        {/* Sign Up Tab Button */}
        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          aria-controls="auth-signup-panel"
          onClick={() => handleToggle(true)}
          className={`relative z-10 w-1/2 py-1.5 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 rounded-full ${isSignUp
            ? 'text-slate-950 font-bold'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <span>Sign Up</span>
        </button>
      </div>

      {/* ── 3D Flip Card Container ─────────────────────────────────────────── */}
      <div className="w-full [perspective:1200px]">
        <div
          className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${isSignUp ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
            }`}
        >

          {/* ───────────────────────────────────────────────────────────────────
              FRONT FACE: LOG IN
             ─────────────────────────────────────────────────────────────────── */}
          <div
            id="auth-login-panel"
            role="tabpanel"
            aria-labelledby="auth-login-tab"
            className={`w-full rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.9)] [backface-visibility:hidden] flex flex-col justify-start space-y-4 ${isSignUp ? 'absolute inset-0 pointer-events-none opacity-0 invisible' : 'relative pointer-events-auto opacity-100 visible'
              }`}
          >
            {/* Exit to Home Close Button */}
            <Link
              href="/"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
              aria-label="Exit to landing page"
              title="Exit to home"
            >
              <X className="size-4" />
            </Link>

            {/* Brand Header */}
            <div className="text-center space-y-1 mb-1">
              <div className="flex justify-center mb-1">
                <Link href="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Return to GroundUp home">
                  <BrandLogo size="md" />
                </Link>
              </div>
              <h1 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-950">
                Welcome back
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Log in to access your construction workspace
              </p>
            </div>

            {/* Error Notice */}
            {loginError && (
              <div
                role="alert"
                className="mb-2 rounded-xl border border-red-200 bg-red-50/90 p-2.5 text-xs font-medium text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Log In Form */}
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Work email
                </label>
                <div className="relative group">
                  <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={signInMutation.isPending}
                className="mt-1 h-11 w-full rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white text-sm font-semibold shadow-[0_2px_8px_-2px_rgba(15,23,42,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:opacity-60 flex items-center justify-center cursor-pointer"
              >
                {signInMutation.isPending ? 'Logging in…' : 'Log In'}
              </button>

              {/* Terms of Service & Privacy Policy Notice */}
              <p className="text-[11px] leading-relaxed text-slate-500 text-center pt-1">
                By continuing, you agree to the GroundUp{' '}
                <button
                  type="button"
                  onClick={() => openLegal('terms')}
                  className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => openLegal('privacy')}
                  className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                >
                  Privacy Policy
                </button>.
              </p>
            </form>
          </div>

          {/* ───────────────────────────────────────────────────────────────────
              BACK FACE: SIGN UP (2-STAGE PROGRESSION)
             ─────────────────────────────────────────────────────────────────── */}
          <div
            id="auth-signup-panel"
            role="tabpanel"
            aria-labelledby="auth-signup-tab"
            className={`w-full rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-start ${!isSignUp ? 'absolute inset-0 pointer-events-none opacity-0 invisible' : 'relative pointer-events-auto opacity-100 visible'
              }`}
          >
            {/* Exit to Home Close Button */}
            <Link
              href="/"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
              aria-label="Exit to landing page"
              title="Exit to home"
            >
              <X className="size-4" />
            </Link>

            {/* Brand Header */}
            <div className="text-center space-y-1 mb-2">
              <div className="flex justify-center mb-1">
                <Link href="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Return to GroundUp home">
                  <BrandLogo size="md" />
                </Link>
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-950">
                Create your account
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Start managing your projects
              </p>
            </div>

            {/* Error Notice */}
            {signUpError && (
              <div
                role="alert"
                className="mb-2 rounded-xl border border-red-200 bg-red-50/90 p-2.5 text-xs font-medium text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{signUpError}</span>
              </div>
            )}

            {/* ── STAGE 1: GOOGLE FIRST, IDENTITY, HANDLE, DOB & EMAIL ──────── */}
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpStep1Next} className="space-y-3.5">
                {/* 1. Continue with Google OAuth Button (At the Top for Best UX) */}
                <button
                  type="button"
                  onClick={() => {
                    setFirstName('Alex');
                    setLastName('Vance');
                    setUsername('alexvance');
                    setDob('1992-06-18');
                    setSignUpEmail('alex@vancedevelopment.com');
                    setIsEmailVerified(true);
                    try {
                      localStorage.setItem('groundup_onboarding_prefill', JSON.stringify({
                        name: 'Alex Vance',
                        email: 'alex@vancedevelopment.com',
                        username: 'alexvance',
                      }));
                    } catch { }
                    router.push('/onboarding');
                  }}
                  className="w-full h-11 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/80 active:scale-[0.99] text-slate-700 text-sm font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* 2. OR Divider */}
                <div className="relative my-0.5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/95 px-2.5 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                      or sign up with email
                    </span>
                  </div>
                </div>

                {/* 3. First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-first-name" className="block text-xs font-medium text-slate-700">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="size-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="signup-first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="signup-last-name" className="block text-xs font-medium text-slate-700">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="size-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="signup-last-name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Vance"
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Username & Availability Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-username" className="block text-xs font-medium text-slate-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    {isUsernameValid && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="size-3" />
                        Available
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none pointer-events-none">
                      groundup.ai/
                    </span>
                    <input
                      id="signup-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="alexvance"
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-[98px] pr-3.5 text-sm font-mono text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                {/* 5. DOB with 18+ Calendar Validation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-dob" className="block text-xs font-medium text-slate-700">
                      Date of birth <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Must be 18+</span>
                  </div>
                  <div className="relative group">
                    <Calendar className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                    <input
                      id="signup-dob"
                      type="date"
                      max={maxDobDate}
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3.5 text-sm text-slate-900 transition-all focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                {/* 6. Work Email & Verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-email" className="block text-xs font-medium text-slate-700">
                      Work email <span className="text-red-500">*</span>
                    </label>
                    {isEmailVerified && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        disabled={isEmailVerified}
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="alex@vancedevelopment.com"
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-3.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 disabled:bg-slate-100/60 disabled:text-slate-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-semibold transition-all cursor-pointer shrink-0"
                      >
                        {isOtpSent ? 'Resend' : 'Send Code'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Animated 6-digit OTP Input */}
                {isOtpSent && !isEmailVerified && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-2 animate-in fade-in duration-200">
                    <p className="text-xs font-semibold text-blue-900 text-center">
                      Enter the 6-digit verification code sent to your email
                    </p>
                    <div className="flex justify-center gap-2">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`signup-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1);
                            const next = [...otpCode];
                            next[idx] = val;
                            setOtpCode(next);
                            if (val && idx < 5) {
                              document.getElementById(`signup-otp-${idx + 1}`)?.focus();
                            }
                            if (next.every((d) => d !== '')) {
                              handleVerifyOtp(next.join(''));
                            }
                          }}
                          className="size-9 rounded-lg border border-blue-300 bg-white text-center text-sm font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue to Password Stage Button */}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white text-sm font-semibold shadow-[0_2px_8px_-2px_rgba(15,23,42,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>Next: Create Password</span>
                  <ArrowRight className="size-4" />
                </button>

                {/* Terms of Service & Privacy Policy Notice */}
                <p className="text-[11px] leading-relaxed text-slate-500 text-center pt-1">
                  By continuing, you agree to the GroundUp{' '}
                  <button
                    type="button"
                    onClick={() => openLegal('terms')}
                    className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => openLegal('privacy')}
                    className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Privacy Policy
                  </button>.
                </p>
              </form>
            )}

            {/* ── STAGE 2: PASSWORD & TERMS ACCEPTANCE (SMOOTH SLIDE) ── */}
            {signUpStep === 2 && (
              <form onSubmit={handleSignUpComplete} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-password" className="block text-xs font-medium text-slate-700">
                      Create password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min 12 characters</span>
                  </div>
                  <div className="relative group">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600" />
                    <input
                      id="signup-password"
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword((v) => !v)}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {signUpPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 transition-all duration-300 ${step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500 text-right">
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Password Criteria Checklist */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className={`size-3.5 rounded-full flex items-center justify-center ${signUpPassword.length >= 12 ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                      {signUpPassword.length >= 12 && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <span>At least 12 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-3.5 rounded-full flex items-center justify-center ${/[A-Z]/.test(signUpPassword) && /[a-z]/.test(signUpPassword) ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                      {/[A-Z]/.test(signUpPassword) && /[a-z]/.test(signUpPassword) && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <span>Uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-3.5 rounded-full flex items-center justify-center ${/[0-9]/.test(signUpPassword) ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                      {/[0-9]/.test(signUpPassword) && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <span>At least one number</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSignUpStep(1)}
                    className="h-11 px-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white text-sm font-semibold shadow-[0_2px_8px_-2px_rgba(15,23,42,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                {/* Terms of Service & Privacy Policy Notice */}
                <p className="text-[11px] leading-relaxed text-slate-500 text-center pt-1">
                  By continuing, you agree to the GroundUp{' '}
                  <button
                    type="button"
                    onClick={() => openLegal('terms')}
                    className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => openLegal('privacy')}
                    className="font-semibold text-slate-800 underline underline-offset-2 hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 inline"
                  >
                    Privacy Policy
                  </button>.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>

      <LegalModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />
    </div>
  );
}

export default AuthSwitchCard;
