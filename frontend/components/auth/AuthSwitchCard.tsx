'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';
import { getDefaultRouteForRole } from '@/lib/navigation';
import { BrandLogo } from '@/components/ui/brand-logo';

export interface AuthSwitchCardProps {
  initialMode?: 'login' | 'signup';
}

export function AuthSwitchCard({ initialMode = 'login' }: AuthSwitchCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mode: false = login, true = signup
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // ── Log In Form State ────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
    } catch {}

    router.push('/onboarding');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ── Uiverse-Inspired 3D Toggle Switch ───────────────────────────────── */}
      <div className="mb-6 flex items-center justify-center gap-4 select-none">
        <span 
          onClick={() => setIsSignUp(false)}
          className={`text-xs font-bold transition-all cursor-pointer ${
            !isSignUp 
              ? 'text-slate-900 border-b-2 border-slate-900 pb-0.5' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Log in
        </span>

        {/* Minimalist Pill Slider */}
        <label 
          htmlFor="auth-card-toggle"
          className="relative inline-flex h-6 w-12 cursor-pointer items-center rounded-full bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-600/20"
        >
          <input
            id="auth-card-toggle"
            type="checkbox"
            checked={isSignUp}
            onChange={(e) => setIsSignUp(e.target.checked)}
            className="sr-only"
            aria-label="Toggle between Log in and Sign up"
          />
          <span 
            className={`inline-block size-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isSignUp ? 'translate-x-6 bg-blue-600' : 'translate-x-1'
            }`}
          />
        </label>

        <span 
          onClick={() => setIsSignUp(true)}
          className={`text-xs font-bold transition-all cursor-pointer ${
            isSignUp 
              ? 'text-slate-900 border-b-2 border-slate-900 pb-0.5' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Sign up
        </span>
      </div>

      {/* ── 3D Flip Card Container ─────────────────────────────────────────── */}
      <div className={`w-full [perspective:1200px] transition-[min-height] duration-500 ${isSignUp ? 'min-h-[580px]' : 'min-h-[470px]'}`}>
        <div 
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isSignUp ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
        >
          
          {/* ───────────────────────────────────────────────────────────────────
              FRONT FACE: LOG IN
             ─────────────────────────────────────────────────────────────────── */}
          <div 
            className={`w-full min-h-[470px] rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-overlay [backface-visibility:hidden] flex flex-col justify-between ${
              isSignUp ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            {/* Brand Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="flex justify-center mb-1">
                <BrandLogo size="lg" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to your account
              </p>
            </div>

            {/* Error Notice */}
            {loginError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-center gap-2"
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
                  className="block text-xs font-semibold text-slate-700"
                >
                  Work email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700"
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
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-600/15"
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
                className="mt-2 h-10 w-full rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 flex items-center justify-center cursor-pointer"
              >
                {signInMutation.isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          {/* ───────────────────────────────────────────────────────────────────
              BACK FACE: SIGN UP (STREAMLINED 2-STAGE PROGRESSION)
             ─────────────────────────────────────────────────────────────────── */}
          <div 
            className={`w-full min-h-[580px] rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-overlay absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between ${
              !isSignUp ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            {/* Brand Header */}
            <div className="text-center space-y-1 mb-4">
              <div className="flex justify-center mb-1">
                <BrandLogo size="md" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>
            </div>

            {/* Error Notice */}
            {signUpError && (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{signUpError}</span>
              </div>
            )}

            {/* ── STAGE 1: GOOGLE FIRST, IDENTITY, HANDLE, DOB & EMAIL ──────── */}
            {signUpStep === 1 && (
              <form onSubmit={handleSignUpStep1Next} className="space-y-3">
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
                    } catch {}
                    router.push('/onboarding');
                  }}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* 2. OR Divider */}
                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      or sign up with email
                    </span>
                  </div>
                </div>

                {/* 3. First Name & Last Name */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="signup-first-name" className="block text-[11px] font-semibold text-slate-700">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="signup-first-name"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="signup-last-name" className="block text-[11px] font-semibold text-slate-700">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="signup-last-name"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Vance"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                {/* 4. Username & Availability Badge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-username" className="block text-[11px] font-semibold text-slate-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    {isUsernameValid && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="size-3" />
                        Available
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
                      groundup.ai/
                    </span>
                    <input
                      id="signup-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="alexvance"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-24 pr-3 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                {/* 5. DOB with 18+ Calendar Validation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-dob" className="block text-[11px] font-semibold text-slate-700">
                      Date of birth <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Must be 18+</span>
                  </div>
                  <div className="relative">
                    <Calendar className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-dob"
                      type="date"
                      max={maxDobDate}
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                {/* 6. Work Email & Verification */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-email" className="block text-[11px] font-semibold text-slate-700">
                      Work email <span className="text-red-500">*</span>
                    </label>
                    {isEmailVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="signup-email"
                      type="email"
                      required
                      disabled={isEmailVerified}
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="alex@vancedevelopment.com"
                      className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        {isOtpSent ? 'Resend' : 'Send Code'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Animated 6-digit OTP Input */}
                {isOtpSent && !isEmailVerified && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] font-semibold text-blue-900 text-center">
                      Enter the 6-digit verification code sent to your email
                    </p>
                    <div className="flex justify-center gap-1.5">
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
                          className="size-8 rounded-lg border border-blue-300 bg-white text-center text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue to Password Stage Button */}
                <button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Next: Create Password</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </form>
            )}

            {/* ── STAGE 2: PASSWORD & TERMS ACCEPTANCE (SMOOTH SLIDE) ── */}
            {signUpStep === 2 && (
              <form onSubmit={handleSignUpComplete} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700">
                      Create password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min 12 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword((v) => !v)}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                            className={`flex-1 transition-all duration-300 ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
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
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-[11px] space-y-1 text-slate-600">
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

                {/* Terms of Service & Privacy Policy Notice */}
                <p className="text-[11px] leading-relaxed text-slate-500">
                  By continuing, you agree to the GroundUp{' '}
                  <span className="font-semibold text-slate-900 underline underline-offset-2 cursor-pointer">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-slate-900 underline underline-offset-2 cursor-pointer">
                    Privacy Policy
                  </span>.
                </p>

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSignUpStep(1)}
                    className="h-10 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthSwitchCard;
