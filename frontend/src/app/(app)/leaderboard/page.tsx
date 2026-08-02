"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, User } from "lucide-react";
import Image from "next/image";
import { useLeaderboardStore } from "@/store/useLeaderboardStore";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LeaderboardPage() {
  const { globalRanking, setGlobalRanking } = useLeaderboardStore();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all_time"); // weekly, monthly, all_time

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/gamification/leaderboard?period=${period}`);
        if (res.ok) {
          setGlobalRanking(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [period, setGlobalRanking]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2 pt-2 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" /> Leaderboard
        </h1>
        <p className="text-on-surface-variant">See how you stack up against the community.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["weekly", "monthly", "all_time"].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
              period === p ? 'bg-primary text-on-primary' : 'bg-surface/50 text-on-surface hover:bg-surface'
            }`}
          >
            {p.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : globalRanking.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            No rankings yet for this period.
          </div>
        ) : (
          <div className="flex flex-col">
            {globalRanking.map((entry, idx) => (
              <div 
                key={entry.user_id}
                className={`flex items-center justify-between p-4 sm:p-6 border-b border-border/20 last:border-0 ${idx < 3 ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 flex justify-center font-bold text-lg">
                    {idx === 0 ? <Medal className="w-6 h-6 text-yellow-500" /> : 
                     idx === 1 ? <Medal className="w-6 h-6 text-slate-300" /> : 
                     idx === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                     `#${entry.rank}`}
                  </div>
                  
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                    {entry.avatar_url ? (
                      <Image src={entry.avatar_url} alt={entry.display_name} fill className="rounded-full object-cover" unoptimized />
                    ) : (
                      <User className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  
                  {/* Name & Level */}
                  <div>
                    <p className="font-semibold">{entry.display_name}</p>
                    <p className="text-xs text-on-surface-variant">Level {entry.level}</p>
                  </div>
                </div>
                
                {/* Score */}
                <div className="text-right">
                  <p className="font-extrabold text-primary">{entry.total_xp.toLocaleString()} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
