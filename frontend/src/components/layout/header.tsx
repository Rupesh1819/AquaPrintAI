"use client";

import Link from "next/link";
import { Droplet, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-modal border-b border-outline-variant bg-surface/80">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto max-w-7xl">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Droplet className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-on-surface">
              AquaPrint AI
            </span>
          </Link>
        </div>
        
        {/* Mobile Header */}
        <div className="flex flex-1 items-center justify-between md:hidden">
          <Button variant="ghost" size="icon" className="-ml-2">
            <Menu className="h-5 w-5 text-on-surface" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center space-x-2">
            <Droplet className="h-5 w-5 text-primary" />
            <span className="font-bold text-on-surface">AquaPrint</span>
          </Link>
          <div className="w-9" /> {/* Spacer to center logo */}
        </div>
        
        {/* Desktop right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="hidden md:block">
              <Button className="rounded-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md hover:shadow-lg transition-all">
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
