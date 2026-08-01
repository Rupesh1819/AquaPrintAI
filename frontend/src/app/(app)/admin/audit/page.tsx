"use client";

import { useEffect, useState } from "react";
import { ListTree, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch("http://127.0.0.1:8000/api/v1/admin/audit", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Audit Logs</h1>
        <p className="text-on-surface-variant">Track all administrative actions and critical system events.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <ListTree className="w-12 h-12 mx-auto text-on-surface-variant/50 mb-4" />
            <h3 className="text-xl font-bold">No recent audit logs</h3>
            <p className="text-on-surface-variant">System actions will be recorded here for compliance and security.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface/50 text-on-surface-variant text-sm font-semibold border-b border-border/40">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Admin ID</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/20 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-bold">{log.action}</td>
                    <td className="p-4 text-sm">{log.target_resource || '-'}</td>
                    <td className="p-4 text-xs font-mono text-on-surface-variant">{log.admin_id}</td>
                    <td className="p-4 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
