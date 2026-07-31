"use client";

import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 gap-3 glass-card border-l-4 border-l-primary rounded-tl-sm items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <div className="flex space-x-1 mt-1">
          <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
