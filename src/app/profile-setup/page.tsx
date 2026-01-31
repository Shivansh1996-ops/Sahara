"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { 
  Shield, ChevronRight, Sparkles, Lock, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Generate unique Sahara ID
function generateSaharaId(): string {
  const prefix = "SH";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-Binary" },
  { value: "other", label: "Other" },
  { value: "prefer-not-say", label: "Skip" },
];

const wellnessGoals = [
  { id: "anxiety", label: "Manage anxiety", icon: "🌊" },
  { id: "mood", label: "Improve mood", icon: "☀️" },
  { id: "sleep", label: "Better sleep", icon: "🌙" },
  { id: "stress", label: "Reduce stress", icon: "🧘" },
  { id: "self-care", label: "Build habits", icon: "💪" },
  { id: "explore", label: "Just exploring", icon: "✨" },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { profile, updateProfile, isAuthenticated, initialize } = useAuthStore();
  const [step, setStep] = useState(1);
  const [saharaId, setSaharaId] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Generate Sahara ID on mount
    const existingId = localStorage.getItem("sahara-user-id");
    if (existingId) {
      setSaharaId(existingId);
    } else {
      const newId = generateSaharaId();
      setSaharaId(newId);
      localStorage.setItem("sahara-user-id", newId);
    }
  }, []);

  useEffect(() => {
    // If not authenticated, redirect to home
    if (!isAuthenticated) {
      setTimeout(() => {
        if (!isAuthenticated) {
          router.push("/");
        }
      }, 1000);
    }
  }, [isAuthenticated, router]);

  const totalSteps = 3;

  const handleGoalToggle = (id: string) => {
    setGoals(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id) 
        : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Clear any existing data to ensure fresh start
      localStorage.removeItem("sahara-daily-chats");
      localStorage.removeItem("sahara-daily-progress");
      localStorage.removeItem("sahara-journal-entries");
      localStorage.removeItem("sahara-wellness-data");
      
      // Save profile with Sahara ID
      await updateProfile({
        name: saharaId,
        age: age as number || null,
        sex: gender || null,
        medicalHistoryEncrypted: JSON.stringify({
          goals,
        }),
      });

      // Store completion flag
      localStorage.setItem("sahara-profile-complete", "true");
      localStorage.setItem("sahara-user-gender", gender);
      localStorage.setItem("sahara-new-account", "true");

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return true; // Age and gender are optional
      case 3: return true; // Goals are optional
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#2d5a6b]/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#e85a3c]/10 blur-[100px]" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2d5a6b] to-[#4a9eb0]"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome + ID */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#2d5a6b] to-[#4a9eb0] flex items-center justify-center shadow-2xl shadow-[#2d5a6b]/30"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-3xl font-light mb-2">
                Welcome to <span className="font-semibold">Sahara</span>
              </h1>
              <p className="text-white/60 mb-10">
                Your private wellness companion
              </p>

              {/* Sahara ID Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <p className="text-xs text-white/40 tracking-widest mb-2">YOUR ANONYMOUS ID</p>
                  <motion.p 
                    className="text-2xl font-mono font-semibold text-[#4a9eb0] tracking-wider"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {saharaId}
                  </motion.p>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Privacy Protected
                </div>
              </motion.div>

              <p className="text-sm text-white/40 mb-8">
                No personal info required. Your data stays on your device.
              </p>

              <Button
                onClick={() => setStep(2)}
                className="w-full h-14 bg-white text-black rounded-full font-medium text-lg hover:bg-white/90 transition-all"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Quick basics */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-10">
                <h1 className="text-2xl font-light mb-2">Quick basics</h1>
                <p className="text-white/50 text-sm">Optional — helps personalize your experience</p>
              </div>

              {/* Age */}
              <div className="mb-8">
                <label className="text-sm text-white/60 mb-3 block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="—"
                  min={13}
                  max={120}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-5 text-center text-xl font-light focus:border-[#4a9eb0] focus:outline-none transition-colors placeholder:text-white/20"
                />
              </div>

              {/* Gender */}
              <div className="mb-10">
                <label className="text-sm text-white/60 mb-3 block">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.slice(0, 3).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value)}
                      className={cn(
                        "h-12 rounded-xl text-sm font-medium transition-all",
                        gender === option.value
                          ? "bg-[#2d5a6b] text-white border-2 border-[#4a9eb0]"
                          : "bg-white/5 text-white/70 border border-white/10 hover:border-white/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {genderOptions.slice(3).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value)}
                      className={cn(
                        "h-12 rounded-xl text-sm font-medium transition-all",
                        gender === option.value
                          ? "bg-[#2d5a6b] text-white border-2 border-[#4a9eb0]"
                          : "bg-white/5 text-white/70 border border-white/10 hover:border-white/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="flex-1 h-14 text-white/60 hover:text-white hover:bg-white/5 rounded-full"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-[2] h-14 bg-white text-black rounded-full font-medium hover:bg-white/90"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-light mb-2">What brings you here?</h1>
                <p className="text-white/50 text-sm">Select any that apply</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {wellnessGoals.map((goal, i) => (
                  <motion.button
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={cn(
                      "relative p-4 rounded-2xl text-left transition-all",
                      goals.includes(goal.id)
                        ? "bg-[#2d5a6b]/50 border-2 border-[#4a9eb0]"
                        : "bg-white/5 border border-white/10 hover:border-white/20"
                    )}
                  >
                    <span className="text-2xl mb-2 block">{goal.icon}</span>
                    <span className="text-sm font-medium">{goal.label}</span>
                    {goals.includes(goal.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-black" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="flex-1 h-14 text-white/60 hover:text-white hover:bg-white/5 rounded-full"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-[2] h-14 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white rounded-full font-medium hover:opacity-90"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <div className="fixed bottom-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                step === s ? "w-8 bg-white" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
