"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useComparisonStore } from "@/store/useComparisonStore";
import { Button } from "@/components/ui/button";
import { Scale, Trophy, Loader2 } from "lucide-react";
import { ComparisonRadarChart } from "@/components/comparison/ComparisonRadarChart";
import { ComparisonBarChart } from "@/components/comparison/ComparisonBarChart";
import { SustainabilityCalculator } from "@/components/comparison/SustainabilityCalculator";
import { AISummaryCard } from "@/components/comparison/AISummaryCard";

export default function ComparePage() {
  const router = useRouter();
  const { selectedProductIds, clearSelection } = useComparisonStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [aiSummary, setAiSummary] = useState("");
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  useEffect(() => {
    if (selectedProductIds.length < 2) {
      setLoading(false);
      return;
    }

    const fetchComparisonData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/comparison/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_ids: selectedProductIds })
        });
        
        if (!res.ok) throw new Error("Failed to generate comparison");
        const json = await res.json();
        setData(json);
        
        // After fetching data, automatically trigger AI summary
        triggerAiSummary(json);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [selectedProductIds]);

  const triggerAiSummary = async (comparisonData: any) => {
    setIsAiStreaming(true);
    setAiSummary("");
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/comparison/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comparisonData)
      });
      
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6);
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setAiSummary(prev => prev + parsed.text);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant">Crunching the data...</p>
      </div>
    );
  }

  if (selectedProductIds.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-3xl p-8">
        <Scale className="w-16 h-16 text-on-surface-variant/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not enough products</h2>
        <p className="text-on-surface-variant max-w-md mb-6">Select at least 2 products to compare their sustainability metrics.</p>
        <Button onClick={() => router.push('/search')}>Browse Products</Button>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center text-red-500">
        <p>{error || "An error occurred."}</p>
        <Button onClick={() => router.push('/search')} variant="outline" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-6">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-2 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Scale className="w-8 h-8 text-primary" /> Comparison Engine
        </h1>
        <Button variant="ghost" className="text-red-500" onClick={() => clearSelection()}>Clear</Button>
      </div>
      
      {/* Overview Matrix Table (simplified for visual space) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {data.products.map((p: any) => (
            <div key={p.id} className={`w-[280px] glass-card p-6 rounded-3xl relative ${p.id === data.winner_id ? 'border-2 border-primary bg-primary/5' : ''}`}>
              {p.id === data.winner_id && (
                <div className="absolute -top-3 -right-3 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                  <Trophy className="w-5 h-5" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-1 truncate">{p.name}</h3>
              <p className="text-sm text-on-surface-variant mb-4 truncate">{p.manufacturer}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Decision Score</span>
                  <span className="font-bold">{p.decision_matrix_score.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Eco Grade</span>
                  <span className="font-bold text-primary">{p.score.eco_grade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Water (Liters)</span>
                  <span className="font-bold">{p.total_water_liters.toFixed(1)}L</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComparisonRadarChart products={data.products} />
        <ComparisonBarChart products={data.products} />
      </div>

      {/* AI Summary */}
      <AISummaryCard summary={aiSummary} isStreaming={isAiStreaming} />

      {/* Savings Calculator (Only shows if there's a winner with actual savings) */}
      {data.savings && data.savings.yearly > 0 && (
        <SustainabilityCalculator savings={data.savings} />
      )}
      
    </div>
  );
}
