"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RecommendationsProps {
  recommendations: any[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle>Eco Swaps</CardTitle>
        <CardDescription>Sustainable alternatives based on your scans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-surface/50 border border-border/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant line-through">{rec.source_product.name}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="font-semibold">{rec.recommended_product.name}</span>
              </div>
              <p className="text-xs text-on-surface-variant italic">{rec.reason}</p>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  View Product
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
