"use client";

import { useChallengeStore } from "@/store/useChallengeStore";
import { CheckCircle2, Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ActiveChallenges() {
  const { activeChallenges } = useChallengeStore();

  if (!activeChallenges || activeChallenges.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 text-center">
        <Target className="w-8 h-8 text-on-surface-variant/50 mx-auto mb-2" />
        <p className="text-on-surface-variant">No active challenges.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" /> Active Quests
      </h3>
      
      <div className="space-y-4">
        {activeChallenges.map(c => {
          const progressPercent = Math.min((c.progress_count / c.target_count) * 100, 100);
          return (
            <div key={c.id} className={`p-4 rounded-2xl border ${c.is_completed ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-surface'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {c.title} 
                    {c.is_completed && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">{c.description}</p>
                </div>
                <div className="px-2 py-1 bg-primary/10 rounded-lg text-primary text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +{c.reward_xp}
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Progress</span>
                  <span>{c.progress_count} / {c.target_count}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
