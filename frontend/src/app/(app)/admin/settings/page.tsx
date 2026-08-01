"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const res = await fetch("http://127.0.0.1:8000/api/v1/admin/settings", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          setSettings(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch("http://127.0.0.1:8000/api/v1/admin/settings", {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Global Settings</h1>
          <p className="text-on-surface-variant">Configure feature flags, maintenance modes, and AI thresholds.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="glass-card rounded-2xl p-6 max-w-3xl">
        <h3 className="text-lg font-bold border-b border-border/40 pb-2 mb-4">Application Config</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Maintenance Mode</p>
              <p className="text-xs text-on-surface-variant">Disable access for non-admin users.</p>
            </div>
            <div 
              onClick={() => toggleSetting('maintenance_mode')}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.maintenance_mode ? 'bg-primary' : 'bg-surface-variant'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${settings.maintenance_mode ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Enable Gamification</p>
              <p className="text-xs text-on-surface-variant">Toggle XP and Challenge systems.</p>
            </div>
            <div 
              onClick={() => toggleSetting('enable_gamification')}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.enable_gamification !== false ? 'bg-primary' : 'bg-surface-variant'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${settings.enable_gamification !== false ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
