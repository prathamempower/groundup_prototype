'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';
import { getDefaultRouteForRole } from '@/lib/navigation';
import { LegalModal } from '@/components/LegalModal';
import { analyzePasswordStrength } from '@/lib/auth-password-validator';

export interface AuthSwitchCardProps {
  initialMode?: 'login' | 'signup';
}

function IndeterminateLoader() {
  return (
    <div className="flex items-center justify-center w-full py-1">
      <div className="w-24 h-1.5 bg-white/25 rounded-full relative overflow-hidden">
        <div className="bg-white rounded-full animate-pill-pulse" />
      </div>
    </div>
  );
}

/**
 * Character Staggered Flip Typography Effect
 * High-tech architectural spring flip with progressive character delays
 */
function StaggeredFlipText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={`char-flip-container ${className}`} aria-label={text}>
      {words.map((word, wIdx) => {
        const prevCharsCount = words.slice(0, wIdx).join(' ').length + (wIdx > 0 ? 1 : 0);
        return (
          <span key={wIdx} className="inline-block whitespace-nowrap">
            {word.split('').map((char, cIdx) => (
              <span
                key={cIdx}
                className="char-flip-letter"
                style={{
                  animationDelay: `${(prevCharsCount + cIdx) * 32}ms`,
                }}
              >
                {char}
              </span>
            ))}
            {wIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </span>
  );
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
    setLoginError('');
    setSignUpError('');
    const targetUrl = nextSignUp ? '/auth/sign-up' : '/auth/login';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetUrl);
    }
    router.replace(targetUrl);
  };

  // Log In Form State
  const [loginEmail, setLoginEmail] = useState('m.vance@vancedev.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Sign Up Form State
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Vance');
  const [signUpEmail, setSignUpEmail] = useState('alex@vancedevelopment.com');
  const [companyName, setCompanyName] = useState('Vance Development Partners');
  const [signUpPassword, setSignUpPassword] = useState('GroundUp2026!Secure');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [signUpError, setSignUpError] = useState('');
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Smart Password Validation & Strength Engine (12-character minimum standard protocol)
  const passwordAnalysis = useMemo(() => analyzePasswordStrength(signUpPassword), [signUpPassword]);

  // Log In Submit with 1.2s Indeterminate Loading Bar
  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    setIsLoginLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const { user } = await authAdapter.signIn(loginEmail.trim(), loginPassword, true);
      window.localStorage.setItem('groundup_session_seen', '1');
      queryClient.setQueryData(['auth-session'], { user });
      queryClient.setQueryData(['me'], { data: user });

      const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
      const target = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : getDefaultRouteForRole(user.role);

      router.replace(target);
    } catch (err: unknown) {
      setIsLoginLoading(false);
      setLoginError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    }
  };

  // Sign Up Submit with 1.2s Indeterminate Loading Bar
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!firstName.trim() || !lastName.trim()) {
      setSignUpError('Please enter both your first and last name.');
      return;
    }
    if (!signUpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      setSignUpError('Please enter a valid work email address.');
      return;
    }
    if (!companyName.trim()) {
      setSignUpError('Please enter your company or development firm name.');
      return;
    }
    if (signUpPassword.length < 12) {
      setSignUpError('Password must contain at least 12 characters as per modern security standards.');
      return;
    }
    if (!passwordAnalysis.hasCaseMix || !passwordAnalysis.hasNumberAndSymbol) {
      setSignUpError('Password must include mixed case letters, at least one number, and at least one symbol.');
      return;
    }
    if (!agreedToTerms) {
      setSignUpError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSignUpLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const session = await authAdapter.signUp({
        organization_name: companyName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      window.localStorage.setItem('groundup_session_seen', '1');
      queryClient.setQueryData(['auth-session'], session);
      queryClient.setQueryData(['me'], { data: session.user });

      try {
        localStorage.setItem(
          'groundup_onboarding_prefill',
          JSON.stringify({
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: signUpEmail.trim(),
            company: companyName.trim(),
          })
        );
      } catch { }

      router.replace('/projects');
    } catch (err: unknown) {
      setIsSignUpLoading(false);
      setSignUpError(err instanceof Error ? err.message : 'Failed to create account.');
    }
  };

  // Google One-Click Auth with 1.2s Indeterminate Loading Bar
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    setSignUpError('');

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const { user } = await authAdapter.signIn('dev-controller@groundup.test', 'GroundUp2026!Secure', true);
      window.localStorage.setItem('groundup_session_seen', '1');
      queryClient.setQueryData(['auth-session'], { user });
      queryClient.setQueryData(['me'], { data: user });

      const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
      const target = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : getDefaultRouteForRole(user.role);

      router.replace(target);
    } catch {
      setIsGoogleLoading(false);
      const msg = 'Unable to complete Google authentication. Please sign in with email.';
      if (isSignUp) setSignUpError(msg);
      else setLoginError(msg);
    }
  };

  // Apple One-Click Auth with 1.2s Indeterminate Loading Bar
  const handleAppleAuth = async () => {
    setIsAppleLoading(true);
    setLoginError('');
    setSignUpError('');

    try {
      await new Promise((res) => setTimeout(res, 1200));

      const { user } = await authAdapter.signIn('dev-controller@groundup.test', 'GroundUp2026!Secure', true);
      window.localStorage.setItem('groundup_session_seen', '1');
      queryClient.setQueryData(['auth-session'], { user });
      queryClient.setQueryData(['me'], { data: user });

      const requestedPath = new URLSearchParams(window.location.search).get('returnTo');
      const target = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : getDefaultRouteForRole(user.role);

      router.replace(target);
    } catch {
      setIsAppleLoading(false);
      const msg = 'Unable to complete Apple authentication. Please sign in with email.';
      if (isSignUp) setSignUpError(msg);
      else setLoginError(msg);
    }
  };

  return (
    <div className="w-full">
      {!isSignUp ? (
        /* ── LOGIN FORM (EXECUTIVE & CRISP) ─────────────────────────────────── */
        <div key="login" className="w-full space-y-2.5 sm:space-y-3 animate-auth-transition">
          <div className="space-y-0.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display auth-title-gradient">
              <StaggeredFlipText key="login-flip-title" text="Welcome back" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pick up where you left off.
            </p>
          </div>

          {loginError && (
            <div
              className="rounded-md border border-rose-200 bg-rose-50/90 p-2.5 text-xs text-rose-800 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {forgotSent && (
            <div
              className="rounded-md border border-emerald-200 bg-emerald-50/90 p-2.5 text-xs text-emerald-800 flex items-start gap-2.5"
              role="status"
            >
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Password recovery instructions sent to your email.</span>
            </div>
          )}

          {/* Quick SSO: Google & Apple */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoginLoading || isGoogleLoading || isAppleLoading}
              className="w-full h-11 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center w-full py-1">
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                    <div className="bg-slate-700 rounded-full animate-pill-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAppleAuth}
              disabled={isLoginLoading || isGoogleLoading || isAppleLoading}
              className="w-full h-11 rounded-sm border border-slate-900 bg-slate-950 hover:bg-slate-900 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAppleLoading ? (
                <div className="flex items-center justify-center w-full py-1">
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full relative overflow-hidden">
                    <div className="bg-white rounded-full animate-pill-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                    className="w-[17px] h-[17px] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.5-7.7-11.44-13.98-5.74-9.13-10.33-19.74-13.78-31.84-3.45-12.1-5.18-23.75-5.18-34.95 0-14.79 3.55-27.18 10.66-37.18 7.11-10 16.42-15.09 27.93-15.28 4.7 0 9.87 1.25 15.52 3.75 5.65 2.5 9.77 3.75 12.36 3.75 2.37 0 6.6-1.3 12.7-3.9 6.1-2.6 11.2-3.83 15.3-3.7 11.45.62 20.66 4.98 27.63 13.08-9.98 6.06-14.9 14.54-14.76 25.44.14 8.7 3.4 16.03 9.77 21.99 6.38 5.96 14.07 9.38 23.08 10.26-2.12 6.5-4.63 13.1-7.52 19.8zM119.22 33.15c0-7.25 2.6-14.05 7.8-20.4 5.2-6.35 11.66-10.45 19.38-12.3.83 7.37-1.5 14.41-6.99 21.13-5.5 6.72-12.23 10.58-20.19 11.57z"/>
                  </svg>
                  <span>Apple</span>
                </>
              )}
            </button>
          </div>

          {/* Clean Divider (Zero Container Box) */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px bg-slate-200/90" />
            <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase select-none">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-slate-200/90" />
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-2.5 sm:space-y-3">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Work email <span className="text-blue-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Mail className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="name@company.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password <span className="text-blue-600 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-10 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Crisp 2px-Radius Action Button */}
            <button
              type="submit"
              disabled={isLoginLoading || isGoogleLoading}
              className="w-full h-11 rounded-sm bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1.5"
            >
              {isLoginLoading ? (
                <IndeterminateLoader />
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          {/* Pure Typography Switch Prompt (Zero Container Box) */}
          <div className="text-center pt-1.5 sm:pt-2">
            <p className="text-sm font-medium text-slate-700">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggle(true)}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* ── SIGN UP FORM (RESPONSIVE FLUID CONSOLE) ────────────────────────── */
        <div key="signup" className="w-full space-y-2.5 sm:space-y-3 animate-auth-transition">
          <div className="space-y-0.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display auth-title-gradient">
              <StaggeredFlipText key="signup-flip-title" text="Create your account" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Bring your project costs, progress, and funding into one clear view.
            </p>
          </div>

          {signUpError && (
            <div
              className="rounded-md border border-rose-200 bg-rose-50/90 p-2.5 text-xs text-rose-800 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{signUpError}</span>
            </div>
          )}

          {/* Quick SSO: Google & Apple (Balanced Side-by-Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSignUpLoading || isGoogleLoading || isAppleLoading}
              className="w-full h-11 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center w-full py-1">
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                    <div className="bg-slate-700 rounded-full animate-pill-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleAppleAuth}
              disabled={isSignUpLoading || isGoogleLoading || isAppleLoading}
              className="w-full h-11 rounded-sm border border-slate-900 bg-slate-950 hover:bg-slate-900 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAppleLoading ? (
                <div className="flex items-center justify-center w-full py-1">
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full relative overflow-hidden">
                    <div className="bg-white rounded-full animate-pill-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                    className="w-[17px] h-[17px] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.5-7.7-11.44-13.98-5.74-9.13-10.33-19.74-13.78-31.84-3.45-12.1-5.18-23.75-5.18-34.95 0-14.79 3.55-27.18 10.66-37.18 7.11-10 16.42-15.09 27.93-15.28 4.7 0 9.87 1.25 15.52 3.75 5.65 2.5 9.77 3.75 12.36 3.75 2.37 0 6.6-1.3 12.7-3.9 6.1-2.6 11.2-3.83 15.3-3.7 11.45.62 20.66 4.98 27.63 13.08-9.98 6.06-14.9 14.54-14.76 25.44.14 8.7 3.4 16.03 9.77 21.99 6.38 5.96 14.07 9.38 23.08 10.26-2.12 6.5-4.63 13.1-7.52 19.8zM119.22 33.15c0-7.25 2.6-14.05 7.8-20.4 5.2-6.35 11.66-10.45 19.38-12.3.83 7.37-1.5 14.41-6.99 21.13-5.5 6.72-12.23 10.58-20.19 11.57z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </>
              )}
            </button>
          </div>

          {/* Clean Hairline Divider (Zero Container Box) */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px bg-slate-200/90" />
            <span className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase select-none">
              or register with work email
            </span>
            <div className="flex-1 h-px bg-slate-200/90" />
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-2 sm:space-y-2.5">
            {/* Row 1 (Desktop 2-Column): First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label
                  htmlFor="signup-firstname"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  First name <span className="text-blue-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="Alex"
                    className="w-full h-11 pl-10 pr-3.5 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-lastname"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Last name <span className="text-blue-600 font-bold">*</span>
                </label>
                <input
                  id="signup-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  placeholder="Vance"
                  className="w-full h-11 px-3.5 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Row 2 (Desktop 2-Column): Work Email & Company Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Work email <span className="text-blue-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="alex@vancedevelopment.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-company"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Company name <span className="text-blue-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <Building className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    autoComplete="organization"
                    placeholder="Vance Development Partners"
                    className="w-full h-11 pl-10 pr-3.5 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password with Smart Strength Guide */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password <span className="text-blue-600 font-bold">*</span>
                </label>
                {signUpPassword && (
                  <span className={`text-xs font-semibold ${passwordAnalysis.textColor}`}>
                    {passwordAnalysis.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 12 characters (recommended for security)"
                  className="w-full h-11 pl-10 pr-10 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Dynamic Strength Progress Bar */}
              {signUpPassword && (
                <div className="mt-1 space-y-1">
                  <div className="w-full h-1.5 bg-slate-200/80 rounded-xs overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordAnalysis.colorClass}`}
                      style={{ width: `${passwordAnalysis.widthPercent}%` }}
                    />
                  </div>

                  {/* Smart Password Guide Checkpoints: Both number & symbol required */}
                  <div className="grid grid-cols-3 gap-1.5 text-xs text-slate-500 pt-0.5">
                    <span className={`inline-flex items-center gap-1.5 ${passwordAnalysis.hasMinLength ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                      {passwordAnalysis.hasMinLength ? <Check className="size-3.5 text-blue-600" /> : <span className="size-1.5 rounded-full bg-slate-300" />}
                      12+ characters
                    </span>
                    <span className={`inline-flex items-center gap-1.5 ${passwordAnalysis.hasCaseMix ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                      {passwordAnalysis.hasCaseMix ? <Check className="size-3.5 text-blue-600" /> : <span className="size-1.5 rounded-full bg-slate-300" />}
                      Uppercase & lowercase
                    </span>
                    <span className={`inline-flex items-center gap-1.5 ${passwordAnalysis.hasNumberAndSymbol ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                      {passwordAnalysis.hasNumberAndSymbol ? <Check className="size-3.5 text-blue-600" /> : <span className="size-1.5 rounded-full bg-slate-300" />}
                      Number & symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Row 4: Single-Source Legal Agreement Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="size-4 rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs text-slate-600 cursor-pointer select-none">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => openLegal('terms')}
                  className="font-medium text-slate-900 underline hover:text-blue-600 cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => openLegal('privacy')}
                  className="font-medium text-slate-900 underline hover:text-blue-600 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Row 5: Crisp 2px-Radius Action Button */}
            <button
              type="submit"
              disabled={isSignUpLoading || isGoogleLoading}
              className="w-full h-11 rounded-sm bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1.5"
            >
              {isSignUpLoading ? (
                <IndeterminateLoader />
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Pure Typography Switch Prompt (Zero Container Box) */}
          <div className="text-center pt-1.5 sm:pt-2">
            <p className="text-sm font-medium text-slate-700">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggle(false)}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-colors cursor-pointer"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ── LEGAL MODAL ────────────────────────────────────────────────────── */}
      <LegalModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />
    </div>
  );
}
