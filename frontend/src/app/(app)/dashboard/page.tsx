"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "@/store/useDashboardStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { GoalTracker } from "@/components/dashboard/GoalTracker";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Droplets, ScanLine, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isClient, setIsClient] = useState(false);
  
  // Zustand Offline Store
  const { 
    summary, setSummary, 
    charts, setCharts, 
    insights, setInsights,
    recommendations, setRecommendations,
    recentScans, setRecentScans,
    goals, setGoals
  } = useDashboardStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchApi = async (endpoint: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) throw new Error("No active session");
    
    const res = await fetch(`http://127.0.0.1:8000/api/v1/dashboard/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  };

  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => fetchApi('summary'),
    staleTime: 5 * 60 * 1000,
  });

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

  const { data: insightsData } = useQuery({
    queryKey: ['dashboard', 'insights'],
    queryFn: () => fetchApi('insights'),
  });

  const { data: recsData } = useQuery({
    queryKey: ['dashboard', 'recommendations'],
    queryFn: () => fetchApi('recommendations'),
  });

  const { data: scansData } = useQuery({
    queryKey: ['dashboard', 'recent-scans'],
    queryFn: () => fetchApi('recent-scans'),
  });

  const { data: goalsData } = useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: () => fetchApi('goals'),
  });

  // Sync to offline store when network data is fetched
  useEffect(() => {
    if (summaryData) setSummary(summaryData);
    if (chartsData) setCharts(chartsData);
    if (insightsData) setInsights(insightsData);
    if (recsData) setRecommendations(recsData);
    if (scansData) setRecentScans(scansData);
    if (goalsData) setGoals(goalsData);
  }, [summaryData, chartsData, insightsData, recsData, scansData, goalsData, setSummary, setCharts, setInsights, setRecommendations, setRecentScans, setGoals]);

  if (!isClient) return null; // Hydration fix

  // Fallback to Zustand cache if react-query data is loading but we have cache (Offline support)
  const displaySummary = summaryData || summary;
  const displayCharts = chartsData || charts;
  const displayActivity = activityData || null;
  const displayInsights = insightsData || insights;
  const displayRecs = recsData || recommendations;
  const displayScans = scansData || recentScans;
  const displayGoals = goalsData || goals;

  const isLoading = isLoadingSummary || isLoadingCharts || isLoadingActivity;
  const isEmpty = !displaySummary || displaySummary.total_scanned === 0;

  if (isLoading && !displaySummary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Hello, {displaySummary?.first_name || 'Eco Warrior'}! 👋
          </h1>
          <p className="text-on-surface-variant">Here is your sustainability impact today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.push("/challenges")}>
            <Droplets className="w-4 h-4" /> Goals
          </Button>
          <Button className="bg-primary text-on-primary gap-2" onClick={() => router.push("/scanner")}>
            <ScanLine className="w-4 h-4" /> Scan Product
          </Button>
        </div>
      </div>

      {displayInsights?.map((insight: any, i: number) => (
        <Alert key={i} variant={insight.type === 'success' ? 'default' : 'default'} className="bg-surface/50 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>{insight.title}</AlertTitle>
          <AlertDescription>{insight.message}</AlertDescription>
        </Alert>
      ))}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl glass-card">
          <ScanLine className="w-16 h-16 text-on-surface-variant/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Scans Yet</h2>
          <p className="text-on-surface-variant max-w-md mb-6">
            Start scanning products to unlock your personalized dashboard, track your water footprint, and discover sustainable alternatives.
          </p>
          <Button size="lg" className="bg-primary text-on-primary" onClick={() => router.push("/scanner")}>
            Scan Your First Product
          </Button>
        </div>
      ) : (
        <>
          <SummaryCards summary={displaySummary} />
          
          <AnalyticsCharts activity={displayActivity} charts={displayCharts} />

          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8 space-y-4">
              <GoalTracker goals={displayGoals} />
              <RecentActivity scans={displayScans} />
            </div>
            <div className="md:col-span-4">
              <Recommendations recommendations={displayRecs} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
