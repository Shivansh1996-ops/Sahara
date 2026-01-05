"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const quickResponses = [
  "I'm feeling overwhelmed today 😔",
  "I need someone to talk to 💙",
  "Help me feel calmer 🧘",
  "I'm struggling with anxiety 😰",
  "I had a good day today ✨",
  "I'm feeling lonely 💭",
];

export function ChatInput({ onSend, disabled = false, placeholder = "Share what's on your mind..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
      setShowQuickResponses(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    setShowQuickResponses(false);
    textareaRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 bg-white/80 backdrop-blur-xl border-t border-white/50"
      role="form"
      aria-label="Chat message form"
    >
      {/* Quick Responses */}
      <AnimatePresence>
        {showQuickResponses && !message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60"
          >
            <p className="text-xs text-slate-500 mb-3 font-bold">Quick responses</p>
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((response, index) => (
                <motion.button
                  key={response}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuickResponse(response)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-violet-50 to-pink-50 hover:from-violet-100 hover:to-pink-100 text-slate-700 rounded-full transition-all border border-violet-100 font-medium"
                >
                  {response}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "flex items-end gap-3 p-3 rounded-3xl border-2 transition-all duration-300",
        isFocused 
          ? "border-violet-300 bg-white shadow-xl shadow-violet-100/50" 
          : "border-slate-200/80 bg-white/80"
      )}>
        {/* Sparkle button for quick responses */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowQuickResponses(!showQuickResponses)}
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200",
            showQuickResponses 
              ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg" 
              : "bg-gradient-to-br from-violet-100 to-pink-100 text-violet-500 hover:from-violet-200 hover:to-pink-200"
          )}
          aria-label="Quick responses"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>

        <div className="flex-1 relative">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Message input"
            className={cn(
              "w-full resize-none bg-transparent px-2 py-2",
              "text-slate-800 placeholder:text-slate-400",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "text-base leading-relaxed"
            )}
          />
        </div>
        
        <div className="flex items-center gap-2 pb-0.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            type="button"
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl",
              "transition-all duration-300",
              message.trim() 
                ? "bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-200/60" 
                : "bg-slate-200 text-slate-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </motion.button>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 mt-3">
        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
        <p className="text-xs text-slate-400 font-medium">
          Press Enter to send • Shift+Enter for new line
        </p>
        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
      </div>
    </motion.div>
  );
}
