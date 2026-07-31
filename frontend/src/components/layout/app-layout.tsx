"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <DesktopSidebar />
        <main className="flex-1 w-full p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
