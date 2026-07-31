"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  scans: any[];
}

export function RecentActivity({ scans }: RecentActivityProps) {
  if (!scans || scans.length === 0) return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-on-surface-variant">No recent activity found.</p>
      </CardContent>
    </Card>
  );

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
        <CardDescription>Your latest sustainability checks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scans.slice(0, 5).map((scan) => (
            <div key={scan.id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{scan.product.name}</p>
                <p className="text-xs text-on-surface-variant">{new Date(scan.created_at).toLocaleDateString()} • {scan.recognition_type}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold">{scan.product.water_footprint_liters}L</span>
                <Badge variant={scan.product.sustainability_score > 70 ? "default" : "secondary"}>
                  {scan.product.sustainability_score} Score
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
