"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Activity, Zap, Target, CheckCircle2, 
  Sparkles, Timer, Star, Wind, Moon, Play, Lock
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { usePetStore } from "@/stores/pet-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Loading } from "@/components/ui/loading";
import { isDemoMode } from "@/lib/supabase/client";
import { 
  petTherapyActivities, 
  therapeuticAbilities,
  getUnlockedAbilities,
  getNextAbilityToUnlock,
  petMessages,
  calculateEvolutionStage,
  getEvolutionBenefits,
  type PetTherapyActivity,
  type PetMood
} from "@/lib/pet-therapy-system";
import { cn } from "@/lib/utils";

interface DailyProgress {
  date: string;
  totalXP: number;
  petHappiness: number;
  activitiesCompleted: string[];
  bondLevel: number;
}

export default function PetsPage() {
  const { isDemoMode: isAuthDemoMode } = useAuthStore();
  const { activePet, fetchPets, isLoading } = usePetStore();
  const { isFullyUnlocked } = useFeatureGateStore();
  
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: new Date().toISOString().split('T')[0],
    totalXP: 0,
    petHappiness: 50,
    activitiesCompleted: [],
    bondLevel: 0,
  });
  const [currentMessage, setCurrentMessage] = useState("");
  const [petMood, setPetMood] = useState<PetMood>("calm");
  const [activeActivity, setActiveActivity] = useState<PetTherapyActivity | null>(null);
  const [activityStep, setActivityStep] = useState(0);
  const [showActivityComplete, setShowActivityComplete] = useState(false);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Load daily progress from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem("sahara-daily-progress");
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setDailyProgress(parsed);
      } else {
        const newProgress = {
          date: today,
          totalXP: 0,
          petHappiness: Math.max(30, (parsed.petHappiness || 50) - 20),
          activitiesCompleted: [],
          bondLevel: parsed.bondLevel || 0,
        };
        setDailyProgress(newProgress);
        localStorage.setItem("sahara-daily-progress", JSON.stringify(newProgress));
      }
    }
  }, []);

  // Update pet mood based on happiness
  useEffect(() => {
    if (dailyProgress.petHappiness >= 80) {
      setPetMood("joyful");
    } else if (dailyProgress.petHappiness >= 60) {
      setPetMood("playful");
    } else if (dailyProgress.petHappiness >= 40) {
      setPetMood("calm");
    } else {
      setPetMood("concerned");
    }
  }, [dailyProgress.petHappiness]);

  // Get random pet message
  const getRandomMessage = useCallback(() => {
    const messages = petMessages[petMood] || petMessages.calm;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [petMood]);

  useEffect(() => {
    setCurrentMessage(getRandomMessage());
    const interval = setInterval(() => {
      setCurrentMessage(getRandomMessage());
    }, 15000);
    return () => clearInterval(interval);
  }, [getRandomMessage]);

  const startActivity = (activity: PetTherapyActivity) => {
    setActiveActivity(activity);
    setActivityStep(0);
  };

  const nextActivityStep = () => {
    if (!activeActivity) return;
    
    if (activityStep < activeActivity.steps.length - 1) {
      setActivityStep(activityStep + 1);
    } else {
      completeActivity();
    }
  };

  const completeActivity = () => {
    if (!activeActivity) return;
    
    const newProgress = {
      ...dailyProgress,
      totalXP: dailyProgress.totalXP + activeActivity.bondReward * 10,
      petHappiness: Math.min(100, dailyProgress.petHappiness + activeActivity.moodBoost),
      activitiesCompleted: [...dailyProgress.activitiesCompleted, activeActivity.id],
      bondLevel: Math.min(100, dailyProgress.bondLevel + activeActivity.bondReward),
    };
    
    setDailyProgress(newProgress);
    localStorage.setItem("sahara-daily-progress", JSON.stringify(newProgress));
    
    setActiveActivity(null);
    setActivityStep(0);
    setShowActivityComplete(true);
    setTimeout(() => setShowActivityComplete(false), 3000);
  };

  const showPets = isFullyUnlocked || isDemoMode() || isAuthDemoMode;
  const unlockedAbilities = getUnlockedAbilities(dailyProgress.bondLevel);
  const nextAbility = getNextAbilityToUnlock(dailyProgress.bondLevel);
  const evolutionStage = calculateEvolutionStage(dailyProgress.bondLevel, dailyProgress.activitiesCompleted.length);
  const evolutionBenefits = getEvolutionBenefits(evolutionStage);

  if (!showPets) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-sage-600">
              Complete 10 chat sessions to unlock your pet companion.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !activePet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading your companion..." />
      </div>
    );
  }

  // Activity in progress
  if (activeActivity) {
    const currentStep = activeActivity.steps[activityStep];
    const progress = ((activityStep + 1) / activeActivity.steps.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-100 via-beige-50 to-sage-50 p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setActiveActivity(null)} 
            className="p-2 hover:bg-sage-200 rounded-full"
          >
            ✕
          </button>
          <h1 className="font-semibold text-sage-800">{activeActivity.name}</h1>
          <div className="w-9" />
        </div>

        {/* Progress */}
        <div className="h-2 bg-sage-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-sage-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Pet Display */}
        <motion.div
          className="flex justify-center mb-6"
          animate={{ 
            scale: [1, 1.02, 1],
            y: [0, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-sage-300 shadow-xl">
            <Image
              src={activePet.imageUrl?.startsWith('http') ? activePet.imageUrl : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop&crop=face"}
              alt={activePet.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activityStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-lg text-sage-800 mb-4">{currentStep.instruction}</p>
                {currentStep.petMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sage-600 italic bg-sage-50 p-3 rounded-lg"
                  >
                    {activePet.name} {currentStep.petMessage}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Timer/Continue Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-beige-200">
          <Button onClick={nextActivityStep} className="w-full">
            {activityStep === activeActivity.steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Continue
                <Timer className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Activity Complete Toast */}
      <AnimatePresence>
        {showActivityComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-sage-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Activity Complete!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Display Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sage-100 via-emerald-50 to-beige-50 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4 text-4xl opacity-20">🐾</div>
        
        <div className="flex flex-col items-center">
          {/* Pet Image */}
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMessage(getRandomMessage())}
          >
            <motion.div
              className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-white shadow-xl"
              animate={{
                scale: petMood === "joyful" ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Image
                src={activePet.imageUrl?.startsWith('http') ? activePet.imageUrl : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop&crop=face"}
                alt={activePet.name}
                width={144}
                height={144}
                className="object-cover w-full h-full"
                unoptimized
              />
            </motion.div>
            
            {/* Mood indicator */}
            <motion.div
              className={cn(
                "absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                petMood === "joyful" ? "bg-amber-400" :
                petMood === "playful" ? "bg-green-400" :
                petMood === "calm" ? "bg-sage-400" : "bg-blue-400"
              )}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {petMood === "joyful" ? "😄" : petMood === "playful" ? "😊" : petMood === "calm" ? "😌" : "🥺"}
            </motion.div>
          </motion.div>

          {/* Pet Name & Evolution */}
          <h2 className="text-2xl font-bold text-sage-800 mt-4">{activePet.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sage-500 text-sm capitalize">{activePet.personality} companion</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full capitalize">
              {evolutionStage}
            </span>
          </div>
          
          {/* Pet Message */}
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 max-w-xs text-center"
          >
            <p className="text-sage-700 text-sm">{currentMessage}</p>
          </motion.div>

          {/* Stats Row */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full">
              <Heart className={cn("w-4 h-4", petMood === "joyful" ? "text-pink-500 fill-pink-500" : "text-pink-400")} />
              <span className="text-sm font-medium text-sage-700">{dailyProgress.petHappiness}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-sage-700">Bond: {dailyProgress.bondLevel}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-sage-700">{dailyProgress.totalXP} XP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Therapeutic Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sage-600" />
            <h3 className="font-semibold text-sage-800">Therapeutic Activities</h3>
          </div>
          <span className="text-xs text-sage-500">{dailyProgress.activitiesCompleted.length} today</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {petTherapyActivities.map((activity, index) => {
            const isCompleted = dailyProgress.activitiesCompleted.includes(activity.id);
            const IconComponent = activity.type === 'guided_breathing' ? Wind :
                                 activity.type === 'sleep_companion' ? Moon :
                                 activity.type === 'mindful_walk' ? Target :
                                 Play;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer hover:shadow-md transition-all h-full",
                    isCompleted && "border-sage-300 bg-sage-50/50"
                  )}
                  onClick={() => startActivity(activity)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isCompleted ? "bg-sage-200" : "bg-sage-100"
                      )}>
                        <IconComponent className={cn(
                          "w-5 h-5",
                          isCompleted ? "text-sage-600" : "text-sage-500"
                        )} />
                      </div>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-sage-500" />}
                    </div>
                    <h4 className="font-medium text-sage-800 text-sm">{activity.name}</h4>
                    <p className="text-xs text-sage-500 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-sage-400">
                        <Timer className="w-3 h-3" />
                        {activity.duration} min
                      </span>
                      <span className="flex items-center gap-1 text-xs text-purple-500">
                        <Sparkles className="w-3 h-3" />
                        +{activity.bondReward}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Unlocked Abilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sage-800">Pet Abilities</h3>
              <span className="text-xs text-sage-500">{unlockedAbilities.length}/{therapeuticAbilities.length}</span>
            </div>
            
            <div className="space-y-2">
              {therapeuticAbilities.slice(0, 5).map((ability) => {
                const isUnlocked = ability.unlockedAtBond <= dailyProgress.bondLevel;
                
                return (
                  <div
                    key={ability.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      isUnlocked ? "bg-sage-50" : "bg-beige-50 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isUnlocked ? "bg-sage-200" : "bg-beige-200"
                    )}>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-sage-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-beige-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        isUnlocked ? "text-sage-800" : "text-sage-400"
                      )}>
                        {ability.name}
                      </p>
                      <p className="text-xs text-sage-500">
                        {isUnlocked ? ability.description : `Unlocks at Bond ${ability.unlockedAtBond}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {nextAbility && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Next unlock: <strong>{nextAbility.name}</strong> at Bond {nextAbility.unlockedAtBond}
                </p>
                <div className="h-1.5 bg-amber-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(dailyProgress.bondLevel / nextAbility.unlockedAtBond) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Evolution Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium text-purple-800 capitalize">{evolutionStage} Stage</h4>
            <p className="text-sm text-purple-600 mt-1">
              {activePet.name} can: {evolutionBenefits.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
