"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { ChatMessage, TypingIndicator } from "./chat-message";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";
import { Sparkles, Lock, Heart, Star, Gift, Dog, MessageCircle } from "lucide-react";

export function ChatInterface() {
  const { user } = useAuthStore();
  const { messages, isSending, sendMessage, startSession } = useChatStore();
  const { completedChats, isFullyUnlocked, fetchFeatureGate } = useFeatureGateStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchFeatureGate(user.id);
      startSession(user.id);
    }
  }, [user, fetchFeatureGate, startSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (user) {
      sendMessage(content, user.id);
    }
  };

  const remainingChats = Math.max(0, 10 - completedChats);
  const progressPercent = (completedChats / 10) * 100;

  return (
    <div className={cn(
      "flex flex-col h-screen bg-gradient-to-b from-slate-50 via-white to-sage-50/30",
      isFullyUnlocked && "pb-16"
    )}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d5a6b] to-[#4a9ab0] flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Luna AI</h1>
              <p className="text-xs text-slate-500">Mental wellness companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full border border-sage-100">
            <Heart className="w-4 h-4 text-sage-600" />
            <span className="text-sm font-semibold text-sage-700">{completedChats}/10</span>
          </div>
        </div>
      </header>

      {/* Progress Banner */}
      {!isFullyUnlocked && (
        <div className="flex-shrink-0 px-4 py-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-sage-50 to-emerald-50 rounded-2xl p-4 border border-sage-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-sage-600" />
                <span className="text-sm font-medium text-sage-700">Unlock more features</span>
              </div>
              <span className="text-sm font-bold text-sage-600">{completedChats}/10 chats</span>
            </div>
            <div className="h-2 bg-sage-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-sage-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs text-sage-600 mt-2">
              {remainingChats > 0 ? `${remainingChats} more chat${remainingChats === 1 ? '' : 's'} to unlock pets, dashboard & community!` : "All features unlocked! 🎉"}
            </p>
            <div className="mt-3 flex items-center justify-center gap-4">
              {[{ icon: Dog, label: "Pets" }, { icon: Star, label: "Dashboard" }, { icon: Sparkles, label: "Community" }].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 opacity-50">
                  <div className="w-8 h-8 rounded-lg bg-sage-200 flex items-center justify-center relative">
                    <item.icon className="w-4 h-4 text-sage-500" />
                    <Lock className="w-3 h-3 text-sage-600 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-[10px] text-sage-500">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-10 h-10 text-sage-600" />
            </div>
            <h2 className="text-slate-800 text-xl font-semibold mb-3">Hi there, I&apos;m so glad you&apos;re here 💚</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-md">
              I&apos;m Sahara, your wellness companion. I&apos;m here to listen without judgment. Whatever you&apos;re feeling right now is valid.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1.5 bg-sage-50 text-sage-600 text-xs rounded-full font-medium">Safe space</span>
              <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs rounded-full font-medium">No judgment</span>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">Always here</span>
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} isLatest={index === messages.length - 1} />
            ))}
            <AnimatePresence>
              {isSending && <TypingIndicator />}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} disabled={isSending} placeholder="Share what's on your mind..." />
    </div>
  );
}
