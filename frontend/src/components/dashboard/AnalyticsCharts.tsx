"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "next-themes";

interface AnalyticsChartsProps {
  activity: any;
  charts: any;
}

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsCharts({ activity, charts }: AnalyticsChartsProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  if (!activity || !charts) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Products scanned over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activity.weekly_activity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={textColor} fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
              <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#00C49F' }}
              />
              <Line type="monotone" dataKey="scans" stroke="#00C49F" strokeWidth={3} dot={{ r: 4, fill: '#00C49F' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Footprint distribution by product type</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {charts.categories?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
