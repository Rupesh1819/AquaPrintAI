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
              <div className="flex items-center gap-3">
                {scan.product.image_url ? (
                  <div className="w-10 h-10 relative rounded-md overflow-hidden bg-surface/50 border border-border/40 shrink-0">
                    <img src={scan.product.image_url} alt={scan.product.name} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-surface/50 border border-border/40 flex items-center justify-center shrink-0">
                    <span className="text-xs text-on-surface-variant font-bold">{scan.product.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm sm:text-base leading-tight line-clamp-1">{scan.product.name}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(scan.created_at).toLocaleDateString()} • {scan.recognition_type}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold">{scan.product.water_footprint_liters}L</span>
                <Badge variant={scan.product.sustainability_score?.overall_score > 70 ? "default" : "secondary"}>
                  {scan.product.sustainability_score?.overall_score ?? "N/A"} Score
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
