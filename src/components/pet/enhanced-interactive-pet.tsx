"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Volume2, MessageCircle, Smile, Utensils, Dumbbell, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { playPetVoice, getVoiceForMood, playPetSound, type PetType } from "@/lib/pet-voice-system";
import { recordPetInteraction, getBondMilestone, getNextBondMilestone, getBondProgress, type InteractionType } from "@/lib/pet-bond-system";

interface EnhancedInteractivePetProps {
  petName: string;
  petType: PetType;
  bondLevel: number;
  happiness: number;
  energy: number;
  affection: number;
  userId: string;
  petId: string;
  onInteraction?: (type: InteractionType, message: string) => void;
}

export function EnhancedInteractivePet({
  petName,
  petType,
  bondLevel,
  happiness,
  energy,
  affection,
  userId,
  petId,
  onInteraction,
}: EnhancedInteractivePetProps) {
  const [currentMood, setCurrentMood] = useState<string>("calm");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [petMessage, setPetMessage] = useState("");
  const [stats, setStats] = useState({ happiness, energy, affection });
  const [showBondInfo, setShowBondInfo] = useState(false);

  const currentMilestone = getBondMilestone(bondLevel);
  const nextMilestone = getNextBondMilestone(bondLevel);
  const bondProgress = getBondProgress(bondLevel);

  // Determine mood based on stats
  useEffect(() => {
    if (happiness > 80) setCurrentMood("joyful");
    else if (happiness > 60) setCurrentMood("playful");
    else if (happiness > 40) setCurrentMood("calm");
    else if (happiness > 20) setCurrentMood("concerned");
    else setCurrentMood("sad");
  }, [happiness]);

  const handleInteraction = async (type: InteractionType) => {
    setIsAnimating(true);

    try {
      const interaction = await recordPetInteraction(userId, petId, type);
      
      // Update stats
      setStats(prev => ({
        happiness: Math.min(100, prev.happiness + interaction.happinessGain),
        energy: Math.max(0, Math.min(100, prev.energy + interaction.energyChange)),
        affection: Math.min(100, prev.affection + interaction.affectionGain),
      }));

      // Show message
      setPetMessage(interaction.message);
      setShowMessage(true);

      // Play sound effect first (shorter)
      const soundMap: Record<InteractionType, string> = {
        'pet': petType === 'dog' ? 'buddy-bark' : 'whiskers-meow',
        'play': petType === 'dog' ? 'buddy-happy' : 'whiskers-happy',
        'feed': petType === 'dog' ? 'buddy-bark' : 'whiskers-meow',
        'talk': petType === 'dog' ? 'buddy-greeting' : 'whiskers-greeting',
        'cuddle': petType === 'dog' ? 'buddy-calm' : 'whiskers-purr',
        'exercise': petType === 'dog' ? 'buddy-playful' : 'whiskers-playful',
        'train': petType === 'dog' ? 'buddy-encouraging' : 'whiskers-encouraging',
        'celebrate': petType === 'dog' ? 'buddy-proud' : 'whiskers-proud',
        'comfort': petType === 'dog' ? 'buddy-calm' : 'whiskers-purr',
        'sleep': petType === 'dog' ? 'buddy-sleepy' : 'whiskers-sleepy',
      };
      
      const soundId = soundMap[type] || (petType === 'dog' ? 'buddy-bark' : 'whiskers-meow');
      
      // Play sound immediately (user interaction triggered)
      try {
        await playPetSound(soundId);
      } catch (err) {
        console.warn('Sound play failed:', err);
      }

      // Play voice after a short delay
      setTimeout(async () => {
        const voice = getVoiceForMood(petType, currentMood);
        if (voice) {
          try {
            await playPetVoice(voice.id);
          } catch (err) {
            console.warn('Voice play failed:', err);
          }
        }
      }, 500);

      // Call callback
      onInteraction?.(type, interaction.message);

      // Hide message after 4 seconds
      setTimeout(() => setShowMessage(false), 4000);
    } catch (error) {
      console.error("Error recording interaction:", error);
      // Still show a message even if interaction fails
      setPetMessage(`${petName} is happy to see you!`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsAnimating(false);
    }
  };

  const interactionButtons: Array<{ type: InteractionType; icon: React.ReactNode; label: string; color: string }> = [
    { type: 'pet', icon: <Heart className="w-4 h-4" />, label: 'Pet', color: 'bg-pink-100 text-pink-600 hover:bg-pink-200' },
    { type: 'play', icon: <Smile className="w-4 h-4" />, label: 'Play', color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
    { type: 'feed', icon: <Utensils className="w-4 h-4" />, label: 'Feed', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
    { type: 'talk', icon: <MessageCircle className="w-4 h-4" />, label: 'Talk', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
    { type: 'cuddle', icon: <Heart className="w-4 h-4" />, label: 'Cuddle', color: 'bg-red-100 text-red-600 hover:bg-red-200' },
    { type: 'exercise', icon: <Dumbbell className="w-4 h-4" />, label: 'Exercise', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
    { type: 'celebrate', icon: <Sparkles className="w-4 h-4" />, label: 'Celebrate', color: 'bg-purple-100 text-purple-600 hover:bg-purple-200' },
    { type: 'sleep', icon: <Moon className="w-4 h-4" />, label: 'Sleep', color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Pet Display */}
      <Card className="overflow-hidden bg-gradient-to-br from-white via-cream-50 to-olive-50/30 border-2 border-olive-200 shadow-glow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Pet Avatar */}
            <motion.div
              animate={isAnimating ? { 
                scale: [1, 1.15, 1], 
                rotate: [0, 8, -8, 0],
                y: [0, -5, 0]
              } : {
                scale: [1, 1.02, 1],
                y: [0, -3, 0]
              }}
              transition={{ 
                duration: isAnimating ? 0.6 : 3,
                repeat: isAnimating ? 0 : Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className={cn(
                "w-36 h-36 rounded-full flex items-center justify-center text-7xl shadow-glow",
                "bg-gradient-to-br",
                petType === 'dog' ? 'from-amber-100 via-cream-50 to-coral-50' : 'from-coral-100 via-cream-50 to-olive-50',
                "border-4 border-white"
              )}>
                {petType === 'dog' ? '🐕' : '🐱'}
              </div>
              
              {/* Mood indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-olive-200 text-2xl"
              >
                {currentMood === 'joyful' && '😄'}
                {currentMood === 'playful' && '🤪'}
                {currentMood === 'calm' && '😌'}
                {currentMood === 'concerned' && '😟'}
                {currentMood === 'sad' && '😢'}
              </motion.div>
            </motion.div>

            {/* Pet Name and Status */}
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-olive-800">{petName}</h3>
              <p className="text-sm text-olive-500">{currentMilestone.name}</p>
            </div>

            {/* Pet Message */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="bg-gradient-to-r from-olive-100 to-cream-100 text-olive-800 px-5 py-3 rounded-xl text-sm text-center max-w-xs shadow-md border border-olive-200 font-medium"
                >
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {petMessage}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-olive-600 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-coral-500" />
                  Happiness
                </span>
                <span className="font-medium text-olive-800">{stats.happiness}%</span>
              </div>
              <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-coral-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.happiness}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-olive-600 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Energy
                </span>
                <span className="font-medium text-olive-800">{stats.energy}%</span>
              </div>
              <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-amber-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.energy}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-olive-600 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Affection
                </span>
                <span className="font-medium text-olive-800">{stats.affection}%</span>
              </div>
              <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-pink-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.affection}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Bond Level */}
            <button
              onClick={() => setShowBondInfo(!showBondInfo)}
              className="w-full p-4 bg-gradient-to-r from-olive-100 to-cream-100 rounded-xl hover:shadow-md transition-all border border-olive-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-olive-800">Bond Level</span>
                <span className="text-lg font-bold text-olive-700">{bondLevel}/100</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-olive-400 to-olive-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bondLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {nextMilestone && (
                <p className="text-xs text-olive-600 mt-2">
                  {bondProgress.progress}% to {nextMilestone.name}
                </p>
              )}
            </button>

            {/* Bond Info */}
            <AnimatePresence>
              {showBondInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-olive-50 rounded-xl p-4 space-y-2 text-sm border border-olive-200"
                >
                  <p className="font-medium text-olive-800">{currentMilestone.name}</p>
                  <p className="text-olive-600">{currentMilestone.description}</p>
                  {nextMilestone && (
                    <p className="text-olive-500 text-xs">
                      Next: {nextMilestone.name} at {nextMilestone.level} bond
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Buttons */}
      <div className="grid grid-cols-4 gap-3">
        {interactionButtons.map(({ type, icon, label, color }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleInteraction(type)}
            disabled={isAnimating}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-md hover:shadow-lg border-2 border-white/50",
              color,
              isAnimating && "animate-pulse-subtle"
            )}
          >
            <motion.div
              animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
            <span className="text-xs font-semibold">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Sound Toggle */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="outline"
          size="sm"
          className="w-full border-2 border-olive-300 hover:border-olive-400 hover:bg-olive-50"
          onClick={async () => {
            try {
              // Play a random sound first
              const sound = petType === 'dog' ? 'buddy-bark' : 'whiskers-meow';
              await playPetSound(sound);
              
              // Then play voice after short delay
              setTimeout(async () => {
                const voice = getVoiceForMood(petType, currentMood);
                if (voice) {
                  await playPetVoice(voice.id);
                }
              }, 300);
            } catch (err) {
              console.warn('Audio play failed:', err);
            }
          }}
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Hear {petName}'s Voice
        </Button>
      </motion.div>
    </div>
  );
}
