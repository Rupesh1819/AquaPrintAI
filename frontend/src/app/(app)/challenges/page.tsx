"use client";

import { useEffect, useState } from "react";
import { XPProgressWidget } from "@/components/gamification/XPProgressWidget";
import { ActiveChallenges } from "@/components/gamification/ActiveChallenges";
import { RecentBadges } from "@/components/gamification/RecentBadges";
import { useChallengeStore } from "@/store/useChallengeStore";
import { useAchievementStore } from "@/store/useAchievementStore";
import { Loader2 } from "lucide-react";

export default function ChallengesPage() {
  const { setChallenges } = useChallengeStore();
  const { setUserProgress, setBadges } = useAchievementStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [progressRes, challengesRes, badgesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/gamification/profile/progress"),
          fetch("http://127.0.0.1:8000/api/v1/gamification/challenges"),
          fetch("http://127.0.0.1:8000/api/v1/gamification/badges")
        ]);
        
        if (progressRes.ok) setUserProgress(await progressRes.json());
        if (challengesRes.ok) setChallenges(await challengesRes.json());
        if (badgesRes.ok) setBadges(await badgesRes.json());
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGamificationData();
  }, [setChallenges, setUserProgress, setBadges]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2 pt-2 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Your Impact</h1>
        <p className="text-on-surface-variant">Complete quests to level up and earn rewards.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XPProgressWidget />
        <RecentBadges />
      </div>

      <ActiveChallenges />
    </div>
  );
}
