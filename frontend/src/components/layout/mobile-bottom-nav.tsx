"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Search, Droplet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const mobileNavItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Search", href: "/search", icon: Search },
  { title: "Scan", href: "/scanner", icon: ScanLine, isPrimary: true },
  { title: "Track", href: "/tracking", icon: Droplet },
  { title: "Profile", href: "/profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bottom-nav flex items-center justify-around bg-surface/80 border-t border-outline-variant px-2 py-3 shadow-lg">
        {mobileNavItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          if (item.isPrimary) {
            return (
              <Link key={index} href={item.href} className="flex flex-col items-center -mt-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-surface"
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
                <span className="mt-1 text-[10px] font-medium text-primary font-jetbrains">
                  {item.title}
                </span>
              </Link>
            );
          }

          return (
            <Link key={index} href={item.href} className="flex flex-col items-center justify-center w-16">
              <div className="relative flex h-8 w-12 items-center justify-center rounded-full transition-colors">
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 rounded-full bg-primary-container"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon 
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors duration-200", 
                    isActive ? "text-on-primary-container" : "text-outline"
                  )} 
                />
              </div>
              <span className={cn(
                "mt-1 text-[10px] font-medium transition-colors duration-200",
                isActive ? "text-on-surface" : "text-outline"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
