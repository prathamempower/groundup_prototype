'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAdapter } from '@/lib/api/adapters/auth-adapter';

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
    } finally {
      router.replace('/');
    }
  }, [isSigningOut, queryClient, router]);

  const SignOutOverlay = useCallback(() => null, []);

  return {
    isSigningOut,
    signOut,
    SignOutOverlay,
  };
}

