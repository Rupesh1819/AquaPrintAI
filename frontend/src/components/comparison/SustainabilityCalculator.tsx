"use client";

import { Calculator, Droplets } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface SustainabilityCalculatorProps {
  savings: {
    per_unit: number;
    daily: number;
    monthly: number;
    yearly: number;
  };
}

export function SustainabilityCalculator({ savings }: SustainabilityCalculatorProps) {
  const [units, setUnits] = useState(1);

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" /> What if I switch?
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">Estimate your impact by switching to the winning product.</p>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-semibold whitespace-nowrap">Units per day:</label>
        <Input 
          type="number" 
          min={1} 
          value={units} 
          onChange={(e) => setUnits(parseInt(e.target.value) || 1)} 
          className="w-24 text-center rounded-xl bg-surface"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Droplets className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Daily</p>
          <p className="text-2xl font-extrabold">{(savings.daily * units).toFixed(1)}L</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Droplets className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Monthly</p>
          <p className="text-2xl font-extrabold">{(savings.monthly * units).toFixed(1)}L</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Droplets className="w-6 h-6 text-primary mb-2" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Yearly</p>
          <p className="text-2xl font-extrabold">{(savings.yearly * units).toFixed(1)}L</p>
        </div>
      </div>
    </div>
  );
}
