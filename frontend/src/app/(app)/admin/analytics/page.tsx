"use client";

import { Activity, Bot, ScanLine } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Analytics</h1>
        <p className="text-on-surface-variant">Deep dive into AI monitoring and scanner accuracy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> AI Usage Stats</h3>
          <div className="h-64 flex items-center justify-center text-on-surface-variant bg-surface/50 rounded-xl border border-border/40">
            [AI Tokens & Response Time Chart Placeholder]
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ScanLine className="w-5 h-5 text-primary" /> Scanner Accuracy</h3>
          <div className="h-64 flex items-center justify-center text-on-surface-variant bg-surface/50 rounded-xl border border-border/40">
            [Barcode vs OCR Success Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}
