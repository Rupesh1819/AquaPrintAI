"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  // Public routes (like landing page) can be accessed by anyone, so no redirect logic is strictly needed here
  // unless we want to redirect authenticated users away. We usually do that in middleware or a GuestOnlyRoute.
  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  if (isAuthenticated) return null;

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { profile } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (profile?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, profile, router]);

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  if (!isAuthenticated || profile?.role !== 'admin') return null;

  return <>{children}</>;
}
