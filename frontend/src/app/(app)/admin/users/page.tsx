"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Loader2, Search, Ban, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const { users, setUsers, updateUserStatus } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/users?search=${search}`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.items, data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search slightly
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, setUsers]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`http://127.0.0.1:8000/api/v1/admin/users/${id}/status?new_status=${newStatus}`, { 
        method: "PATCH",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      updateUserStatus(id, newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-on-surface-variant">Manage roles, statuses, and monitor activity.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 absolute left-3 top-3 text-on-surface-variant" />
          <Input 
            className="pl-10 rounded-xl bg-surface border-border/40" 
            placeholder="Search email or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface/50 text-on-surface-variant text-sm font-semibold border-b border-border/40">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-border/20 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">{u.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        u.role === 'admin' || u.role === 'super_admin' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        u.status === 'active' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {u.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-surface hover:bg-surface-variant transition-colors"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
