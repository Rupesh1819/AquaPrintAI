"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, TrendingUp, Award, Zap } from "lucide-react";

interface SummaryCardsProps {
  summary: {
    total_scanned: number;
    estimated_water_saved: number;
    average_sustainability_score: number;
    current_streak: number;
    eco_level: number;
    xp: number;
    badge: string;
  } | null;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
          <Droplet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{summary.estimated_water_saved}L</div>
          <p className="text-xs text-on-surface-variant">Estimated lifetime savings</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Eco Score</CardTitle>
          <Award className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{summary.average_sustainability_score}/100</div>
          <p className="text-xs text-on-surface-variant">Across {summary.total_scanned} products</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">{summary.current_streak} Days</div>
          <p className="text-xs text-on-surface-variant">Keep it up!</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eco Level {summary.eco_level}</CardTitle>
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{summary.badge}</div>
          <p className="text-xs text-on-surface-variant">{summary.xp} XP total</p>
        </CardContent>
      </Card>
    </div>
  );
}
