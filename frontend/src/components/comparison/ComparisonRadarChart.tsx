"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTheme } from "next-themes";

interface ComparisonRadarChartProps {
  products: any[];
}

const STROKE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];

export function ComparisonRadarChart({ products }: ComparisonRadarChartProps) {
  const { theme } = useTheme();
  
  if (!products || products.length === 0) return null;

  // We map decision matrix components into radar axes (normalized 0-100)
  // Axes: Water Footprint, Sustainability Score, Carbon Footprint, Materials, AI Relevance
  const data = [
    { subject: "Water Footprint", fullMark: 100 },
    { subject: "Sustainability", fullMark: 100 },
    { subject: "Carbon Footprint", fullMark: 100 },
    { subject: "Materials", fullMark: 100 },
    { subject: "AI Score", fullMark: 100 },
  ];

  // Map products to the data array
  products.forEach((p, idx) => {
    const key = p.name;
    // We reverse engineer the mock scores from the decision matrix for viz
    const max_water = 35;
    
    data[0][key] = ((p.decision_matrix_score || 50) / 100) * 80 + 20; // Mock normalization
    data[1][key] = p.score.overall_score;
    data[2][key] = 85; // Mock carbon
    data[3][key] = 70; // Mock materials
    data[4][key] = 90; // Mock AI
  });

  return (
    <div className="w-full h-[400px] glass-card p-4 rounded-3xl">
      <h3 className="text-lg font-bold mb-2">Decision Matrix</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={theme === 'dark' ? "#333" : "#e5e7eb"} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          {products.map((p, idx) => (
            <Radar
              key={p.id}
              name={p.name}
              dataKey={p.name}
              stroke={STROKE_COLORS[idx % STROKE_COLORS.length]}
              fill={STROKE_COLORS[idx % STROKE_COLORS.length]}
              fillOpacity={0.4}
            />
          ))}
          
          <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: 'none' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
