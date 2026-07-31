import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  messages: Record<string, AIMessage[]>; // keyed by conversationId
  
  setConversations: (conversations: AIConversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: AIMessage) => void;
  setMessages: (conversationId: string, messages: AIMessage[]) => void;
  updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      messages: {},

      setConversations: (conversations) => set({ conversations }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      addMessage: (conversationId, message) => set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        // prevent duplicate IDs (especially during optimistic updates)
        if (currentMessages.find(m => m.id === message.id)) return state;
        
        return {
          messages: {
            ...state.messages,
            [conversationId]: [...currentMessages, message]
          }
        };
      }),
      
      setMessages: (conversationId, messages) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages
        }
      })),
      
      updateMessageContent: (conversationId, messageId, content) => set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: currentMessages.map(m => 
              m.id === messageId ? { ...m, content: m.content + content } : m
            )
          }
        };
      })
    }),
    {
      name: 'aquaprint-ai-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
