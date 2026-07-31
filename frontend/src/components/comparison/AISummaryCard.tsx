"use client";

import { Sparkles, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AISummaryCardProps {
  summary: string;
  isStreaming: boolean;
}

export function AISummaryCard({ summary, isStreaming }: AISummaryCardProps) {
  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-surface border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/30">
          <Bot className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          AI Analysis <Sparkles className="w-4 h-4 text-primary" />
        </h3>
      </div>
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {summary ? (
          <ReactMarkdown>{summary}</ReactMarkdown>
        ) : (
          <p className="text-on-surface-variant italic">Waiting for comparison data...</p>
        )}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
