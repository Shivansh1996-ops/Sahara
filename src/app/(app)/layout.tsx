"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { usePetStore } from "@/stores/pet-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { UnlockTransition } from "@/components/unlock-transition";
import { EmergencyButton } from "@/components/crisis/emergency-button";
import { LoadingScreen } from "@/components/ui/loading";
import { NoupeScript } from "@/components/noupe-script";

// Pages that require unlock (10 chats completed)
const LOCKED_PAGES = ["/pets", "/dashboard", "/tools", "/assessments", "/community", "/consult", "/profile"];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticated, initialize } = useAuthStore();
  const { fetchPets, fetchUserPet } = usePetStore();
  const { fetchFeatureGate, isFullyUnlocked } = useFeatureGateStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch data in background - don't block rendering
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch feature gate immediately
      fetchFeatureGate(user.id);
      
      // Fetch pets in background (non-blocking)
      setTimeout(() => {
        fetchPets();
        fetchUserPet(user.id);
      }, 0);
    }
  }, [isAuthenticated, user, fetchPets, fetchUserPet, fetchFeatureGate]);

  // Only show loading on initial auth check
  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render immediately - don't wait for feature gate
  return (
    <div className={`relative min-h-screen overflow-hidden ${isFullyUnlocked ? 'pb-20' : ''}`}>
      {/* Beautiful Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Video-like gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-[0.03] dark:opacity-100" />
        
        {/* Main background with warm tones - light mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf9f7] via-[#f5f3f0] to-[#ebe8e4] dark:from-[#0f1419] dark:via-[#151c24] dark:to-[#1a2128]" />
        
        {/* Animated aurora-like gradients */}
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-40 dark:opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(74,154,176,0.15) 0%, rgba(74,154,176,0.05) 40%, transparent 70%)',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,122,92,0.12) 0%, rgba(255,122,92,0.04) 40%, transparent 70%)',
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
            animation: 'float 30s ease-in-out infinite',
            animationDelay: '5s',
          }}
        />
        
        {/* Flowing wave patterns */}
        <svg className="absolute bottom-0 left-0 right-0 h-64 opacity-[0.04]" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#2d5a6b" d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L0,320Z;
              M0,96L48,117.3C96,139,192,181,288,192C384,203,480,181,576,149.3C672,117,768,75,864,85.3C960,96,1056,160,1152,181.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L0,320Z;
              M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,117.3C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L0,320Z"
            />
          </path>
        </svg>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[var(--primary)]/10"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particleFloat ${15 + Math.random() * 20}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(74,154,176,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(74,154,176,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Light beam effects */}
        <div 
          className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-transparent dark:via-[var(--primary)]/10"
          style={{ animation: 'beamMove 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent dark:via-[var(--accent)]/10"
          style={{ animation: 'beamMove 12s ease-in-out infinite reverse' }}
        />
        
        {/* Noise texture overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-10px, 20px) scale(0.95); }
          75% { transform: translate(30px, 10px) scale(1.02); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-50px) translateX(20px); opacity: 0.6; }
          50% { transform: translateY(-100px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-50px) translateX(30px); opacity: 0.5; }
        }
        @keyframes beamMove {
          0%, 100% { opacity: 0; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(50px); }
        }
      `}</style>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      <BottomNav />
      <UnlockTransition />
      <EmergencyButton />
      <NoupeScript />
    </div>
  );
}
