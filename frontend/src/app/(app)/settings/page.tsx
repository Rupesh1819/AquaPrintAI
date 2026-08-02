"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FadeInUp } from "@/components/shared/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, User as UserIcon, Shield, Bell, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { API_BASE_URL } from "@/lib/api";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE_URL}/users/me`, { headers });
    
    if (!res.ok) return { full_name: "Guest User", email: "guest@aquaprint.ai" };
    return res.json();
  };

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchProfile,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isClient) return null;

  return (
    <div className="space-y-8 pb-20 md:pb-6 max-w-4xl mx-auto w-full">
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Settings</h1>
          <p className="text-on-surface-variant">Manage your account preferences</p>
        </div>
      </FadeInUp>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: "profile", label: "Profile", icon: UserIcon },
            { id: "appearance", label: "Appearance", icon: ThemeToggle },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === tab.id 
                  ? "bg-primary-container text-on-primary-container" 
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {isLoading ? (
             <div className="space-y-4">
               <Skeleton className="h-64 w-full rounded-2xl" />
             </div>
          ) : (
            <FadeInUp key={activeTab}>
              {activeTab === "profile" && (
                <Card className="p-6 glass-card space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-jetbrains mb-1">Public Profile</h2>
                    <p className="text-sm text-on-surface-variant mb-6">This information will be displayed on the leaderboard.</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={`${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`} disabled className="bg-surface/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={userProfile?.email} disabled className="bg-surface/50" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button disabled>Save Changes</Button>
                  </div>
                </Card>
              )}

              {activeTab === "appearance" && (
                <Card className="p-6 glass-card space-y-6">
                   <div>
                    <h2 className="text-xl font-bold font-jetbrains mb-1">Theme</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Customize the look and feel of the app.</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <ThemeToggle />
                  </div>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card className="p-6 glass-card space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-jetbrains mb-1">Notification Preferences</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Manage what alerts you receive.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-variant/30">
                      <div>
                        <p className="font-medium">Scan Summaries</p>
                        <p className="text-sm text-on-surface-variant">Daily reports of your water footprint</p>
                      </div>
                      <Input type="checkbox" className="w-5 h-5 rounded accent-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-variant/30">
                      <div>
                        <p className="font-medium">Challenges & Badges</p>
                        <p className="text-sm text-on-surface-variant">Alerts when you unlock new achievements</p>
                      </div>
                      <Input type="checkbox" className="w-5 h-5 rounded accent-primary" defaultChecked />
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "security" && (
                <Card className="p-6 glass-card space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-jetbrains mb-1">Security & Account</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Manage your session and data.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={handleSignOut}>
                      <LogOut className="w-5 h-5 text-on-surface-variant" />
                      Sign Out of all devices
                    </Button>
                    <div className="pt-8 mt-8 border-t border-error/20">
                      <h3 className="text-error font-bold mb-2">Danger Zone</h3>
                      <p className="text-sm text-on-surface-variant mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </FadeInUp>
          )}
        </div>
      </div>
    </div>
  );
}
