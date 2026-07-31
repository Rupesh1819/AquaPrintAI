"use client";

import { useAchievementStore } from "@/store/useAchievementStore";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecentBadges() {
  const { badges } = useAchievementStore();
  const recent = badges.filter(b => b.is_unlocked).slice(0, 3);

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" /> Recent Badges
      </h3>
      
      {recent.length === 0 ? (
        <p className="text-on-surface-variant text-sm italic">Complete challenges to earn badges.</p>
      ) : (
        <div className="flex gap-4">
          {recent.map(b => (
            <div key={b.id} className="flex flex-col items-center text-center w-20">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20 mb-2">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold leading-tight">{b.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
