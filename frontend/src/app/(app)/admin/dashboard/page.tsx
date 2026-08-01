"use client";

import { useEffect, useState } from "react";
import { Users, ScanLine, Bot, Droplets, Target, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const { dashboardStats, setDashboardStats } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch("http://127.0.0.1:8000/api/v1/admin/dashboard", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          setDashboardStats(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [setDashboardStats]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { title: "Total Users", value: dashboardStats?.total_users || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Users", value: dashboardStats?.active_users || 0, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Scans", value: dashboardStats?.total_scans || 0, icon: ScanLine, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "AI Requests", value: dashboardStats?.ai_requests || 0, icon: Bot, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Products in DB", value: dashboardStats?.total_products || 0, icon: Target, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Avg. Eco Score", value: dashboardStats?.average_sustainability_score || 0, icon: Droplets, color: "text-teal-500", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-on-surface-variant">High-level KPIs and system health.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface-variant">{stat.title}</p>
              <p className="text-3xl font-extrabold">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
