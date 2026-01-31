"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Hide any floating chat widgets when on this page
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "luna-page-hide-widget";
    style.textContent = `
      /* Hide ALL floating widgets on Luna page */
      body > div[style*="position: fixed"],
      body > div[style*="position:fixed"],
      div[style*="z-index: 2147483647"],
      div[style*="z-index:2147483647"],
      [data-jotform-embed],
      .jotform-widget,
      iframe[style*="position: fixed"],
      iframe[style*="position:fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
    document.head.appendChild(style);

    // Also try to remove widget elements directly
    const hideWidgets = () => {
      const widgets = document.querySelectorAll('body > div[style*="position: fixed"], body > div[style*="z-index: 2147483647"]');
      widgets.forEach(w => {
        if (!w.closest('.luna-chat-container')) {
          (w as HTMLElement).style.display = 'none';
        }
      });
    };
    
    hideWidgets();
    const interval = setInterval(hideWidgets, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      const el = document.getElementById("luna-page-hide-widget");
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg)] luna-chat-container" style={{ paddingBottom: "64px" }}>
      {/* Compact Header */}
      <header className="flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shadow-md">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              Luna
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[var(--primary)] rounded text-white">
                AI
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Mental Wellness Companion</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Online</span>
          </div>
        </div>
      </header>

      {/* Luna Chat Embed - Full Height */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg)] z-20"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative mb-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-2xl bg-[var(--bg)] flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                </div>
              </motion.div>
              <p className="text-[var(--primary)] font-medium text-sm">Connecting to Luna...</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <iframe
          src="https://www.jotform.com/agent/019b97eb152d773f9abd1300d26b6038d8ca"
          className="w-full h-full border-none"
          allow="microphone; camera"
          onLoad={() => setIsLoading(false)}
          title="Luna AI Chat"
        />
      </div>
    </div>
  );
}
