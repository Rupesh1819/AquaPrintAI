"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
import { useUserStore } from "@/store/userStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { setAuthenticated, setLoading, logout } = useAuthStore();
  const { setSession, clearSession } = useSessionStore();
  const { setProfile, clearUser } = useUserStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setAuthenticated(true);
        // Optionally fetch profile here or in a separate hook
        fetchProfile(session.access_token);
      } else {
        clearSession();
        setAuthenticated(false);
        clearUser();
        setLoading(false);
      }
    };

    const fetchProfile = async (token: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const profile = await response.json();
          setProfile(profile);
        }
      } catch {
        // Suppress errors during auth check
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        setAuthenticated(true);
        fetchProfile(session.access_token);
      } else {
        clearSession();
        logout();
        clearUser();
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setAuthenticated, setLoading, setSession, clearSession, setProfile, clearUser, logout]);

  return <>{children}</>;
}
