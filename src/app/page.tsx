"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, MessageCircle, Users, 
  ChevronRight, Shield, Heart, Brain, Clock, Leaf,
  Sparkles, LogOut, LayoutDashboard, Lock, Smile, Phone, Lightbulb, BarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { initialize, isAuthenticated, signOut } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => initialize(), 0);
  }, [initialize]);

  // Keep background video playing when user returns to tab
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mounted]);

  // Play ocean waves audio only when hero section (with ocean video) is visible
  useEffect(() => {
    if (!mounted) return;
    
    const audio = audioRef.current;
    const heroSection = heroSectionRef.current;
    if (!audio || !heroSection) return;

    // Set audio properties
    audio.loop = true;
    audio.volume = 0.3; // Gentle background volume

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hero section is visible - play audio
            audio.play().catch(() => {
              // Auto-play may be blocked, user needs to interact first
              console.log("Audio autoplay blocked - will play on user interaction");
            });
          } else {
            // Hero section is not visible - pause audio
            audio.pause();
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of hero section is visible
      }
    );

    observer.observe(heroSection);

    // Also handle tab visibility
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        audio.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      audio.pause();
    };
  }, [mounted]);

  const handleStartJourney = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navigation - Semi-transparent with blur */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#1a3a4a]/85 dark:bg-[#0f1419]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Sahara</span>
          </Link>
          
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {mounted && isAuthenticated ? (
              <>
                <button
                  onClick={handleGoToDashboard}
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <Button 
                  onClick={handleLogout} 
                  className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 h-9 text-sm font-medium border border-white/20 transition-all"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <Button 
                  onClick={handleStartJourney}
                  className="bg-white text-[var(--primary-dark)] hover:bg-white/95 rounded-lg px-5 h-9 text-sm font-semibold shadow-lg shadow-black/10 transition-all"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Ocean Waves Audio - plays when hero section is visible */}
      <audio ref={audioRef} preload="auto">
        <source src="/audio/ocean-waves.mp3" type="audio/mpeg" />
      </audio>

      {/* Hero Section with Video Background */}
      <section ref={heroSectionRef} className="relative min-h-screen pt-16 overflow-hidden">
        {/* Video Background - runs continuously */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover scale-105"
            onEnded={() => {
              const v = videoRef.current;
              if (v) {
                v.currentTime = 0;
                v.play().catch(() => {});
              }
            }}
          >
            <source 
              src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4" 
              type="video/mp4" 
            />
          </video>
          {/* Premium overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a3a4a]/70 via-[#1a3a4a]/50 to-[#1a3a4a]/60" />
          {/* Additional radial gradient for depth */}
          <div className="absolute inset-0 bg-radial-gradient" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(26,58,74,0.3) 100%)'
          }} />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 lg:py-36 min-h-[90vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Overline – problem & value prop */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="section-overline on-dark inline-flex items-center gap-2 text-white text-lg sm:text-xl">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)]" />
                Anonymous Emotional Support
              </span>
            </div>
            <p className="text-white/90 text-base sm:text-lg mb-6 max-w-[42ch] mx-auto font-light" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              People avoid seeking mental health help—we&apos;re here to change that.
            </p>
            
            <h1 
              className="text-white mb-6 text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
            >
              <span className="font-light text-white">Your Space for </span>
              <br className="hidden sm:block" />
              <span className="relative inline-block font-semibold text-[var(--accent)] drop-shadow-lg">
                Healing
                <svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  height="14" 
                  viewBox="0 0 120 14" 
                  preserveAspectRatio="none"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                >
                  <path 
                    d="M2 9 Q 15 3, 30 8 T 60 6 T 90 9 T 118 5" 
                    stroke="var(--accent)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path 
                    d="M5 10 Q 20 5, 40 9 T 80 7 T 115 9" 
                    stroke="var(--accent)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              </span>
              <span className="text-white font-light"> & </span>
              <span className="relative inline-block font-semibold text-[var(--accent)] drop-shadow-lg">
                Growth
                <svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  height="14" 
                  viewBox="0 0 100 14" 
                  preserveAspectRatio="none"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                >
                  <path 
                    d="M2 6 Q 12 10, 25 5 T 50 8 T 75 5 T 98 9" 
                    stroke="var(--accent)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path 
                    d="M4 7 Q 18 4, 35 9 T 65 6 T 96 8" 
                    stroke="var(--accent)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-body-lg text-lg sm:text-xl text-white/90 mb-10 max-w-[44ch] mx-auto font-light"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)', lineHeight: '1.6' }}
            >
              Chat anytime. Get <strong className="text-white font-medium">mood detection</strong>, a <strong className="text-white font-medium">stress score</strong>, 
              personalized <strong className="text-white font-medium">suggestions</strong>, and instant access to <strong className="text-white font-medium">helplines</strong>—all anonymous.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            >
              {mounted && isAuthenticated ? (
                <>
                  <Button 
                    onClick={handleGoToDashboard}
                    className="bg-white text-[#2d5a6b] hover:bg-[#f8f6f3] rounded-full px-10 h-14 text-lg font-semibold shadow-2xl shadow-black/20 hover:shadow-xl transition-all group"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white border-2 border-white/40 hover:bg-white/10 hover:border-white/60 rounded-full px-10 h-14 text-lg font-medium backdrop-blur-sm"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleStartJourney}
                    className="bg-white text-[#2d5a6b] hover:bg-[#f8f6f3] rounded-full px-10 h-14 text-lg font-semibold shadow-2xl shadow-black/20 hover:shadow-xl transition-all group"
                  >
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={handleLogin}
                    variant="ghost"
                    className="text-white border-2 border-white/40 hover:bg-white/10 hover:border-white/60 rounded-full px-10 h-14 text-lg font-medium backdrop-blur-sm"
                  >
                    I Have an Account
                  </Button>
                </>
              )}
            </motion.div>
            
            {/* Trust indicators – caption hierarchy */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 md:gap-12"
            >
              {[
                { icon: Shield, text: "Anonymous Support" },
                { icon: Lock, text: "Secure & Private" },
                { icon: Phone, text: "24/7 Helplines" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 text-caption text-white/90 font-medium"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section – centered, clean grid */}
      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-[var(--bg)] to-[var(--card)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Centered Header */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
              Features & Requirements
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text)] mb-4">
              Everything You Need for <span className="text-[var(--primary)]">Emotional Support</span>
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto" style={{ lineHeight: '1.7' }}>
              Our Mental Health Chatbot delivers the core features: chat, mood detection, stress score, suggestions, and helplines—all anonymous.
            </p>
          </motion.header>
          
          {/* 3-column feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: MessageCircle, title: "Chat Interface", desc: "A safe, anonymous chat to share what you feel. Talk anytime—no judgment, no real names.", color: "var(--primary)" },
              { icon: Brain, title: "Mood Detection", desc: "AI-powered mood detection that understands how you feel and helps you name your emotions.", color: "var(--accent)" },
              { icon: BarChart3, title: "Stress Score", desc: "Get a clear stress score and wellness snapshot so you can track progress and spot patterns.", color: "var(--primary-light)" },
              { icon: Lightbulb, title: "Suggestions", desc: "Personalized, actionable suggestions—grounding, coping, and next steps tailored to you.", color: "var(--primary)" },
              { icon: Phone, title: "Helplines", desc: "Instant access to crisis helplines and resources when you need someone to talk to, 24/7.", color: "var(--accent)" },
              { icon: Users, title: "Talk with Luna", desc: "Chat directly with Luna, our AI companion—available after sign-in to support you anytime.", color: "var(--primary-light)" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)] hover:shadow-xl hover:shadow-[var(--primary)]/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `color-mix(in srgb, ${feature.color} 12%, transparent)` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works – clean centered section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[var(--card)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-alt)]/50 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-3">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text)]">
              Simple Steps to <span className="text-[var(--primary)]">Get Started</span>
            </h2>
          </motion.header>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: "01", title: "Create Your Profile", desc: "Sign up with your email. You'll receive a unique Sahara ID to protect your privacy.", icon: Shield },
              { step: "02", title: "Set Your Preferences", desc: "Tell us about yourself so we can personalize your experience.", icon: Heart },
              { step: "03", title: "Talk with Luna", desc: "After signing in, chat with Luna AI, track your mood, get your stress score, and access helplines—all at your pace.", icon: MessageCircle },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-[var(--bg)] rounded-2xl p-6 md:p-8 border border-[var(--border)] text-center"
              >
                <span className="text-5xl md:text-6xl font-bold text-[var(--primary)]/10 absolute top-4 right-4 tabular-nums" aria-hidden="true">
                  {item.step}
                </span>
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-[var(--card)] to-[var(--bg)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent mb-3">
                Your Privacy Matters
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">Anonymous Emotional Support</span>
              </h2>
              <p className="text-lg text-[var(--text-muted)] mb-2">No judgment. No real names.</p>
              <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
                We built Sahara because people avoid seeking mental health help. Here, support is private and anonymous:
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Anonymous emotional support—use your unique Sahara ID",
                  "Your data stays on your device or is encrypted",
                  "We never sell or share your personal information",
                  "You control what you share and when",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#22c55e]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    </div>
                    <span className="text-[var(--text-muted)]">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={handleStartJourney}
                className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-[var(--primary)]/20"
              >
                Get Started Securely <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 bg-[#3d4a7a]"
            >
              <img 
                src="/mental-health-matters.png"
                alt="Mental Health Matters - You are not alone"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-[var(--primary)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
              Begin Your <span className="text-white/90">Anonymous Support</span> Journey
            </h2>
            <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
              People avoid seeking help—you don&apos;t have to. Chat with Luna, get your mood & stress score, suggestions, and helplines—all anonymous.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartJourney}
                className="bg-white text-[var(--primary-dark)] hover:bg-white/95 rounded-full px-10 h-14 text-lg font-semibold shadow-xl"
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={handleLogin}
                variant="ghost"
                className="text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/50 rounded-full px-10 h-14 text-lg"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-[var(--bg-alt)]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Important Notice</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Sahara is a self-help wellness tool and is <strong className="text-[var(--text)]">not a substitute for professional medical advice</strong>. 
                  If you are experiencing a crisis, please contact emergency services or a crisis helpline immediately. 
                  Luna AI provides supportive conversations but is not a licensed therapist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 bg-[var(--footer-bg)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Sahara</span>
              </div>
              <p className="text-sm text-white/50 mb-2">Mental Health Chatbot · Anonymous Emotional Support</p>
              <p className="text-xs text-white/30">HealthTech · MedAI & Diagnostics · ItqHub</p>
            </div>
            
            {/* Features */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>Chat with Luna</li>
                <li>Mood Detection</li>
                <li>Stress Score</li>
                <li>Helplines</li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>support@sahara.app</li>
                <li>Crisis: 988 (US)</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-white/30">© 2024 Sahara · PI12 · HealthTech, MedAI & Diagnostics · ItqHub</p>
          </div>
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
