"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Heart, Users, LayoutDashboard, Leaf, Zap, PartyPopper, Stethoscope, Gift } from "lucide-react";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Button } from "@/components/ui/button";

export function UnlockTransition() {
  const router = useRouter();
  const { showUnlockTransition, dismissUnlockTransition } = useFeatureGateStore();

  const handleContinue = () => {
    dismissUnlockTransition();
    router.push("/pets");
  };

  return (
    <AnimatePresence>
      {showUnlockTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Nature-inspired gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-sage-600 via-sage-500 to-emerald-600" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            {/* Confetti particles */}
            <Confetti />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative max-w-md mx-4 text-center z-10"
          >
            {/* Celebration header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <motion.div
                animate={{ rotate: [-15, 15, -15], y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <PartyPopper className="w-10 h-10 text-amber-300" />
              </motion.div>
              <span className="text-2xl font-bold text-white">Congratulations!</span>
              <motion.div
                animate={{ rotate: [15, -15, 15], y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <PartyPopper className="w-10 h-10 text-amber-300 scale-x-[-1]" />
              </motion.div>
            </motion.div>

            {/* Celebration Icon */}
            <motion.div
              initial={{ y: 20, scale: 0 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30 blur-2xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ transform: "translate(-15%, -15%)", width: "130%", height: "130%" }}
                />
                
                {/* Main celebration icon */}
                <motion.div
                  className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-sage-400 flex items-center justify-center shadow-2xl"
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Gift className="w-20 h-20 text-white" />
                </motion.div>
                
                {/* Sparkles around icon */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 70}%`,
                      left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 70}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                  >
                    {i % 2 === 0 ? (
                      <Sparkles className="w-8 h-8 text-amber-300" />
                    ) : (
                      <Zap className="w-7 h-7 text-yellow-300" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                You&apos;ve unlocked everything! 🎉
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Amazing job completing 10 conversations! All features are now available.
              </p>
            </motion.div>

            {/* Unlocked Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              {[
                { icon: Heart, label: "Virtual Pets", color: "from-rose-400 to-pink-500", delay: 0.8 },
                { icon: LayoutDashboard, label: "Wellness Dashboard", color: "from-emerald-400 to-teal-500", delay: 0.9 },
                { icon: Stethoscope, label: "Consultations", color: "from-amber-400 to-orange-500", delay: 1.0 },
                { icon: Users, label: "Community", color: "from-sage-400 to-emerald-500", delay: 1.1 },
              ].map(({ icon: Icon, label, color, delay }) => (
                <motion.div
                  key={label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay, type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center gap-2 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30"
                >
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <span className="text-sm font-semibold text-white">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="xl" 
                  onClick={handleContinue} 
                  className="bg-white text-sage-700 hover:bg-white/90 shadow-2xl font-bold text-lg px-8 py-6 rounded-2xl"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Choose Your Pet Companion
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Confetti() {
  const [confetti, setConfetti] = useState<Array<{ left: string; x: number; rotateDir: number; duration: number; delay: number; repeatDelay: number }>>([]);

  useEffect(() => {
    const list = Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      x: Math.random() * 100 - 50,
      rotateDir: Math.random() > 0.5 ? 1 : -1,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
      repeatDelay: Math.random() * 2,
    }));
    // Defer state update to avoid synchronous setState inside effect
    setTimeout(() => setConfetti(list), 0);
  }, []);

  return <>{confetti.map((c, i) => (
    <motion.div
      key={i}
      className="absolute"
      style={{ left: c.left, top: `-5%` }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: ['0vh', '110vh'], x: [0, c.x], rotate: [0, 360 * c.rotateDir] }}
      transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, repeatDelay: c.repeatDelay }}
    >
      {i % 4 === 0 ? (
        <Leaf className="w-4 h-4 text-emerald-200" />
      ) : i % 4 === 1 ? (
        <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
      ) : i % 4 === 2 ? (
        <Sparkles className="w-4 h-4 text-white" />
      ) : (
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300" />
      )}
    </motion.div>
  ))}</>;
}
