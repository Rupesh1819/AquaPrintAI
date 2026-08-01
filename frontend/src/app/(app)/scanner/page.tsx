"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ScannerView } from "@/components/scanner/ScannerView";

export default function ScannerPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("http://127.0.0.1:8000/api/v1/scanner/process-image", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to process image");
      }
      
      // Successfully scanned, redirect to product details
      if (data.product_id) {
        router.push(`/products/${data.product_id}`);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Product Scanner</h1>
        <p className="text-on-surface-variant">Analyze water footprints instantly</p>
      </div>
      
      <ScannerView 
        onCapture={handleCapture}
        isProcessing={isProcessing}
        error={error}
        onResetError={() => setError(null)}
      />
    </div>
  );
}
