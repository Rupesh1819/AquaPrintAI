"use client";

import { useAchievementStore } from "@/store/useAchievementStore";
import { Sparkles, Trophy } from "lucide-react";

export function XPProgressWidget() {
  const { userProgress } = useAchievementStore();

  if (!userProgress) return null;

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-surface to-primary/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" className="stroke-surface-variant fill-none" strokeWidth="12" />
          <circle 
            cx="64" cy="64" r="56" 
            className="stroke-primary fill-none transition-all duration-1000 ease-out" 
            strokeWidth="12" 
            strokeDasharray={`${2 * Math.PI * 56}`} 
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - userProgress.progress_percentage / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Trophy className="w-6 h-6 text-primary mb-1" />
          <span className="text-2xl font-extrabold tracking-tighter">
            Lvl {userProgress.level}
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-on-surface-variant flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> {userProgress.current_xp} / {userProgress.next_level_xp} XP
        </p>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          {userProgress.next_level_xp - userProgress.current_xp} XP to next level
        </p>
      </div>
    </div>
  );
}
