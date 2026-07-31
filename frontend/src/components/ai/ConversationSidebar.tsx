"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { AIConversation } from "@/store/useAIStore";

interface ConversationSidebarProps {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({ conversations, activeId, onSelect, onNew, onDelete }: ConversationSidebarProps) {
  return (
    <div className="flex flex-col h-full glass-card border-r border-border/40 w-full">
      <div className="p-4 border-b border-border/40">
        <Button onClick={onNew} className="w-full gap-2 bg-primary text-on-primary">
          <Plus className="w-4 h-4" /> New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <p className="text-sm text-center text-on-surface-variant p-4">No conversations yet.</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id ? "bg-primary/20 text-primary font-medium" : "hover:bg-surface/50 text-on-surface"
              }`}
            >
              <div 
                className="flex items-center gap-2 overflow-hidden flex-1"
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{conv.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
