"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalTrackerProps {
  goals: any[];
}

export function GoalTracker({ goals }: GoalTrackerProps) {
  if (!goals || goals.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Your Sustainability Goals</CardTitle>
        <CardDescription>Track your water saving targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const progress = Math.min((goal.current_water_saved / goal.target_water_saved) * 100, 100);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{goal.goal_type} Goal</span>
                <span className="text-on-surface-variant">{goal.current_water_saved} / {goal.target_water_saved}L</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
