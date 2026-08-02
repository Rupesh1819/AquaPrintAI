"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useDashboardStore } from "@/store/useDashboardStore";

import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import("@/components/dashboard/AnalyticsCharts").then(mod => mod.AnalyticsCharts), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse bg-surface-variant rounded-xl" />
});
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeInUp } from "@/components/shared/animations";
import { API_BASE_URL } from "@/lib/api";

export default function TrackingPage() {
  const supabase = createClient();
  const [isClient, setIsClient] = useState(false);
  
  const { 
    charts, setCharts, 
    recentScans, setRecentScans,
  } = useDashboardStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchApi = async (endpoint: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE_URL}/dashboard/${endpoint}`, { headers });
    
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  };

  const { data: chartsData, isLoading: isLoadingCharts } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => fetchApi('charts'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => fetchApi('activity'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: scansData, isLoading: isLoadingScans } = useQuery({
    queryKey: ['dashboard', 'recent-scans'],
    queryFn: () => fetchApi('recent-scans'),
  });

  useEffect(() => {
    if (chartsData) setCharts(chartsData);
    if (scansData) setRecentScans(scansData);
  }, [chartsData, scansData, setCharts, setRecentScans]);

  if (!isClient) return null;

  const displayCharts = chartsData || charts;
  const displayActivity = activityData || null;
  const displayScans = scansData || recentScans;

  const isLoading = isLoadingCharts || isLoadingActivity || isLoadingScans;

  if (isLoading && !displayCharts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-6">
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Water Tracking</h1>
          <p className="text-on-surface-variant">Deep dive into your consumption timelines and scan history</p>
        </div>
      </FadeInUp>
      
      <FadeInUp delay={0.1}>
        <AnalyticsCharts activity={displayActivity} charts={displayCharts} />
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <div className="bg-surface/50 p-6 rounded-2xl border border-outline-variant glass-card">
           <h2 className="text-xl font-bold font-jetbrains mb-4">Complete Scan History</h2>
           <RecentActivity scans={displayScans} />
        </div>
      </FadeInUp>
    </div>
  );
}
