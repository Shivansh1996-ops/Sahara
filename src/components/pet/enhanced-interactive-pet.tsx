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

      // Play voice
      const voice = getVoiceForMood(petType, currentMood);
      if (voice) {
        await playPetVoice(voice.id);
      }

      // Play sound effect
      const sound = petType === 'dog' ? 'buddy-bark' : 'whiskers-meow';
      await playPetSound(sound);

      // Call callback
      onInteraction?.(type, interaction.message);

      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
    } catch (error) {
      console.error("Error recording interaction:", error);
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
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Pet Avatar */}
            <motion.div
              animate={isAnimating ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center text-6xl",
                petType === 'dog' ? 'bg-amber-100' : 'bg-orange-100'
              )}>
                {petType === 'dog' ? '🐕' : '🐱'}
              </div>
              
              {/* Mood indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
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
              <h3 className="text-2xl font-bold text-sage-800">{petName}</h3>
              <p className="text-sm text-sage-500">{currentMilestone.name}</p>
            </div>

            {/* Pet Message */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-sage-100 text-sage-800 px-4 py-2 rounded-lg text-sm text-center max-w-xs"
                >
                  {petMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sage-600 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  Happiness
                </span>
                <span className="font-medium text-sage-800">{stats.happiness}%</span>
              </div>
              <div className="w-full bg-beige-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-red-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.happiness}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-sage-600 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Energy
                </span>
                <span className="font-medium text-sage-800">{stats.energy}%</span>
              </div>
              <div className="w-full bg-beige-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-yellow-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.energy}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-sage-600 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Affection
                </span>
                <span className="font-medium text-sage-800">{stats.affection}%</span>
              </div>
              <div className="w-full bg-beige-200 rounded-full h-2 overflow-hidden">
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
              className="w-full p-3 bg-gradient-to-r from-sage-100 to-emerald-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sage-800">Bond Level</span>
                <span className="text-lg font-bold text-sage-700">{bondLevel}/100</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-sage-400 to-emerald-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bondLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {nextMilestone && (
                <p className="text-xs text-sage-600 mt-2">
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
                  className="w-full bg-sage-50 rounded-lg p-3 space-y-2 text-sm"
                >
                  <p className="font-medium text-sage-800">{currentMilestone.name}</p>
                  <p className="text-sage-600">{currentMilestone.description}</p>
                  {nextMilestone && (
                    <p className="text-sage-500 text-xs">
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
      <div className="grid grid-cols-4 gap-2">
        {interactionButtons.map(({ type, icon, label, color }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInteraction(type)}
            disabled={isAnimating}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all disabled:opacity-50",
              color
            )}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Sound Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          const voice = getVoiceForMood(petType, currentMood);
          if (voice) playPetVoice(voice.id);
        }}
      >
        <Volume2 className="w-4 h-4 mr-2" />
        Hear {petName}'s Voice
      </Button>
    </div>
  );
}
