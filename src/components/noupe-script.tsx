"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export function NoupeScript() {
  const pathname = usePathname();
  const isOnChatPage = pathname === "/chat";

  // Hide widgets when navigating to chat page
  useEffect(() => {
    if (isOnChatPage) {
      // Aggressively hide all floating widgets on chat page
      const hideAllWidgets = () => {
        const selectors = [
          'body > div[style*="position: fixed"]',
          'body > div[style*="position:fixed"]',
          'div[style*="z-index: 2147483647"]',
          'div[style*="z-index:2147483647"]',
          'iframe[style*="position: fixed"]',
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const element = el as HTMLElement;
            // Don't hide elements inside our chat container
            if (!element.closest('.luna-chat-container')) {
              element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
            }
          });
        });
      };
      
      hideAllWidgets();
      const interval = setInterval(hideAllWidgets, 200);
      
      return () => clearInterval(interval);
    }
  }, [isOnChatPage]);

  useEffect(() => {
    // Skip loading on chat page - Luna is embedded there directly
    if (isOnChatPage) return;

    console.log("🤖 JotForm AI: Loading chat widget...");
    
    // Create overlay to hide Jotform branding
    const hideJotformBranding = () => {
      // Find the chat widget iframe/container
      const chatContainers = document.querySelectorAll('iframe[src*="jotform"], div[style*="position: fixed"]');
      
      chatContainers.forEach((container) => {
        const el = container as HTMLElement;
        const parent = el.parentElement;
        
        if (parent && !parent.querySelector('.jf-brand-cover')) {
          // Create a cover div for the branding
          const cover = document.createElement('div');
          cover.className = 'jf-brand-cover';
          cover.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 45px;
            background: linear-gradient(to right, #2d5a6b, #3a6d7d);
            z-index: 999999;
            pointer-events: none;
            border-radius: 0 0 12px 12px;
          `;
          
          // Make parent relative if not already
          if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
          }
          
          parent.appendChild(cover);
        }
      });
    };

    // Run periodically to catch the widget when it loads
    const interval = setInterval(hideJotformBranding, 500);
    
    // Also run on any DOM changes
    const observer = new MutationObserver(hideJotformBranding);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Cleanup after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [isOnChatPage]);

  // Don't render the floating widget on the chat page
  if (isOnChatPage) {
    return null;
  }

  return (
    <>
      <Script 
        src="https://cdn.jotfor.ms/agent/embedjs/019b97eb152d773f9abd1300d26b6038d8ca/embed.js" 
        strategy="afterInteractive"
        onLoad={() => console.log("🤖 JotForm AI: Script loaded")}
        onError={(e) => console.error("🔴 JotForm AI: Script failed", e)}
      />
      <style jsx global>{`
        /* Position chat widget */
        body > div[style*="position: fixed"][style*="z-index"] {
          right: 20px !important;
          left: auto !important;
          transform: none !important;
          bottom: 80px !important;
        }
        
        iframe[style*="position: fixed"] {
          right: 20px !important;
          left: auto !important;
          transform: none !important;
          bottom: 80px !important;
        }
        
        /* Cover branding in open chat window */
        div[style*="position: fixed"] > div:last-child,
        div[style*="z-index: 2147483647"] {
          position: relative;
        }
        
        /* Create pseudo-element to cover branding */
        div[style*="z-index: 2147483647"]::after {
          content: '';
          position: fixed;
          bottom: 130px;
          right: 20px;
          width: 370px;
          height: 50px;
          background: linear-gradient(to right, #2d5a6b, #3a6d7d);
          z-index: 2147483648;
          pointer-events: none;
          border-radius: 0 0 12px 12px;
        }
        
        /* Hide any visible branding text */
        [class*="powered" i],
        [class*="brand" i]:not([class*="brand-cover"]),
        a[href*="jotform.com"],
        span:has(> a[href*="jotform"]),
        div:has(> a[href*="jotform"]):not(:has(input)):not(:has(button)) {
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
}
