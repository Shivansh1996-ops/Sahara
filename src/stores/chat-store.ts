import { create } from "zustand";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { analyzeUserMessage, generateTherapeuticResponse, getSuggestedAnimation } from "@/lib/therapeutic-ai";
import type { ChatMessage, ChatSession, PetAnimationState } from "@/types";

function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface ChatState {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  petAnimation: PetAnimationState;
  demoMessageCount: number;
  
  // Actions
  startSession: (userId: string) => Promise<void>;
  endSession: () => Promise<void>;
  sendMessage: (content: string, userId: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  setPetAnimation: (animation: PetAnimationState) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  petAnimation: "idle",
  demoMessageCount: 0,

  startSession: async (userId: string) => {
    // Demo mode - create local session
    if (isDemoMode()) {
      set({
        currentSession: {
          id: generateId(),
          userId,
          startedAt: new Date(),
          endedAt: null,
          messageCount: 0,
          isCompleted: false,
        },
        messages: [],
        isLoading: false,
      });
      return;
    }

    const supabase = createClient();
    
    set({ isLoading: true });
    
    try {
      // Check for existing active session
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();
      
      if (existingSession) {
        set({
          currentSession: {
            id: existingSession.id,
            userId: existingSession.user_id,
            startedAt: new Date(existingSession.started_at),
            endedAt: existingSession.ended_at ? new Date(existingSession.ended_at) : null,
            messageCount: existingSession.message_count,
            isCompleted: existingSession.is_completed,
          },
        });
        await get().loadMessages(existingSession.id);
        return;
      }
      
      // Create new session
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
          message_count: 0,
          is_completed: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set({
        currentSession: {
          id: data.id,
          userId: data.user_id,
          startedAt: new Date(data.started_at),
          endedAt: null,
          messageCount: 0,
          isCompleted: false,
        },
        messages: [],
      });
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  endSession: async () => {
    const { currentSession, messages } = get();
    
    if (!currentSession) return;
    
    // Demo mode - just clear local state
    if (isDemoMode()) {
      set({ currentSession: null, messages: [] });
      return;
    }

    const supabase = createClient();
    
    // Only mark as completed if there are enough messages
    const isCompleted = messages.length >= 6; // At least 3 exchanges
    
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({
          ended_at: new Date().toISOString(),
          is_completed: isCompleted,
          message_count: messages.length,
        })
        .eq("id", currentSession.id);
      
      if (error) throw error;
      
      // If completed, increment the feature gate counter
      if (isCompleted) {
        await supabase.rpc("increment_completed_chats", {
          p_user_id: currentSession.userId,
        });
      }
      
      set({ currentSession: null, messages: [] });
    } catch (error) {
      console.error("Error ending session:", error);
    }
  },

  loadMessages: async (sessionId: string) => {
    // Demo mode - no messages to load
    if (isDemoMode()) {
      return;
    }

    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      set({
        messages: data.map((msg) => ({
          id: msg.id,
          sessionId: msg.session_id,
          userId: msg.user_id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
          emotionalKeywords: msg.emotional_keywords,
          createdAt: new Date(msg.created_at),
        })),
      });
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  },

  sendMessage: async (content: string, userId: string) => {
    const { currentSession, messages, demoMessageCount } = get();
    
    if (!currentSession) {
      await get().startSession(userId);
    }
    
    const session = get().currentSession;
    if (!session) return;
    
    set({ isSending: true, petAnimation: "thinking" });
    
    // Demo mode - handle locally with therapeutic AI responses
    if (isDemoMode()) {
      const newUserMessage: ChatMessage = {
        id: generateId(),
        sessionId: session.id,
        userId,
        content,
        role: "user",
        emotionalKeywords: null,
        createdAt: new Date(),
      };
      
      set({ messages: [...get().messages, newUserMessage] });
      
      // Get conversation history for context
      const conversationHistory = messages.map(m => m.content);
      
      // Analyze the user's message for emotional content
      const analysis = analyzeUserMessage(content, conversationHistory);
      
      // Simulate AI thinking delay (longer for more thoughtful responses)
      const thinkingTime = analysis.intensity === 'high' ? 2000 : 1500;
      await new Promise(resolve => setTimeout(resolve, thinkingTime + Math.random() * 500));
      
      // Generate a therapeutic response based on emotional analysis
      const aiContent = generateTherapeuticResponse(
        content,
        analysis,
        messages.map(m => ({ role: m.role, content: m.content }))
      );
      
      // Get appropriate pet animation based on the emotional analysis
      const suggestedAnimation = getSuggestedAnimation(analysis) as PetAnimationState;
      
      const newAiMessage: ChatMessage = {
        id: generateId(),
        sessionId: session.id,
        userId,
        content: aiContent,
        role: "assistant",
        emotionalKeywords: analysis.themes.length > 0 ? analysis.themes : null,
        createdAt: new Date(),
      };
      
      // Increment demo message count (counts each exchange as 1)
      const newCount = demoMessageCount + 1;
      
      set({
        messages: [...get().messages, newAiMessage],
        petAnimation: suggestedAnimation,
        isSending: false,
        demoMessageCount: newCount,
      });
      
      // Reset animation after a delay
      setTimeout(() => {
        set({ petAnimation: "idle" });
      }, 4000);
      
      return;
    }

    // Real mode with Supabase
    const supabase = createClient();
    
    try {
      // Save user message
      const { data: userMsg, error: userError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: session.id,
          user_id: userId,
          content,
          role: "user",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (userError) throw userError;
      
      const newUserMessage: ChatMessage = {
        id: userMsg.id,
        sessionId: userMsg.session_id,
        userId: userMsg.user_id,
        content: userMsg.content,
        role: "user",
        emotionalKeywords: null,
        createdAt: new Date(userMsg.created_at),
      };
      
      set({ messages: [...messages, newUserMessage] });
      
      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get AI response");
      
      const aiResponse = await response.json();
      
      // Save AI message
      const { data: aiMsg, error: aiError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: session.id,
          user_id: userId,
          content: aiResponse.content,
          role: "assistant",
          emotional_keywords: aiResponse.emotionalKeywords || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (aiError) throw aiError;
      
      const newAiMessage: ChatMessage = {
        id: aiMsg.id,
        sessionId: aiMsg.session_id,
        userId: aiMsg.user_id,
        content: aiMsg.content,
        role: "assistant",
        emotionalKeywords: aiMsg.emotional_keywords,
        createdAt: new Date(aiMsg.created_at),
      };
      
      set({
        messages: [...get().messages, newAiMessage],
        petAnimation: aiResponse.suggestedAnimation || "happy",
      });
      
      // Update message count
      await supabase
        .from("chat_sessions")
        .update({ message_count: get().messages.length })
        .eq("id", session.id);
      
      // Reset animation after a delay
      setTimeout(() => {
        set({ petAnimation: "idle" });
      }, 3000);
      
    } catch (error) {
      console.error("Error sending message:", error);
      set({ petAnimation: "idle" });
    } finally {
      set({ isSending: false });
    }
  },

  setPetAnimation: (animation: PetAnimationState) => {
    set({ petAnimation: animation });
  },

  clearChat: () => {
    set({
      currentSession: null,
      messages: [],
      petAnimation: "idle",
      demoMessageCount: 0,
    });
  },
}));
