"use client";

import { motion } from "framer-motion";
import { cn, formatTime } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { Sparkles, User, Leaf } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for AI */}
      {!isUser && (
        <motion.div 
          initial={isLatest ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-200"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      )}

      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-3xl px-5 py-4 relative",
          isUser
            ? "bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-br-lg shadow-lg shadow-sage-200/50"
            : "bg-white/90 backdrop-blur-sm text-slate-700 rounded-bl-lg shadow-lg shadow-slate-100/50 border border-sage-100/60"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-sage-600">Sahara</span>
            <Leaf className="w-3 h-3 text-sage-500" />
          </div>
        )}
        <p className={cn(
          "text-[15px] leading-relaxed whitespace-pre-wrap",
          isUser ? "text-white" : "text-slate-700"
        )}>
          {message.content}
        </p>
        <p
          className={cn(
            "text-[10px] mt-2.5 text-right font-medium",
            isUser ? "text-white/60" : "text-slate-400"
          )}
        >
          {formatTime(message.createdAt)}
        </p>
        
        {/* Decorative gradient overlay for user messages */}
        {isUser && (
          <div className="absolute inset-0 rounded-3xl rounded-br-lg bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        )}
      </div>

      {/* Avatar for User */}
      {isUser && (
        <motion.div 
          initial={isLatest ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg"
        >
          <User className="w-5 h-5 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start gap-3"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-200"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </motion.div>
      
      <div className="bg-white/90 backdrop-blur-sm border border-sage-100/60 rounded-3xl rounded-bl-lg px-5 py-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sage-600 mr-2">
            Sahara is thinking
          </span>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
              animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
              animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-sage-400 to-sage-500"
              animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
