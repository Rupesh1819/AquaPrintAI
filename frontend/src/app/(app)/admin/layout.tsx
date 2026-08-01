"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert, LayoutDashboard, Users, PackageSearch, Activity, Settings, ListTree } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: PackageSearch },
    { name: "Analytics", href: "/admin/analytics", icon: Activity },
    { name: "Audit Logs", href: "/admin/audit", icon: ListTree },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Admin Sidebar */}
      <div className="w-64 border-r border-border/20 p-4 hidden md:flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-destructive/10 text-destructive font-bold text-sm">
          <ShieldAlert className="w-5 h-5" /> Admin Panel
        </div>
        
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" : "text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      {/* Admin Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
