"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ScanLine, 
  Search, 
  Droplet, 
  Leaf, 
  MessageSquare,
  User,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Scanner", href: "/scanner", icon: ScanLine },
  { title: "Search", href: "/search", icon: Search },
  { title: "Tracking", href: "/tracking", icon: Droplet },
  { title: "Impact", href: "/impact", icon: Leaf },
  { title: "AI Guide", href: "/assistant", icon: MessageSquare },
];

const secondaryNavItems = [
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-outline-variant bg-surface/50 p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex-1 space-y-1">
        <h4 className="px-2 py-2 text-xs font-semibold tracking-widest text-on-surface-variant uppercase font-jetbrains">
          Menu
        </h4>
        <nav className="grid gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link key={index} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-variant hover:text-primary transition-colors",
                    isActive ? "bg-primary-container text-on-primary-container" : "transparent text-on-surface"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-outline")} />
                  <span>{item.title}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-4 space-y-1">
        <h4 className="px-2 py-2 text-xs font-semibold tracking-widest text-on-surface-variant uppercase font-jetbrains">
          Account
        </h4>
        <nav className="grid gap-1">
          {secondaryNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={index} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-variant hover:text-primary transition-colors",
                    isActive ? "bg-primary-container text-on-primary-container" : "transparent text-on-surface"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-outline")} />
                  <span>{item.title}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
