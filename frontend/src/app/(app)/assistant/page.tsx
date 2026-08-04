"use client";

import { useState, useEffect, useRef } from "react";
import { useAIStore } from "@/store/useAIStore";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { toast } from "sonner";

import { MessageBubble } from "@/components/ai/MessageBubble";
import { TypingIndicator } from "@/components/ai/TypingIndicator";
import { SuggestionChip } from "@/components/ai/SuggestionChip";
import { ConversationSidebar } from "@/components/ai/ConversationSidebar";

import { API_BASE_URL } from "@/lib/api";

const SUGGESTIONS = [
  "How can I reduce my water footprint?",
  "Suggest better alternatives for my recent scans.",
  "What should I avoid buying?",
  "Give me weekly sustainability tips."
];

export default function AssistantPage() {
  const supabase = createClient();
  const [isClient, setIsClient] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    setConversations, 
    setActiveConversation, 
    addMessage, 
    updateMessageContent 
  } = useAIStore();

  useEffect(() => {
    setIsClient(true);
    const fetchHistory = async () => {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/ai/history`, { headers });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to load conversation history", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, activeConversationId]);

  const isValidUuid = (str: string | null) => {
    return str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const convId = activeConversationId;
    const isNewConversation = !convId || !isValidUuid(convId);
    
    // For new conversations, create an optimistic local ID for UI display
    // but send null to backend so it creates a real DB conversation
    let localConvId = convId;
    if (isNewConversation) {
      localConvId = uuidv4();
      setActiveConversation(localConvId);
      setConversations([{ id: localConvId, title: text.slice(0, 30) + "...", updated_at: new Date().toISOString() }, ...conversations]);
    }

    const userMessage = { id: uuidv4(), role: "user" as const, content: text, timestamp: new Date().toISOString() };
    addMessage(localConvId!, userMessage);
    setInputValue("");
    setIsStreaming(true);

    const modelMessageId = uuidv4();
    addMessage(localConvId!, { id: modelMessageId, role: "model", content: "", timestamp: new Date().toISOString() });

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          message: text, 
          conversation_id: isNewConversation ? null : convId 
        })
      });

      if (!response.ok) {
        const rawText = await response.text().catch(() => "");
        let errorDetail = `HTTP ${response.status}`;
        try {
          const parsedErr = JSON.parse(rawText);
          errorDetail = parsedErr.detail || parsedErr.message || errorDetail;
        } catch {
          if (rawText) errorDetail = rawText.slice(0, 100);
        }
        throw new Error(errorDetail);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              
              // Handle real conversation ID from backend
              if (parsed.conversation_id) {
                const realId = parsed.conversation_id;
                setActiveConversation(realId);
                // Sync conversation list item ID if it was new
                setConversations(conversations.map(c => c.id === localConvId ? { ...c, id: realId } : c));
                localConvId = realId;
              }

              if (parsed.error) {
                console.error("Backend AI Error:", parsed.error);
                toast.error("AI Error: " + parsed.error);
                updateMessageContent(localConvId!, modelMessageId, `\n\n*(Error: ${parsed.error})*`);
                setIsStreaming(false);
                break;
              }
              if (parsed.text) {
                updateMessageContent(localConvId!, modelMessageId, parsed.text);
              }
            } catch (e) {
              console.error("SSE Parse error", e, data);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error", error);
      toast.error(error.message || "Error connecting to AI Assistant");
      updateMessageContent(localConvId!, modelMessageId, `\n\n*(Error: ${error.message || "Error connecting to AI Assistant"})*`);
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isClient) return null;

  const currentMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] -mx-4 -my-6 overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 group">
        <ConversationSidebar 
          conversations={conversations} 
          activeId={activeConversationId}
          onSelect={setActiveConversation}
          onNew={() => setActiveConversation(null)}
          onDelete={(id) => {
            // Delete logic would hit backend here, and filter out locally
            setConversations(conversations.filter(c => c.id !== id));
            if (activeConversationId === id) setActiveConversation(null);
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full">
        {/* Mobile Header (New Chat) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-surface/80 backdrop-blur-md">
           <div className="flex items-center gap-2 font-semibold">
              <Bot className="w-5 h-5 text-primary" /> AquaPrint Assistant
           </div>
           <Button variant="outline" size="sm" onClick={() => setActiveConversation(null)}>New Chat</Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">AquaPrint AI Assistant</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  I can analyze your water footprint, suggest sustainable swaps, and coach you on your daily eco goals.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 max-w-2xl w-full">
                {SUGGESTIONS.map((sug, i) => (
                  <SuggestionChip key={i} label={sug} onClick={() => handleSend(sug)} />
                ))}
              </div>
            </div>
          ) : (
            currentMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          {isStreaming && <TypingIndicator />}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/40">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="flex items-center gap-2 max-w-4xl mx-auto w-full relative"
          >
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about sustainability, products, or your footprint..."
              className="pr-12 py-6 rounded-2xl bg-surface/50 border-primary/20 focus-visible:ring-primary/50"
              disabled={isStreaming}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 rounded-xl bg-primary text-on-primary"
              disabled={!inputValue.trim() || isStreaming}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
