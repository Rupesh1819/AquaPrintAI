"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Leaf } from "lucide-react";

interface SustainabilityGaugeProps {
  score: number;
  grade: string;
}

export function SustainabilityGauge({ score, grade }: SustainabilityGaugeProps) {
  // Determine color based on grade
  let color = "#ef4444"; // red
  if (grade === "A" || grade === "B") color = "#22c55e"; // green
  else if (grade === "C") color = "#eab308"; // yellow
  else if (grade === "D") color = "#f97316"; // orange

  const data = [
    { name: "score", value: score, fill: color }
  ];

  return (
    <div className="w-full glass-card p-4 sm:p-6 rounded-3xl relative flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-2 self-start flex items-center gap-2">
        <Leaf className="w-5 h-5 text-primary" /> Eco Score
      </h3>
      
      <div className="h-[200px] w-full relative mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="100%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={20} 
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'var(--surface)' }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
          <span className="text-5xl font-extrabold tracking-tighter" style={{ color }}>
            {grade}
          </span>
          <span className="text-sm text-on-surface-variant font-medium mt-1">Score: {score}/100</span>
        </div>
      </div>
    </div>
  );
}
