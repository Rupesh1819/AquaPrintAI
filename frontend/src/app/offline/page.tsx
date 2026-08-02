"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Auto-redirect back to dashboard when online
      const timer = setTimeout(() => router.push("/dashboard"), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-surface-variant">
          <WifiOff className="h-12 w-12 text-on-surface-variant" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            {isOnline ? "Back Online!" : "You're Offline"}
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {isOnline
              ? "Your connection has been restored. Redirecting you back..."
              : "It looks like you've lost your internet connection. Some features may be limited, but you can still browse previously viewed content."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
            aria-label="Retry loading the page"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-on-primary gap-2"
            aria-label="Go to dashboard"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Button>
        </div>

        {!isOnline && (
          <div className="mt-8 text-xs text-on-surface-variant/70 space-y-1">
            <p>Available offline:</p>
            <p>Dashboard · Recent Scans · Saved Products · Challenges</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
