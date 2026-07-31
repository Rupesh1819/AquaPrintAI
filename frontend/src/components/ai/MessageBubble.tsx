"use client";

import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'model';
    content: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 gap-3",
        isUser 
          ? "bg-primary text-on-primary rounded-tr-sm" 
          : "glass-card border-l-4 border-l-primary rounded-tl-sm"
      )}>
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
        
        <div className={cn("prose prose-sm", isUser ? "prose-invert" : "dark:prose-invert")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center">
              <User className="w-4 h-4 text-on-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
