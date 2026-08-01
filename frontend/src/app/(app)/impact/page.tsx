"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useDashboardStore } from "@/store/useDashboardStore";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ActiveChallenges } from "@/components/gamification/ActiveChallenges";
import { RecentBadges } from "@/components/gamification/RecentBadges";
import { XPProgressWidget } from "@/components/gamification/XPProgressWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeInUp } from "@/components/shared/animations";

export default function ImpactPage() {
  const supabase = createClient();
  const [isClient, setIsClient] = useState(false);
  
  const { summary, setSummary } = useDashboardStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchApi = async (endpoint: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) throw new Error("No active session");
    
    const res = await fetch(`http://127.0.0.1:8000/api/v1/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  };

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => fetchApi('dashboard/summary'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => fetchApi('users/me'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: badgesData } = useQuery({
    queryKey: ['gamification', 'badges'],
    queryFn: () => fetchApi('gamification/badges'),
  });

  const { data: challengesData } = useQuery({
    queryKey: ['gamification', 'challenges'],
    queryFn: () => fetchApi('gamification/challenges'),
  });

  useEffect(() => {
    if (summaryData) setSummary(summaryData);
  }, [summaryData, setSummary]);

  if (!isClient) return null;

  const displaySummary = summaryData || summary;
  const isLoading = isLoadingSummary || isLoadingProfile;

  if (isLoading && !displaySummary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-6">
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Sustainability Impact</h1>
          <p className="text-on-surface-variant">Your real-world environmental contributions</p>
        </div>
      </FadeInUp>

      {userProfile && (
        <FadeInUp delay={0.1}>
          <XPProgressWidget />
        </FadeInUp>
      )}
      
      <FadeInUp delay={0.2}>
        <div className="mt-8">
           <h2 className="text-xl font-bold font-jetbrains mb-4">Core Metrics</h2>
           <SummaryCards summary={displaySummary} />
        </div>
      </FadeInUp>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <FadeInUp delay={0.3}>
          <h2 className="text-xl font-bold font-jetbrains mb-4">Recent Badges</h2>
          <RecentBadges />
        </FadeInUp>
        
        <FadeInUp delay={0.4}>
          <h2 className="text-xl font-bold font-jetbrains mb-4">Active Challenges</h2>
          <ActiveChallenges />
        </FadeInUp>
      </div>
    </div>
  );
}
