"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { 
  Heart, Star, Sparkles, Cookie, Dumbbell, 
  MessageCircle, Zap, Hand, Gamepad2, Bed, Wind, Lightbulb, Target,
  Footprints, Scissors, GraduationCap, Trophy, Volume2, VolumeX,
  Flame, Angry, SmilePlus, Frown, HeartCrack, Laugh, Meh
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { usePetStore } from "@/stores/pet-store";
import { Button } from "@/components/ui/button";
import { playPetSound } from "@/lib/pet-voice-system";
import { generatePatternAwareResponse, celebrateAchievement, generateTimeBasedGreeting, type UserState, type PetPersonality } from "@/lib/adaptive-pet-ai";
import { type EmotionalTone } from "@/lib/journal-analysis-engine";
import { cn } from "@/lib/utils";

// Pet emotion types
type PetEmotion = "neutral" | "happy" | "excited" | "blush" | "angry" | "sad" | "sleepy" | "hungry" | "love" | "confused" | "surprised";

// Emotion configurations with visual effects
const emotionConfig: Record<PetEmotion, { emoji: string; color: string; bgGlow: string; overlay: string; message: string }> = {
  neutral: { emoji: "😊", color: "#6b7280", bgGlow: "rgba(107,114,128,0.2)", overlay: "", message: "" },
  happy: { emoji: "😄", color: "#22c55e", bgGlow: "rgba(34,197,94,0.3)", overlay: "bg-yellow-400/10", message: "Yay!" },
  excited: { emoji: "🤩", color: "#f59e0b", bgGlow: "rgba(245,158,11,0.4)", overlay: "bg-orange-400/15", message: "So excited!" },
  blush: { emoji: "😊", color: "#ec4899", bgGlow: "rgba(236,72,153,0.3)", overlay: "bg-pink-400/20", message: "Aww..." },
  angry: { emoji: "😠", color: "#ef4444", bgGlow: "rgba(239,68,68,0.3)", overlay: "bg-red-500/15", message: "Grr!" },
  sad: { emoji: "😢", color: "#6b7280", bgGlow: "rgba(107,114,128,0.2)", overlay: "bg-blue-400/10", message: "*whimper*" },
  sleepy: { emoji: "😴", color: "#8b5cf6", bgGlow: "rgba(139,92,246,0.2)", overlay: "bg-indigo-400/15", message: "Zzz..." },
  hungry: { emoji: "🤤", color: "#f97316", bgGlow: "rgba(249,115,22,0.3)", overlay: "bg-orange-300/10", message: "*tummy growls*" },
  love: { emoji: "😍", color: "#ec4899", bgGlow: "rgba(236,72,153,0.4)", overlay: "bg-pink-500/20", message: "I love you!" },
  confused: { emoji: "🤔", color: "#8b5cf6", bgGlow: "rgba(139,92,246,0.2)", overlay: "bg-purple-300/10", message: "Huh?" },
  surprised: { emoji: "😲", color: "#3b82f6", bgGlow: "rgba(59,130,246,0.3)", overlay: "bg-blue-400/15", message: "Wow!" },
};

// Pet data
const petOptions = [
  {
    id: "dog",
    name: "Buddy",
    type: "dog" as const,
    personality: "buddy" as PetPersonality,
    images: {
      neutral: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop&crop=face",
      happy: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop&crop=face",
      excited: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=600&fit=crop&crop=face",
      sleepy: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=600&fit=crop",
      sad: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&h=600&fit=crop&crop=face",
    },
    sounds: { happy: 'buddy-bark', sad: 'buddy-whimper' },
  },
  {
    id: "cat",
    name: "Whiskers",
    type: "cat" as const,
    personality: "whiskers" as PetPersonality,
    images: {
      neutral: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop&crop=face",
      happy: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&h=600&fit=crop",
      excited: "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=600&h=600&fit=crop",
      sleepy: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&h=600&fit=crop",
      sad: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&h=600&fit=crop",
    },
    sounds: { happy: 'whiskers-meow', sad: 'whiskers-purr' },
  },
];

// Enhanced interactions with emotion triggers
const interactions = [
  { id: "pet", label: "Pet", emoji: "✋", color: "#ec4899", happinessBoost: 10, bondBoost: 8, energyCost: 0, emotion: "blush" as PetEmotion, animation: "wiggle" },
  { id: "talk", label: "Talk", emoji: "💬", color: "#3b82f6", happinessBoost: 8, bondBoost: 12, energyCost: 0, emotion: "happy" as PetEmotion, animation: "bounce" },
  { id: "play", label: "Play", emoji: "🎮", color: "#22c55e", happinessBoost: 15, bondBoost: 10, energyCost: 15, emotion: "excited" as PetEmotion, animation: "jump" },
  { id: "treat", label: "Treat", emoji: "🍖", color: "#f59e0b", happinessBoost: 12, bondBoost: 6, energyCost: -10, emotion: "love" as PetEmotion, animation: "eat" },
  { id: "walk", label: "Walk", emoji: "🚶", color: "#06b6d4", happinessBoost: 20, bondBoost: 15, energyCost: 20, emotion: "excited" as PetEmotion, animation: "walk" },
  { id: "groom", label: "Groom", emoji: "✨", color: "#8b5cf6", happinessBoost: 10, bondBoost: 8, energyCost: 5, emotion: "blush" as PetEmotion, animation: "sparkle" },
  { id: "train", label: "Train", emoji: "🎓", color: "#ef4444", happinessBoost: 8, bondBoost: 15, energyCost: 10, emotion: "confused" as PetEmotion, animation: "focus" },
  { id: "cuddle", label: "Cuddle", emoji: "🤗", color: "#f472b6", happinessBoost: 18, bondBoost: 20, energyCost: 0, emotion: "love" as PetEmotion, animation: "love" },
  { id: "rest", label: "Rest", emoji: "😴", color: "#a855f7", happinessBoost: 5, bondBoost: 5, energyCost: -30, emotion: "sleepy" as PetEmotion, animation: "sleep" },
  { id: "tease", label: "Tease", emoji: "😜", color: "#f43f5e", happinessBoost: -5, bondBoost: -2, energyCost: 0, emotion: "angry" as PetEmotion, animation: "shake" },
  { id: "ignore", label: "Ignore", emoji: "🙄", color: "#6b7280", happinessBoost: -10, bondBoost: -5, energyCost: 0, emotion: "sad" as PetEmotion, animation: "droop" },
  { id: "surprise", label: "Surprise", emoji: "🎁", color: "#10b981", happinessBoost: 15, bondBoost: 10, energyCost: 5, emotion: "surprised" as PetEmotion, animation: "pop" },
];

// Floating particles component
function Particles({ count = 20, color = "#ffd700", type = "hearts" }: { count?: number; color?: string; type?: string }) {
  const shapes = type === "hearts" ? ["❤️", "💕", "💖"] : type === "stars" ? ["⭐", "✨", "🌟"] : type === "angry" ? ["💢", "😤", "💥"] : ["✨"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          style={{ left: `${Math.random() * 100}%`, top: "60%" }}
          initial={{ opacity: 1, y: 0, scale: 0 }}
          animate={{
            y: -200 - Math.random() * 100,
            x: (Math.random() - 0.5) * 150,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1.2, 0],
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, ease: "easeOut" }}
        >
          {shapes[Math.floor(Math.random() * shapes.length)]}
        </motion.div>
      ))}
    </div>
  );
}

// Blush marks component
function BlushMarks() {
  return (
    <>
      <motion.div
        className="absolute w-8 h-4 rounded-full bg-pink-400/60 blur-sm"
        style={{ left: "15%", top: "55%" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-8 h-4 rounded-full bg-pink-400/60 blur-sm"
        style={{ right: "15%", top: "55%" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
    </>
  );
}

// Anger marks component
function AngerMarks() {
  return (
    <motion.div
      className="absolute -top-2 right-2 text-2xl"
      animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.3, repeat: 3 }}
    >
      💢
    </motion.div>
  );
}

// Sleep bubbles component
function SleepBubbles() {
  return (
    <div className="absolute -top-4 -right-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -30 * (i + 1), scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
          style={{ right: i * 10 }}
        >
          💤
        </motion.div>
      ))}
    </div>
  );
}

// Love hearts component
function LoveHearts() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          style={{ left: `${20 + i * 15}%`, top: "30%" }}
          animate={{
            y: [0, -40, 0],
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}

export default function PetsPage() {
  const { user } = useAuthStore();
  const { fetchPets } = usePetStore();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [happiness, setHappiness] = useState(70);
  const [bond, setBond] = useState(25);
  const [energy, setEnergy] = useState(80);
  const [hunger, setHunger] = useState(60);
  const [xp, setXp] = useState(150);
  const [coins, setCoins] = useState(50);
  const [currentMessage, setCurrentMessage] = useState("");
  const [petEmotion, setPetEmotion] = useState<PetEmotion>("neutral");
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState("hearts");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [currentMood, setCurrentMood] = useState<EmotionalTone | null>(null);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<PetEmotion>("neutral");
  
  const emojiIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const emotionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // User state for adaptive AI
  const [userState, setUserState] = useState<UserState>({
    currentMood: null,
    moodHistory: [],
    habitsCompleted: [],
    habitStreak: dailyStreak,
    lastInteraction: null,
    journalCount: 5,
    exerciseMinutes: 30,
    sleepQuality: 3,
    socialInteractions: 2,
    gratitudeEntries: 3,
  });

  useEffect(() => {
    fetchPets();
    const saved = localStorage.getItem("sahara-selected-pet");
    if (saved) setSelectedPet(saved);
    
    const savedPetState = localStorage.getItem("sahara-pet-state");
    if (savedPetState) {
      try {
        const parsed = JSON.parse(savedPetState);
        setHappiness(parsed.happiness || 70);
        setBond(parsed.bond || 25);
        setEnergy(parsed.energy || 80);
        setHunger(parsed.hunger || 60);
        setXp(parsed.xp || 150);
        setCoins(parsed.coins || 50);
        setDailyStreak(parsed.dailyStreak || 0);
      } catch (e) {}
    }
  }, [fetchPets]);

  const petData = petOptions.find(p => p.id === selectedPet);

  // Auto-save pet state
  useEffect(() => {
    localStorage.setItem("sahara-pet-state", JSON.stringify({
      happiness, bond, energy, hunger, xp, coins, dailyStreak
    }));
  }, [happiness, bond, energy, hunger, xp, coins, dailyStreak]);

  // Generate initial greeting
  useEffect(() => {
    if (petData) {
      const greeting = generateTimeBasedGreeting(userState, petData.personality);
      setCurrentMessage(greeting);
    }
  }, [petData]);

  // Pet mood based on stats - updates emotion when idle
  useEffect(() => {
    if (!isInteracting) {
      const avgStats = (happiness + energy + (100 - hunger)) / 3;
      if (hunger > 80) {
        setPetEmotion("hungry");
        setCurrentMessage(`${petData?.name} is getting hungry... 🍖`);
      } else if (energy < 20) {
        setPetEmotion("sleepy");
        setCurrentMessage(`${petData?.name} is tired... 😴`);
      } else if (avgStats > 70) {
        setPetEmotion("happy");
      } else if (avgStats < 40) {
        setPetEmotion("sad");
      } else {
        setPetEmotion("neutral");
      }
    }
  }, [happiness, energy, hunger, isInteracting, petData]);

  // Gradual stat decay
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(h => Math.min(100, h + 1));
      setEnergy(e => Math.max(0, e - 0.5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addFloatingEmoji = (emoji: string) => {
    const id = emojiIdRef.current++;
    const x = Math.random() * 60 + 20;
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2500);
  };

  const triggerEmotion = (emotion: PetEmotion, duration: number = 3000) => {
    if (emotionTimeoutRef.current) {
      clearTimeout(emotionTimeoutRef.current);
    }
    
    setIsInteracting(true);
    setLastEmotion(petEmotion);
    setPetEmotion(emotion);
    
    // Trigger appropriate particle effects
    if (emotion === "love" || emotion === "blush") {
      setParticleType("hearts");
      setShowParticles(true);
    } else if (emotion === "excited" || emotion === "surprised") {
      setParticleType("stars");
      setShowParticles(true);
    } else if (emotion === "angry") {
      setParticleType("angry");
      setShowParticles(true);
    }

    emotionTimeoutRef.current = setTimeout(() => {
      setShowParticles(false);
      setIsInteracting(false);
      // Return to state based on stats
      const avgStats = (happiness + energy + (100 - hunger)) / 3;
      if (avgStats > 70) setPetEmotion("happy");
      else if (avgStats < 40) setPetEmotion("sad");
      else setPetEmotion("neutral");
    }, duration);
  };

  const playSound = (type: 'happy' | 'sad' = 'happy') => {
    if (soundEnabled && petData) {
      playPetSound(petData.sounds[type]);
    }
  };

  const handleInteraction = (interaction: typeof interactions[0]) => {
    // Check energy for energy-consuming activities
    if (interaction.energyCost > 0 && energy < interaction.energyCost) {
      setCurrentMessage(`${petData?.name} is too tired! Let them rest first. 😴`);
      triggerEmotion("sleepy", 2000);
      return;
    }

    // Update stats
    setHappiness(h => Math.min(100, Math.max(0, h + interaction.happinessBoost)));
    setBond(b => Math.min(100, Math.max(0, b + interaction.bondBoost)));
    setEnergy(e => Math.min(100, Math.max(0, e - interaction.energyCost)));
    setXp(x => x + (interaction.happinessBoost > 0 ? 10 : 0));
    
    if (interaction.id === "treat") {
      setHunger(h => Math.max(0, h - 25));
    }

    // Trigger emotion
    triggerEmotion(interaction.emotion, interaction.id === "rest" ? 5000 : 3000);
    
    // Add floating emoji
    addFloatingEmoji(interaction.emoji);

    // Set message based on interaction
    const emotionData = emotionConfig[interaction.emotion];
    const messages: Record<string, string[]> = {
      pet: ["*happy wiggle* That feels amazing! 💕", "*purrs* More pets please! 🥰", "*tail wagging* I love your touch! ✨"],
      talk: ["*listens intently* Tell me more! 💬", "*head tilts* I love hearing your voice! 🎵", "*perks up* Let's chat! 💖"],
      play: ["*bounces excitedly* PLAY TIME! 🎉", "*runs in circles* So much fun! ⚡", "*pounces* This is the best! 🌟"],
      treat: ["*gobbles happily* YUMMY! 😋", "*tail goes crazy* Best treat ever! 🍖", "*licks lips* More please! 🤤"],
      walk: ["*pulls on leash* Adventure time! 🌳", "*sniffs excitedly* So many smells! 🐾", "*happy prancing* I love walks! 🚶"],
      groom: ["*closes eyes blissfully* So relaxing... 💆", "*feels fancy* Looking good! ✨", "*stretches* That feels nice... 😌"],
      train: ["*focuses hard* ...sit? 🤔", "*tries best* Did I do it right? 🎓", "*concentrates* Learning is fun! 📚"],
      cuddle: ["*melts into cuddle* I love you so much! 💕", "*nuzzles close* Best human ever! 🥰", "*warm and cozy* Never let go! 💖"],
      rest: ["*curls up* Zzz... 💤", "*yawns* Sleepy time... 😴", "*dreams of treats* ...mlem... 🌙"],
      tease: ["*growls* Hey! That's not nice! 😠", "*huffs angrily* Stop it! 💢", "*pouts* Why would you do that?! 😤"],
      ignore: ["*whimpers* ...hello? 😢", "*sad eyes* Did I do something wrong? 💔", "*droops* Please notice me... 🥺"],
      surprise: ["*jumps back* WOW! 😲", "*eyes go wide* What is it?! 🎁", "*spins around* A surprise?! 🤩"],
    };

    const msgList = messages[interaction.id] || [`${emotionData.message}`];
    setCurrentMessage(msgList[Math.floor(Math.random() * msgList.length)]);
    
    // Play sound
    if (interaction.happinessBoost >= 0) {
      playSound('happy');
    } else {
      playSound('sad');
    }
  };

  const startBreathingExercise = () => {
    setShowBreathingExercise(true);
    setBreathCount(0);
    const phases: ("inhale" | "hold" | "exhale" | "rest")[] = ["inhale", "hold", "exhale", "rest"];
    let phaseIndex = 0;
    let count = 0;

    const interval = setInterval(() => {
      setBreathingPhase(phases[phaseIndex]);
      phaseIndex = (phaseIndex + 1) % 4;
      
      if (phaseIndex === 0) {
        count++;
        setBreathCount(count);
        if (count >= 4) {
          clearInterval(interval);
          setTimeout(() => {
            setShowBreathingExercise(false);
            if (petData) {
              setCurrentMessage(`Great breathing session! ${petData.name} is proud of you! 🌟`);
            }
            setXp(x => x + 20);
            setHappiness(h => Math.min(100, h + 15));
            setBond(b => Math.min(100, b + 10));
            triggerEmotion("love", 3000);
          }, 4000);
        }
      }
    }, 4000);
  };

  const getPetImage = () => {
    if (!petData) return "";
    const images = petData.images as Record<string, string>;
    // Map emotions to available images
    const imageMap: Record<PetEmotion, string> = {
      neutral: images.neutral,
      happy: images.happy || images.neutral,
      excited: images.excited || images.happy || images.neutral,
      blush: images.happy || images.neutral,
      angry: images.neutral,
      sad: images.sad || images.neutral,
      sleepy: images.sleepy || images.neutral,
      hungry: images.neutral,
      love: images.happy || images.neutral,
      confused: images.neutral,
      surprised: images.excited || images.neutral,
    };
    return imageMap[petEmotion] || images.neutral;
  };

  const getAnimationProps = () => {
    switch (petEmotion) {
      case "happy": return { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] };
      case "excited": return { y: [0, -15, 0], scale: [1, 1.1, 1] };
      case "blush": return { scale: [1, 1.03, 1], x: [0, 2, -2, 0] };
      case "angry": return { x: [-3, 3, -3, 3, 0], scale: [1, 1.05, 1] };
      case "sad": return { y: [0, 3, 0], scale: [1, 0.98, 1] };
      case "sleepy": return { y: [0, -3, 0], rotate: [0, 1, -1, 0] };
      case "love": return { scale: [1, 1.1, 1, 1.1, 1] };
      case "surprised": return { scale: [1, 1.15, 1], y: [0, -10, 0] };
      case "confused": return { rotate: [0, 5, -5, 0], scale: [1, 1.02, 1] };
      default: return { y: [0, -2, 0] };
    }
  };

  // No pet selected
  if (!selectedPet) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🐾
          </motion.div>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">Choose Your Companion</h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
            Select a virtual pet from your profile to begin your wellness journey together
          </p>
          <Link href="/profile">
            <Button className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white rounded-full px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
              <Sparkles className="w-5 h-5 mr-2" />
              Go to Profile
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);
  const currentEmotionConfig = emotionConfig[petEmotion];

  return (
    <div className="min-h-screen pb-24 overflow-hidden" ref={containerRef}>
      {/* Dynamic Background based on emotion */}
      <div className="fixed inset-0 -z-10 transition-all duration-1000">
        <div className={cn(
          "absolute inset-0",
          petEmotion === "happy" || petEmotion === "excited" ? "bg-gradient-to-b from-amber-50 via-orange-50/50 to-yellow-50/30" :
          petEmotion === "love" || petEmotion === "blush" ? "bg-gradient-to-b from-pink-50 via-rose-50/50 to-red-50/30" :
          petEmotion === "angry" ? "bg-gradient-to-b from-red-50 via-orange-50/50 to-amber-50/30" :
          petEmotion === "sad" ? "bg-gradient-to-b from-slate-100 via-gray-50 to-blue-50/30" :
          petEmotion === "sleepy" ? "bg-gradient-to-b from-indigo-50 via-purple-50/50 to-violet-50/30" :
          "bg-gradient-to-b from-[#e8f0f2] via-[#f5f3f0] to-[#f0f5f7]"
        )} />
        
        {/* Animated ambient orbs */}
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: currentEmotionConfig.bgGlow }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-40 left-10 w-48 h-48 rounded-full blur-3xl"
          style={{ backgroundColor: currentEmotionConfig.bgGlow }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Header Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card)]/90 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-[var(--border)] shadow-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div 
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 shadow-lg"
                  style={{ borderColor: currentEmotionConfig.color }}
                >
                  <Image src={petData?.images.neutral || ""} alt="" fill className="object-cover" />
                </motion.div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 text-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {currentEmotionConfig.emoji}
                </motion.div>
              </div>
              <div>
                <h1 className="font-bold text-[var(--text)]">{petData?.name}</h1>
                <div className="flex items-center gap-1 text-xs text-[var(--text-light)]">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>{dailyStreak} day streak</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
                <span className="text-lg">🪙</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{coins}</span>
              </div>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full hover:bg-[var(--bg-alt)] transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5 text-[var(--text-muted)]" /> : <VolumeX className="w-5 h-5 text-[var(--text-muted)]" />}
              </button>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[var(--text-muted)]">Level {level}</span>
              <span className="text-[var(--primary)] font-medium">{xpProgress}/100 XP</span>
            </div>
            <div className="h-2 bg-[var(--bg-alt)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Pet Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-4"
        >
          <div className={cn(
            "bg-[var(--card)]/80 backdrop-blur-xl rounded-3xl p-6 border shadow-2xl relative overflow-hidden transition-all duration-500",
            currentEmotionConfig.overlay
          )} style={{ borderColor: `${currentEmotionConfig.color}40` }}>
            
            {/* Particle Effects */}
            <AnimatePresence>
              {showParticles && <Particles count={15} type={particleType} />}
            </AnimatePresence>

            {/* Floating Emojis */}
            <AnimatePresence>
              {floatingEmojis.map(({ id, emoji, x }) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -150, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  className="absolute text-4xl pointer-events-none z-20"
                  style={{ left: `${x}%`, top: "50%" }}
                >
                  {emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pet Image with Emotions */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={getAnimationProps()}
                transition={{ 
                  duration: petEmotion === "excited" ? 0.5 : petEmotion === "sleepy" ? 3 : 1,
                  repeat: isInteracting ? 3 : Infinity,
                  ease: "easeInOut"
                }}
                className="relative mb-4"
              >
                {/* Emotion glow */}
                <motion.div 
                  className="absolute inset-0 rounded-full blur-2xl -z-10"
                  style={{ backgroundColor: currentEmotionConfig.bgGlow }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Main pet image */}
                <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 shadow-2xl" style={{ borderColor: `${currentEmotionConfig.color}60` }}>
                  <Image 
                    src={getPetImage()} 
                    alt={petData?.name || ""} 
                    fill 
                    className="object-cover transition-all duration-300"
                    priority
                  />
                  
                  {/* Emotion overlay */}
                  <div className={cn("absolute inset-0 transition-all duration-300", currentEmotionConfig.overlay)} />
                </div>

                {/* Emotion indicators */}
                {petEmotion === "blush" && <BlushMarks />}
                {petEmotion === "angry" && <AngerMarks />}
                {petEmotion === "sleepy" && <SleepBubbles />}
                {petEmotion === "love" && <LoveHearts />}
                
                {/* Emotion badge */}
                <motion.div 
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg"
                  style={{ backgroundColor: currentEmotionConfig.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={petEmotion}
                >
                  {currentEmotionConfig.emoji} {petEmotion.charAt(0).toUpperCase() + petEmotion.slice(1)}
                </motion.div>
              </motion.div>

              {/* Pet Stats */}
              <div className="w-full max-w-sm space-y-3 mt-4">
                {[
                  { icon: Heart, value: happiness, color: "#ec4899", label: "Happiness", emoji: "❤️" },
                  { icon: Zap, value: energy, color: "#3b82f6", label: "Energy", emoji: "⚡" },
                  { icon: Cookie, value: 100 - hunger, color: "#f59e0b", label: "Fullness", emoji: "🍖" },
                  { icon: Star, value: bond, color: "#8b5cf6", label: "Bond", emoji: "💕" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stat.emoji}</span>
                        <span className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}%</span>
                    </div>
                    <div className="h-3 bg-[var(--bg-alt)] rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: stat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message Bubble */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentMessage}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-4"
          >
            <div 
              className="rounded-2xl p-5 text-white relative shadow-xl"
              style={{ background: `linear-gradient(135deg, ${currentEmotionConfig.color}, ${currentEmotionConfig.color}dd)` }}
            >
              <div className="absolute -top-3 left-8 w-6 h-6 rotate-45 rounded-sm" style={{ backgroundColor: currentEmotionConfig.color }} />
              <p className="text-lg leading-relaxed relative z-10">{currentMessage}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interactions Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h3 className="font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--accent)]" />
            Interact with {petData?.name}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {interactions.map((interaction, index) => (
              <motion.button
                key={interaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleInteraction(interaction)}
                disabled={interaction.energyCost > 0 && energy < interaction.energyCost}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--card)]/80 backdrop-blur border-2 transition-all shadow-sm hover:shadow-lg",
                  interaction.energyCost > 0 && energy < interaction.energyCost
                    ? "opacity-50 border-[var(--border)]"
                    : "hover:border-[var(--primary)]",
                  interaction.happinessBoost < 0 ? "border-red-200 dark:border-red-900 hover:border-red-400" : "border-[var(--border)]"
                )}
              >
                <span className="text-2xl">{interaction.emoji}</span>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">{interaction.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Breathing Exercise Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <button
            onClick={startBreathingExercise}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 border border-cyan-200 dark:border-cyan-800 hover:shadow-xl transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg">
              <Wind className="w-7 h-7" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-[var(--text)]">Breathing Exercise</p>
              <p className="text-sm text-[var(--text-muted)]">Calm your mind with {petData?.name}</p>
            </div>
            <div className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm">+20 XP</div>
          </button>
        </motion.div>
      </div>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathingExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-[var(--card)] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Breathe with {petData?.name}</h3>
              <p className="text-[var(--text-muted)] mb-6">Follow the circle and relax</p>
              
              <div className="relative w-48 h-48 mx-auto mb-6">
                <motion.div
                  animate={{
                    scale: breathingPhase === "inhale" ? 1.4 : 
                           breathingPhase === "hold" ? 1.4 : 
                           breathingPhase === "exhale" ? 1 : 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl"
                >
                  <span className="text-white text-xl font-semibold capitalize">{breathingPhase}</span>
                </motion.div>
              </div>
              
              <p className="text-lg text-[var(--text)] font-medium mb-2">
                {breathingPhase === "inhale" && "Breathe in slowly..."}
                {breathingPhase === "hold" && "Hold your breath..."}
                {breathingPhase === "exhale" && "Breathe out slowly..."}
                {breathingPhase === "rest" && "Rest and relax..."}
              </p>
              <p className="text-sm text-[var(--text-light)]">Round {breathCount + 1} of 4</p>
              
              <button
                onClick={() => setShowBreathingExercise(false)}
                className="mt-6 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                Skip exercise
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
