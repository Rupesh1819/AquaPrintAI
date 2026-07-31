"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Droplet } from "lucide-react";

interface FootprintData {
  type: string;
  amount: number;
}

interface WaterFootprintChartProps {
  footprints: FootprintData[];
}

const COLORS = {
  blue: "#3b82f6",  // Blue water
  green: "#22c55e", // Green water
  grey: "#64748b"   // Grey water
};

export function WaterFootprintChart({ footprints }: WaterFootprintChartProps) {
  // Filter out zero amounts or total
  const data = footprints.filter(f => f.type !== "total" && f.amount > 0).map(f => ({
    name: f.type.charAt(0).toUpperCase() + f.type.slice(1) + " Water",
    value: f.amount,
    color: COLORS[f.type as keyof typeof COLORS] || "#000"
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-card">
        <Droplet className="w-12 h-12 text-on-surface-variant mb-4" />
        <p className="text-on-surface-variant text-center">No detailed footprint breakdown available.</p>
      </div>
    );
  }

  return (
    <div className="w-full glass-card p-4 sm:p-6 rounded-3xl relative">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Droplet className="w-5 h-5 text-primary" /> Footprint Breakdown
      </h3>
      
      <div className="h-[250px] sm:h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} Liters`, 'Amount']}
              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'var(--surface)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
          <span className="text-3xl font-bold">{total.toFixed(0)}</span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">Liters</span>
        </div>
      </div>
    </div>
  );
}
