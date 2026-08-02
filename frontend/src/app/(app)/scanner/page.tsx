"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScannerView } from "@/components/scanner/ScannerView";
import { useOnlineStatus } from "@/lib/pwa/useOnlineStatus";
import { enqueueOfflineRequest, getPendingCount } from "@/lib/db/offlineQueue";
import { processOfflineQueue } from "@/lib/pwa/sync-manager";
import { useSessionStore } from "@/store/sessionStore";
import { toast } from "sonner";
import { CloudOff, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { API_BASE_URL } from "@/lib/api";

export default function ScannerPage() {
  const router = useRouter();
  const supabase = createClient();
  const isOnline = useOnlineStatus();
  const { session } = useSessionStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Load pending count
  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, []);

  // Auto-process queue when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      processOfflineQueue(session?.access_token).then((result) => {
        if (result.success > 0) {
          toast.success(`${result.success} queued scan(s) synced.`);
          getPendingCount().then(setPendingCount);
        }
      });
    }
  }, [isOnline, pendingCount, session]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleCapture = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    // If offline, queue the scan
    if (!isOnline) {
      try {
        const imageData = await fileToBase64(file);
        await enqueueOfflineRequest('scan', { imageData, fileName: file.name });
        const count = await getPendingCount();
        setPendingCount(count);
        toast.info("You're offline. Scan queued and will auto-sync when online.", {
          icon: <CloudOff className="w-4 h-4" />,
        });
      } catch (err: any) {
        setError("Failed to queue scan for offline processing.");
      }
      setIsProcessing(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`${API_BASE_URL}/scanner/image`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      
      if (res.status === 404) {
        // Gemini successfully analyzed the image but no matching product in database
        toast.warning("Product not found in our database. The image was analyzed successfully but no match was found.", {
          duration: 5000,
        });
        setError("No matching product found in our database. Try scanning a different product or searching by name.");
        setIsProcessing(false);
        return;
      }
      
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to process image");
      }
      
      if (data.product && data.product.id) {
        toast.success("Product identified!");
        router.push(`/products/${data.product.id}`);
      } else if (data.success === false) {
        setError(data.message || "Could not identify this product. Try a clearer image.");
        setIsProcessing(false);
      } else {
        throw new Error("No product ID returned from scanner");
      }
      
    } catch (err: any) {
      console.error("Scanner Error:", err);
      setError(err.message || "An unexpected error occurred during scanning");
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 md:pb-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Product Scanner</h1>
          <p className="text-on-surface-variant">Analyze water footprints instantly</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium" aria-live="polite">
            <Upload className="w-4 h-4" />
            {pendingCount} queued
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-variant text-on-surface-variant text-sm" role="alert">
          <CloudOff className="w-4 h-4 shrink-0" />
          <span>Offline mode — scans will be queued and auto-synced when connected.</span>
        </div>
      )}
      
      <ScannerView 
        onCapture={handleCapture}
        isProcessing={isProcessing}
        error={error}
        onResetError={() => setError(null)}
      />
    </div>
  );
}
