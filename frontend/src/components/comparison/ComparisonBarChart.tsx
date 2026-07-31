"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

interface ComparisonBarChartProps {
  products: any[];
}

export function ComparisonBarChart({ products }: ComparisonBarChartProps) {
  const { theme } = useTheme();

  if (!products || products.length === 0) return null;

  const data = products.map(p => {
    const blue = p.footprints.find((f: any) => f.type === "blue")?.amount || 0;
    const green = p.footprints.find((f: any) => f.type === "green")?.amount || 0;
    const grey = p.footprints.find((f: any) => f.type === "grey")?.amount || 0;

    return {
      name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
      Blue: blue,
      Green: green,
      Grey: grey,
    };
  });

  return (
    <div className="w-full h-[400px] glass-card p-4 rounded-3xl">
      <h3 className="text-lg font-bold mb-2">Water Footprint Breakdown (Liters)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#333" : "#e5e7eb"} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: theme === 'dark' ? '#9ca3af' : '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: 'none' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
          <Bar dataKey="Blue" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Green" stackId="a" fill="#22c55e" />
          <Bar dataKey="Grey" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
