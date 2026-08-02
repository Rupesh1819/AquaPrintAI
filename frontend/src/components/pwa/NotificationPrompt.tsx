"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { requestNotificationPermission } from "@/lib/pwa/notifications";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationPrompt() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "default") return false;
    // Don't show if already dismissed
    return !localStorage.getItem("aquaprint-notif-dismissed");
  });

  const handleAllow = async () => {
    await requestNotificationPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("aquaprint-notif-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[99] w-[90%] max-w-md"
        >
          <div className="glass-card rounded-2xl p-4 shadow-2xl border border-outline-variant flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">Enable Notifications</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Get reminded about challenges, streaks, and weekly summaries.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleAllow} className="bg-primary text-on-primary">
                  Allow
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
