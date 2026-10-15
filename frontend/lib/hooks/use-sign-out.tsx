'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';
import { GroundUpMark } from '@/components/brand/GroundUpBrand';
import { Lock } from 'lucide-react';

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await authAdapter.signOut();
      queryClient.clear();
    } catch (err) {
      console.warn('Sign out cleanup warning:', err);
    }

    // Graceful 600ms transition without layout flashes
    setTimeout(() => {
      router.replace('/');
    }, 600);
  }, [isSigningOut, queryClient, router]);

  const SignOutOverlay = useCallback(() => {
    if (!isSigningOut) return null;

    return (
      <div
        className="fixed inset-0 z-9999 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white border border-slate-200/90 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3.5 animate-in zoom-in-95 duration-200 max-w-sm">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute -inset-1 rounded-full bg-blue-100 animate-ping opacity-60" />
            <GroundUpMark size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Securing Workspace</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Securing workspace session & returning to GroundUp...
            </p>
          </div>
        </div>
      </div>
    );
  }, [isSigningOut]);

  return {
    isSigningOut,
    signOut,
    SignOutOverlay,
  };
}
