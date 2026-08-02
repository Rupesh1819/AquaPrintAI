"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, X, ScanLine, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FadeInUp } from "@/components/shared/animations";

interface ScannerViewProps {
  onCapture: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  onResetError: () => void;
}

export function ScannerView({ onCapture, isProcessing, error, onResetError }: ScannerViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onResetError();
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onCapture(file);
    }
  };

  const resetScanner = () => {
    setPreviewUrl(null);
    onResetError();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-6">
      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <FadeInUp key="idle" className="space-y-6">
            <Card className="glass-card overflow-hidden flex flex-col items-center justify-center p-12 text-center aspect-[4/5] sm:aspect-square border-dashed border-2 border-outline-variant/50">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-primary-container p-6 rounded-full mb-6 text-on-primary-container shadow-lg shadow-primary/20"
              >
                <ScanLine className="w-16 h-16" />
              </motion.div>
              <h2 className="text-2xl font-bold font-jetbrains mb-2">Scan Product</h2>
              <p className="text-on-surface-variant mb-8 max-w-xs">
                Take a photo or upload an image to analyze its water footprint and sustainability.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button 
                  className="flex-1 h-14 bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Use Camera
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 font-bold border-outline-variant"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </Card>
          </FadeInUp>
        ) : (
          <FadeInUp key="processing" className="space-y-6">
            <Card className="glass-card overflow-hidden relative aspect-[4/5] sm:aspect-square flex items-center justify-center bg-black/5">
              <Image 
                src={previewUrl} 
                alt="Scan preview" 
                fill 
                className="object-cover rounded-xl" 
                unoptimized 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              
              {/* Scanline Animation */}
              {isProcessing && (
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.8)] z-10"
                />
              )}

              {/* Status Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-white text-center">
                {isProcessing ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/40 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <h3 className="text-xl font-bold">Analyzing Impact...</h3>
                    <p className="text-sm text-white/80 mt-2">Running AI Vision Models</p>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-error/90 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center max-w-xs"
                  >
                    <AlertTriangle className="w-12 h-12 text-on-error mb-4" />
                    <h3 className="text-xl font-bold text-on-error">Scan Failed</h3>
                    <p className="text-sm text-on-error/90 mt-2">{error}</p>
                    <Button 
                      variant="secondary" 
                      className="mt-6 w-full"
                      onClick={resetScanner}
                    >
                      Try Again
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                     <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md border-0"
                        onClick={resetScanner}
                      >
                        <X className="w-6 h-6" />
                      </Button>
                  </div>
                )}
              </div>
            </Card>
          </FadeInUp>
        )}
      </AnimatePresence>
    </div>
  );
}
