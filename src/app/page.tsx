"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { ChatInterface } from "@/components/chat/chat-interface";
import { AuthModal } from "@/components/auth/auth-modal";
import { UnlockTransition } from "@/components/unlock-transition";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { LoadingScreen } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { 
  Shield, Heart, Brain, ArrowRight, Sparkles, MessageCircle, 
  LogIn, Users, BarChart3, Lock, Zap, Clock
} from "lucide-react";

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { user, isLoading: authLoading, isAuthenticated, initialize, enableDemoMode } = useAuthStore();
  const { fetchFeatureGate } = useFeatureGateStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFeatureGate(user.id);
    }
  }, [isAuthenticated, user, fetchFeatureGate]);

  const handleStartJourney = () => {
    enableDemoMode();
  };

  const handleLogin = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  if (authLoading) {
    return <LoadingScreen text="Preparing your space..." />;
  }

  // If authenticated, show the chat interface with navigation when unlocked
  if (isAuthenticated) {
    return (
      <>
        <ChatInterface />
        <UnlockTransition />
        <BottomNav />
      </>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Full background image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/landing-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-sage-900/80 via-sage-800/60 to-transparent" />
      
      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-sage-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header with Login */}
      <header className="relative z-20 p-4 lg:px-16">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sahara</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 border border-white/20"
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </motion.div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative flex-1 flex items-center z-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-16 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero */}
            <div className="max-w-xl">
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg"
              >
                Your caring
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sage-200">
                  AI companion
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-white/90 mb-8 max-w-lg leading-relaxed drop-shadow-md"
              >
                Start with a caring conversation. As you grow, unlock virtual pets, 
                wellness tracking, and a supportive community.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="bg-white text-sage-700 hover:bg-white/95 shadow-xl group text-base px-6 py-5 rounded-xl font-semibold w-full sm:w-auto"
                    onClick={handleStartJourney}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-white border-2 border-white/30 hover:bg-white/10 text-base px-6 py-5 rounded-xl font-semibold w-full sm:w-auto"
                    onClick={handleLogin}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    I have an account
                  </Button>
                </motion.div>
              </motion.div>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {[
                  { icon: Shield, text: "Private & Secure" },
                  { icon: Heart, text: "Compassionate AI" },
                  { icon: Brain, text: "Personalized Support" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/25"
                  >
                    <item.icon className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Features Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Unlock as you grow
                </h3>
                
                <div className="space-y-3">
                  {[
                    { icon: MessageCircle, title: "AI Chat Companion", desc: "24/7 supportive conversations", unlocked: true },
                    { icon: Heart, title: "Virtual Pet Companion", desc: "Your wellness buddy", locked: true },
                    { icon: BarChart3, title: "Wellness Dashboard", desc: "Track your progress", locked: true },
                    { icon: Users, title: "Community Support", desc: "Connect with others", locked: true },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        feature.unlocked ? 'bg-white/20' : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feature.unlocked ? 'bg-sage-500' : 'bg-white/10'
                      }`}>
                        {feature.locked ? (
                          <Lock className="w-5 h-5 text-white/50" />
                        ) : (
                          <feature.icon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${feature.unlocked ? 'text-white' : 'text-white/60'}`}>
                          {feature.title}
                        </p>
                        <p className={`text-sm ${feature.unlocked ? 'text-white/70' : 'text-white/40'}`}>
                          {feature.desc}
                        </p>
                      </div>
                      {feature.unlocked && (
                        <span className="text-xs bg-sage-500 text-white px-2 py-1 rounded-full">
                          Available
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Complete 10 conversations to unlock all features</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-4 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <p className="text-sm text-white/60 text-center">
            Sahara is designed to support your wellness journey, not replace professional mental health care.
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </div>
  );
}
