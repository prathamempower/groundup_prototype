import React from 'react';
import { AuthenticatedUser, DemoPersona } from './auth/types';
import { DIRECT_LOGIN_PERSONAS } from './auth/personas';
import { useAuthState } from './auth/use-auth-state';
import { AuthHero } from './auth/components/AuthHero';
import { AuthForm } from './auth/components/AuthForm';
import { GoogleAuthButton } from './auth/components/GoogleAuthButton';
import { DirectLoginGrid } from './auth/components/DirectLoginGrid';

export type { AuthenticatedUser, DemoPersona };
export { DIRECT_LOGIN_PERSONAS };

interface AuthScreenProps {
  onAuthenticate: (user: AuthenticatedUser) => void;
}

export function AuthScreen({ onAuthenticate }: AuthScreenProps) {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    loadingPersonaId,
    fullName,
    setFullName,
    company,
    setCompany,
    email,
    setEmail,
    password,
    setPassword,
    handleDirectLogin,
    handleAuth,
  } = useAuthState(onAuthenticate);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <AuthHero />

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
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${
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
              className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Create Account
            </button>
          </div>

          <AuthForm
            activeTab={activeTab}
            isLoading={isLoading}
            fullName={fullName}
            setFullName={setFullName}
            company={company}
            setCompany={setCompany}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={(e) => handleAuth(e, 'email')}
          />

          {activeTab === 'signin' && (
            <>
              <GoogleAuthButton onGoogleAuth={(e) => handleAuth(e, 'google')} />
              {import.meta.env.DEV && (
                <DirectLoginGrid
                  isLoading={isLoading}
                  loadingPersonaId={loadingPersonaId}
                  onDirectLogin={handleDirectLogin}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
