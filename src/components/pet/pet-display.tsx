"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePetStore } from "@/stores/pet-store";
import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";
import { Heart, Sparkles, Star, Zap, Moon, Sun, Cloud } from "lucide-react";

interface PetDisplayProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showName?: boolean;
  interactive?: boolean;
  showMood?: boolean;
  showParticles?: boolean;
}

const sizeClasses = {
  sm: "w-20 h-20",
  md: "w-32 h-32",
  lg: "w-44 h-44",
  xl: "w-56 h-56",
  "2xl": "w-72 h-72",
};

const imageSizes = {
  sm: 80,
  md: 128,
  lg: 176,
  xl: 224,
  "2xl": 288,
};

// High quality realistic pet images - dog and cat only
const petImages: Record<string, string> = {
  // Golden Retriever - calm (Buddy)
  calm: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop&crop=face&q=90",
  buddy: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop&crop=face&q=90",
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop&crop=face&q=90",
  
  // Cat - playful (Whiskers)
  playful: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop&crop=face&q=90",
  whiskers: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop&crop=face&q=90",
  cat: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop&crop=face&q=90",
};

// Enhanced pet interaction messages - dogs and animals
const petMessages: Record<string, string[]> = {
  calm: [
    "*wags tail gently* 🐕",
    "You're doing great today!",
    "*gives you a gentle nuzzle*",
    "I'm always here for you 💛",
    "*happy panting*",
    "Take a deep breath with me...",
    "*rests head on your lap*",
    "You're safe here 🌿",
    "*soft, comforting whine*",
    "I love spending time with you!"
  ],
  playful: [
    "*bounces excitedly* 🐕",
    "Woof! You've got this!",
    "*brings you a toy*",
    "I believe in you! 🎾",
    "*playful bark*",
    "*chases tail happily*",
    "Let's have some fun! 🎉",
    "*does a little spin*",
    "You make me so happy!",
    "*jumps with joy*"
  ],
  grounding: [
    "*sits calmly beside you* 🐕",
    "I'm right here with you.",
    "*snuggles closer*",
    "You're amazing! 💕",
    "*gentle tail wag*",
    "Feel the ground beneath you...",
    "*soft ear twitch*",
    "One moment at a time 🌸",
    "*gentle nose boop*",
    "You're doing wonderfully!"
  ],
  motivating: [
    "*barks encouragingly* 🐕",
    "Woof! You can do it!",
    "*runs in excited circles*",
    "Let's go! You're unstoppable! ✨",
    "*energetic tail wag*",
    "The sky's the limit! 🌈",
    "*excited jumping*",
    "You're a champion!",
    "Every day is a new adventure!",
    "*proud happy dance*"
  ],
};

// Pet mood states
const petMoods = ["happy", "content", "sleepy", "excited", "loving"] as const;
type PetMood = typeof petMoods[number];

const moodEmojis: Record<PetMood, string> = {
  happy: "😊",
  content: "😌",
  sleepy: "😴",
  excited: "🤩",
  loving: "🥰",
};

const moodColors: Record<PetMood, string> = {
  happy: "from-amber-400 to-yellow-300",
  content: "from-sage-400 to-emerald-300",
  sleepy: "from-indigo-400 to-purple-300",
  excited: "from-pink-400 to-rose-300",
  loving: "from-rose-400 to-pink-300",
};

// Floating particle component
function FloatingParticle({ delay, icon: Icon, color }: { delay: number; icon: React.ElementType; color: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5],
        x: [0, Math.random() * 60 - 30],
        y: [0, -80 - Math.random() * 40],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
      }}
      style={{ left: `${30 + Math.random() * 40}%`, bottom: "60%" }}
    >
      <Icon className={cn("w-4 h-4", color)} />
    </motion.div>
  );
}

export function PetDisplay({ 
  size = "lg", 
  className, 
  showName = false, 
  interactive = true,
  showMood = true,
  showParticles = true 
}: PetDisplayProps) {
  const { activePet } = usePetStore();
  const { petAnimation } = useChatStore();
  const [showInteraction, setShowInteraction] = useState(false);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [hearts, setHearts] = useState<number[]>([]);
  const [petMood, setPetMood] = useState<PetMood>("content");
  const [interactionCount, setInteractionCount] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);

  // Update pet mood based on interactions
  useEffect(() => {
    if (interactionCount > 5) {
      setPetMood("loving");
    } else if (interactionCount > 3) {
      setPetMood("excited");
    } else if (interactionCount > 1) {
      setPetMood("happy");
    }
  }, [interactionCount]);

  // Random mood changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactionCount < 2) {
        const randomMood = petMoods[Math.floor(Math.random() * petMoods.length)];
        setPetMood(randomMood);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [interactionCount]);

  // Glow effect on animation
  useEffect(() => {
    if (petAnimation === "happy" || petAnimation === "glow") {
      setIsGlowing(true);
      const timer = setTimeout(() => setIsGlowing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [petAnimation]);

  const handlePetClick = useCallback(() => {
    if (!interactive || !activePet) return;
    
    const personality = activePet.personality?.toLowerCase() || "calm";
    const messages = petMessages[personality] || petMessages.calm;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    setInteractionMessage(randomMessage);
    setShowInteraction(true);
    setInteractionCount(prev => prev + 1);
    
    const newHearts = Array.from({ length: 8 }, () => Math.random());
    setHearts(newHearts);
    
    setTimeout(() => {
      setShowInteraction(false);
      setHearts([]);
    }, 3500);
  }, [interactive, activePet]);

  // Early return AFTER all hooks
  if (!activePet) {
    return (
      <div className={cn(sizeClasses[size], "rounded-full bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse", className)} />
    );
  }

  const isHappy = petAnimation === "happy";
  
  const getAnimationVariants = () => {
    switch (petAnimation) {
      case "thinking":
        return {
          animate: { scale: [1, 1.02, 1], rotate: [0, -2, 2, 0] },
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
        };
      case "happy":
        return {
          animate: { scale: [1, 1.08, 1], y: [0, -8, 0] },
          transition: { duration: 0.5, repeat: 3, ease: "easeOut" as const },
        };
      case "glow":
        return {
          animate: {
            boxShadow: [
              "0 0 30px rgba(122, 154, 107, 0.3)",
              "0 0 60px rgba(122, 154, 107, 0.5)",
              "0 0 30px rgba(122, 154, 107, 0.3)",
            ],
          },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
        };
      default:
        return {
          animate: { scale: [1, 1.015, 1] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        };
    }
  };

  const variants = getAnimationVariants();
  
  const getPetImage = () => {
    const petType = activePet.personality?.toLowerCase() || activePet.name?.toLowerCase() || "calm";
    
    for (const [key, url] of Object.entries(petImages)) {
      if (petType.includes(key)) {
        return url;
      }
    }
    return petImages.calm;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 relative", className)}>
      {/* Ambient floating particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <FloatingParticle delay={0} icon={Sparkles} color="text-amber-400" />
          <FloatingParticle delay={1.5} icon={Star} color="text-sage-400" />
          <FloatingParticle delay={3} icon={Heart} color="text-rose-400" />
          <FloatingParticle delay={4.5} icon={Cloud} color="text-soft-blue-400" />
        </div>
      )}

      {/* Floating hearts on interaction */}
      <AnimatePresence>
        {hearts.map((offset, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none z-20"
            style={{ left: `${20 + offset * 60}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.5, rotate: -15 + Math.random() * 30 }}
            animate={{ opacity: 0, y: -120, scale: 1.2, rotate: -15 + Math.random() * 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
          >
            <Heart className="w-7 h-7 text-rose-400 fill-rose-400 drop-shadow-lg" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Interaction message bubble */}
      <AnimatePresence>
        {showInteraction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
          >
            <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 backdrop-blur-sm">
              <p className="text-base text-slate-700 font-medium">{interactionMessage}</p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-5 h-5 bg-white border-r border-b border-slate-100 rotate-45 shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet Mood Indicator */}
      {showMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-3 -right-3 z-20"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
              "bg-gradient-to-br",
              moodColors[petMood]
            )}
          >
            <span className="text-lg">{moodEmojis[petMood]}</span>
          </motion.div>
        </motion.div>
      )}

      {/* Pet Image Container */}
      <motion.div
        className={cn(
          sizeClasses[size], 
          "relative rounded-full overflow-hidden cursor-pointer",
          "ring-4 ring-white shadow-2xl",
          interactive && "hover:ring-sage-200 transition-all duration-300",
          isGlowing && "ring-sage-300"
        )}
        animate={variants.animate}
        transition={variants.transition}
        onClick={handlePetClick}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Animated gradient border */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-300 via-transparent to-emerald-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ opacity: 0.6 }}
        />
        
        <Image
          src={getPetImage()}
          alt={activePet.name || "Pet companion"}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover relative z-10"
          unoptimized
          priority
        />
        
        {/* Glow effect */}
        {(petAnimation === "glow" || isGlowing) && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-400/30 to-emerald-400/30 z-20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Happy sparkle effect */}
        {isHappy && (
          <>
            <motion.div
              className="absolute top-2 right-2 z-30"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 0.8, repeat: 3 }}
            >
              <Sparkles className="w-7 h-7 text-amber-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              className="absolute bottom-4 left-2 z-30"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 0.8, repeat: 3, delay: 0.2 }}
            >
              <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              className="absolute top-4 left-4 z-30"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 0.6, repeat: 3, delay: 0.4 }}
            >
              <Zap className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          </>
        )}

        {/* Interactive hint overlay */}
        {interactive && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/0 rounded-full z-20"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          >
            <motion.span
              className="text-white text-sm font-semibold opacity-0 drop-shadow-lg"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              Tap me! 💕
            </motion.span>
          </motion.div>
        )}
      </motion.div>
      
      {showName && activePet.name && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-slate-800 font-bold text-xl tracking-tight">{activePet.name}</p>
          {activePet.personality && (
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <motion.div 
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  activePet.personality === "calm" && "bg-blue-400",
                  activePet.personality === "playful" && "bg-amber-400",
                  activePet.personality === "grounding" && "bg-emerald-400",
                  activePet.personality === "motivating" && "bg-rose-400",
                )}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-slate-500 text-sm capitalize font-medium">{activePet.personality}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
