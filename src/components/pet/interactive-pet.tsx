"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Activity, X, MessageCircle, Dumbbell, Timer, Trophy, Zap } from "lucide-react";
import { usePetStore } from "@/stores/pet-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InteractivePetProps {
  isOpen: boolean;
  onClose: () => void;
}

// Motivational messages by pet personality - dogs and animals
const motivationalMessages: Record<string, string[]> = {
  calm: [
    "Take a deep breath with me... You're doing wonderfully. 🐕",
    "Remember, peace comes from within. You've got this.",
    "Let's find a moment of stillness together.",
    "Your calm energy today is inspiring.",
    "Every breath is a fresh start. *wags tail gently*",
    "How about a gentle stretch? Your body will thank you!",
    "Let's take a mindful walk together, even just around the room.",
    "Movement is medicine for the soul. Ready for some gentle exercise?"
  ],
  playful: [
    "Hey! Let's do something fun together! 🎾",
    "You know what would be awesome? A little dance break!",
    "I bet you can't smile for 10 seconds straight... try it!",
    "Life's too short to be serious all the time! *bounces excitedly*",
    "Let's celebrate the little wins today!",
    "Race you to do 10 jumping jacks! Ready, set, GO! 🏃",
    "Let's play! How about some fun exercises?",
    "Your energy is contagious! Let's move together!"
  ],
  grounding: [
    "Feel your feet on the ground. You are here, you are present. 🐕",
    "Let's focus on what's real and tangible right now.",
    "You are stronger than you know. Stay rooted.",
    "One step at a time. That's all it takes. *sits beside you*",
    "Your foundation is solid. Trust yourself.",
    "Let's ground ourselves with some gentle movement.",
    "A short walk can help clear your mind. Want to try?",
    "Physical activity helps us stay connected to our bodies."
  ],
  motivating: [
    "You've got this! I believe in you! 💪",
    "Every champion was once a beginner. Keep going!",
    "Your potential is limitless. Let's unlock it! *barks encouragingly*",
    "Today is YOUR day to shine!",
    "Small progress is still progress. You're amazing!",
    "Let's crush some exercise goals together! 🏆",
    "Your body is capable of amazing things. Let's prove it!",
    "No excuses! Let's get moving and feel great!"
  ]
};

// Physical activity suggestions - expanded with more exercises
const activitySuggestions = [
  {
    title: "Quick Stretch",
    description: "Stand up and stretch your arms above your head for 30 seconds",
    duration: "30 sec",
    icon: "🧘",
    category: "stretch",
    calories: 5
  },
  {
    title: "Walking Break",
    description: "Take a 5-minute walk around your space or outside",
    duration: "5 min",
    icon: "🚶",
    category: "cardio",
    calories: 25
  },
  {
    title: "Deep Breathing",
    description: "Take 5 deep breaths: inhale for 4 counts, hold for 4, exhale for 4",
    duration: "1 min",
    icon: "🌬️",
    category: "mindfulness",
    calories: 2
  },
  {
    title: "Desk Exercises",
    description: "Do 10 seated leg raises and 10 shoulder rolls",
    duration: "2 min",
    icon: "💺",
    category: "strength",
    calories: 10
  },
  {
    title: "Eye Rest",
    description: "Look away from screen, focus on something 20 feet away for 20 seconds",
    duration: "20 sec",
    icon: "👀",
    category: "rest",
    calories: 0
  },
  {
    title: "Mini Dance",
    description: "Put on your favorite song and move for one minute!",
    duration: "1 min",
    icon: "💃",
    category: "cardio",
    calories: 15
  },
  {
    title: "Hydration Check",
    description: "Drink a full glass of water and do 5 jumping jacks",
    duration: "1 min",
    icon: "💧",
    category: "cardio",
    calories: 10
  },
  {
    title: "Posture Reset",
    description: "Sit up straight, roll shoulders back, and hold for 30 seconds",
    duration: "30 sec",
    icon: "🪑",
    category: "stretch",
    calories: 2
  },
  {
    title: "Wall Push-ups",
    description: "Do 10 push-ups against a wall - great for upper body!",
    duration: "1 min",
    icon: "💪",
    category: "strength",
    calories: 15
  },
  {
    title: "Calf Raises",
    description: "Stand and raise up on your toes 15 times",
    duration: "1 min",
    icon: "🦵",
    category: "strength",
    calories: 8
  },
  {
    title: "Neck Rolls",
    description: "Gently roll your neck in circles, 5 times each direction",
    duration: "30 sec",
    icon: "🔄",
    category: "stretch",
    calories: 2
  },
  {
    title: "Squats",
    description: "Do 10 bodyweight squats - your legs will thank you!",
    duration: "1 min",
    icon: "🏋️",
    category: "strength",
    calories: 20
  },
  {
    title: "High Knees",
    description: "March in place bringing knees up high for 30 seconds",
    duration: "30 sec",
    icon: "🏃",
    category: "cardio",
    calories: 15
  },
  {
    title: "Arm Circles",
    description: "Extend arms and make circles, 10 forward and 10 backward",
    duration: "1 min",
    icon: "⭕",
    category: "stretch",
    calories: 5
  }
];

// Pet images - dog and cat only
const petImages: Record<string, string> = {
  calm: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop&crop=face",
  playful: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop&crop=face",
};

export function InteractivePet({ isOpen, onClose }: InteractivePetProps) {
  const { activePet } = usePetStore();
  const [currentMessage, setCurrentMessage] = useState("");
  const [showActivity, setShowActivity] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activitySuggestions[0]);
  const [petMood, setPetMood] = useState<"happy" | "excited" | "calm">("calm");
  const [interactionCount, setInteractionCount] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "exercise">("chat");

  const personality = activePet?.personality || "calm";
  const petName = activePet?.name || "Your Pet";
  const petImage = activePet?.imageUrl?.startsWith('http') 
    ? activePet.imageUrl 
    : petImages[personality] || petImages.calm;

  // Load saved stats
  useEffect(() => {
    const savedStats = localStorage.getItem("sahara-pet-stats");
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setInteractionCount(stats.interactions || 0);
      setCompletedActivities(stats.activities || 0);
      setTotalCalories(stats.calories || 0);
    }
  }, []);

  // Save stats
  useEffect(() => {
    localStorage.setItem("sahara-pet-stats", JSON.stringify({
      interactions: interactionCount,
      activities: completedActivities,
      calories: totalCalories
    }));
  }, [interactionCount, completedActivities, totalCalories]);

  // Get random motivational message
  const getRandomMessage = useCallback(() => {
    const messages = motivationalMessages[personality] || motivationalMessages.calm;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [personality]);

  // Get random activity
  const getRandomActivity = useCallback(() => {
    return activitySuggestions[Math.floor(Math.random() * activitySuggestions.length)];
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentMessage(getRandomMessage());
      setCurrentActivity(getRandomActivity());
    }
  }, [isOpen, getRandomMessage, getRandomActivity]);

  const handlePetInteraction = () => {
    setInteractionCount(prev => prev + 1);
    setPetMood("excited");
    setCurrentMessage(getRandomMessage());
    
    setTimeout(() => setPetMood("happy"), 2000);
  };

  const handleActivityRequest = () => {
    setShowActivity(true);
    setCurrentActivity(getRandomActivity());
    setPetMood("excited");
    setCurrentMessage(`Let's do this together! I'll cheer you on! 🎉`);
  };

  const handleCompleteActivity = () => {
    setShowActivity(false);
    setCompletedActivities(prev => prev + 1);
    setTotalCalories(prev => prev + (currentActivity.calories || 0));
    setInteractionCount(prev => prev + 1);
    setPetMood("happy");
    
    // Show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    
    // Encouraging message based on personality
    const celebrationMessages: Record<string, string[]> = {
      calm: ["Wonderful job! Your body thanks you. 🌿", "That was perfect. Feel the calm energy flowing."],
      playful: ["WOOHOO! You did it! 🎉", "That was awesome! High five! ✋"],
      grounding: ["Well done. You're building strength. 💪", "Great work staying present and active."],
      motivating: ["CHAMPION! You're unstoppable! 🏆", "YES! That's the spirit! Keep crushing it!"]
    };
    const messages = celebrationMessages[personality] || celebrationMessages.calm;
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sage-500 to-sage-600 p-4 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">{petName}</h2>
            <p className="text-white/80 text-sm capitalize">{personality} companion</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-beige-200">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "chat" 
                  ? "text-sage-700 border-b-2 border-sage-500" 
                  : "text-sage-400 hover:text-sage-600"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("exercise")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "exercise" 
                  ? "text-sage-700 border-b-2 border-sage-500" 
                  : "text-sage-400 hover:text-sage-600"
              )}
            >
              <Dumbbell className="w-4 h-4" />
              Exercise
            </button>
          </div>

          {/* Celebration Animation */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x: Math.cos(i * 30 * Math.PI / 180) * 100,
                      y: Math.sin(i * 30 * Math.PI / 180) * 100,
                    }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="absolute"
                  >
                    {["⭐", "🎉", "✨", "💪", "🏆", "❤️"][i % 6]}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pet Display */}
          <div className="p-6 flex flex-col items-center">
            <motion.div
              className="relative cursor-pointer"
              onClick={handlePetInteraction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-sage-200 shadow-lg"
                animate={{
                  scale: petMood === "excited" ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={petImage}
                  alt={petName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Mood indicator */}
              <motion.div
                className={cn(
                  "absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center",
                  petMood === "excited" ? "bg-amber-400" :
                  petMood === "happy" ? "bg-pink-400" : "bg-sage-400"
                )}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {petMood === "excited" ? "✨" : petMood === "happy" ? "💕" : "😊"}
              </motion.div>
            </motion.div>

            {/* Interaction hint */}
            <p className="text-sage-400 text-xs mt-2">Tap {petName} to interact!</p>

            {/* Message bubble */}
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-sage-50 rounded-2xl p-4 text-center max-w-xs"
            >
              <p className="text-sage-700">{currentMessage}</p>
            </motion.div>

            {/* Stats */}
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              <div className="flex items-center gap-1 text-sage-500 text-sm bg-sage-50 px-3 py-1.5 rounded-full">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>{interactionCount}</span>
              </div>
              <div className="flex items-center gap-1 text-sage-500 text-sm bg-amber-50 px-3 py-1.5 rounded-full">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{completedActivities} done</span>
              </div>
              <div className="flex items-center gap-1 text-sage-500 text-sm bg-orange-50 px-3 py-1.5 rounded-full">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>{totalCalories} cal</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "chat" && (
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMessage(getRandomMessage())}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  New Message
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePetInteraction}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Show Love
                </Button>
              </div>
            </div>
          )}

          {activeTab === "exercise" && (
            <div className="px-6 pb-6 space-y-4">
              {!showActivity ? (
                <>
                  <Button
                    onClick={handleActivityRequest}
                    className="w-full bg-gradient-to-r from-sage-500 to-emerald-500 hover:from-sage-600 hover:to-emerald-600"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    Get Exercise Suggestion
                  </Button>
                  
                  {/* Quick Exercise Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {activitySuggestions.slice(0, 4).map((activity, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          setCurrentActivity(activity);
                          setShowActivity(true);
                          setPetMood("excited");
                        }}
                        className="p-3 bg-beige-50 hover:bg-beige-100 rounded-xl text-left transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl">{activity.icon}</span>
                        <p className="text-xs font-medium text-sage-700 mt-1">{activity.title}</p>
                        <p className="text-[10px] text-sage-400">{activity.duration}</p>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-gradient-to-r from-sage-50 to-emerald-50 rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{currentActivity.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sage-800">{currentActivity.title}</h3>
                      <p className="text-sage-600 text-sm mt-1">{currentActivity.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-sage-400 text-xs">
                          <Timer className="w-3 h-3" />
                          {currentActivity.duration}
                        </span>
                        <span className="flex items-center gap-1 text-orange-400 text-xs">
                          <Zap className="w-3 h-3" />
                          ~{currentActivity.calories} cal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentActivity(getRandomActivity())}
                      className="flex-1"
                    >
                      Different
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCompleteActivity}
                      className="flex-1 bg-sage-500 hover:bg-sage-600"
                    >
                      <Trophy className="w-4 h-4 mr-1" />
                      Done!
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
