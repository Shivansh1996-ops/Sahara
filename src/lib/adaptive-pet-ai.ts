/**
 * Adaptive Pet AI System
 * Provides personalized, emotionally intelligent responses
 * Tracks patterns, encourages habits, and supports mental wellness
 */

import { EmotionalTone } from "./journal-analysis-engine";

// ============================================
// TYPES
// ============================================

export interface UserState {
  currentMood: EmotionalTone | null;
  moodHistory: { mood: EmotionalTone; timestamp: Date; timeOfDay: string }[];
  habitsCompleted: string[];
  habitStreak: number;
  lastInteraction: Date | null;
  journalCount: number;
  exerciseMinutes: number;
  sleepQuality: number; // 1-5
  socialInteractions: number;
  gratitudeEntries: number;
}

export interface PatternInsight {
  type: "mood_pattern" | "habit_pattern" | "time_pattern" | "improvement" | "concern";
  message: string;
  suggestion?: string;
  urgency: "low" | "medium" | "high";
}

export interface PetResponse {
  message: string;
  action?: "breathing" | "stretch" | "walk" | "journal" | "gratitude" | "social" | "rest";
  emotion: "happy" | "caring" | "encouraging" | "concerned" | "playful" | "calm";
  followUp?: string;
}

export type PetPersonality = "buddy" | "whiskers";

// ============================================
// PATTERN DETECTION
// ============================================

export function detectMoodPatterns(state: UserState): PatternInsight[] {
  const insights: PatternInsight[] = [];
  const history = state.moodHistory;
  
  if (history.length < 3) return insights;
  
  // Time-of-day patterns
  const eveningMoods = history.filter(h => h.timeOfDay === "evening");
  const morningMoods = history.filter(h => h.timeOfDay === "morning");
  
  const negativeEvenings = eveningMoods.filter(h => 
    ["sad", "anxious", "stressed", "lonely", "overwhelmed"].includes(h.mood)
  ).length;
  
  if (negativeEvenings > eveningMoods.length * 0.6 && eveningMoods.length >= 3) {
    insights.push({
      type: "time_pattern",
      message: "I've noticed you tend to feel lower in the evenings.",
      suggestion: "Want to try a wind-down routine together?",
      urgency: "medium"
    });
  }
  
  const negativeMornings = morningMoods.filter(h =>
    ["anxious", "stressed", "overwhelmed"].includes(h.mood)
  ).length;
  
  if (negativeMornings > morningMoods.length * 0.5 && morningMoods.length >= 3) {
    insights.push({
      type: "time_pattern",
      message: "Mornings seem challenging for you lately.",
      suggestion: "A gentle morning routine might help. Start with deep breaths?",
      urgency: "medium"
    });
  }
  
  // Improvement detection
  const recentMoods = history.slice(-5);
  const olderMoods = history.slice(-10, -5);
  
  const positiveRecent = recentMoods.filter(h =>
    ["positive", "hopeful", "grateful", "content"].includes(h.mood)
  ).length;
  
  const positiveOlder = olderMoods.filter(h =>
    ["positive", "hopeful", "grateful", "content"].includes(h.mood)
  ).length;
  
  if (positiveRecent > positiveOlder && olderMoods.length > 0) {
    insights.push({
      type: "improvement",
      message: `Your mood has been improving! ${recentMoods.length} better days recently.`,
      urgency: "low"
    });
  }
  
  // Consecutive low days
  const lastThree = history.slice(-3);
  const lowDays = lastThree.filter(h =>
    ["sad", "hopeless", "lonely", "overwhelmed"].includes(h.mood)
  ).length;
  
  if (lowDays >= 3) {
    insights.push({
      type: "concern",
      message: "You've had some tough days. Remember, I'm here for you.",
      suggestion: "Would you like to talk about what's been going on?",
      urgency: "high"
    });
  }
  
  return insights;
}

export function detectHabitPatterns(state: UserState): PatternInsight[] {
  const insights: PatternInsight[] = [];
  
  // Streak celebration
  if (state.habitStreak >= 3 && state.habitStreak % 3 === 0) {
    insights.push({
      type: "improvement",
      message: `${state.habitStreak} days in a row completing habits! You're doing amazing!`,
      urgency: "low"
    });
  }
  
  // Missing key habits
  const keyHabits = ["water", "exercise", "breathe", "sleep"];
  const missingToday = keyHabits.filter(h => !state.habitsCompleted.includes(h));
  
  if (missingToday.length >= 3) {
    const habitNames: Record<string, string> = {
      water: "drinking water",
      exercise: "moving your body",
      breathe: "deep breathing",
      sleep: "rest"
    };
    insights.push({
      type: "habit_pattern",
      message: `You haven't done much self-care today.`,
      suggestion: `How about starting with ${habitNames[missingToday[0]]}?`,
      urgency: "medium"
    });
  }
  
  // Low exercise
  if (state.exerciseMinutes < 10 && state.moodHistory.length > 0) {
    insights.push({
      type: "habit_pattern",
      message: "A little movement can really boost your mood!",
      suggestion: "Want to do a 5-minute stretch with me?",
      urgency: "low"
    });
  }
  
  // Sleep quality
  if (state.sleepQuality <= 2) {
    insights.push({
      type: "concern",
      message: "Sleep has been rough. That affects everything.",
      suggestion: "Let's try a calming routine before bed tonight?",
      urgency: "medium"
    });
  }
  
  return insights;
}

// ============================================
// ADAPTIVE RESPONSES BY EMOTIONAL STATE
// ============================================

const emotionalResponses: Record<EmotionalTone, {
  messages: string[];
  actions: PetResponse["action"][];
  emotion: PetResponse["emotion"];
  followUps: string[];
}> = {
  positive: {
    messages: [
      "Your positive energy is contagious! 🌟",
      "Love seeing you this happy!",
      "You're glowing today! What's your secret?",
      "This is wonderful! Let's celebrate!"
    ],
    actions: ["gratitude", "social"],
    emotion: "happy",
    followUps: ["Want to write down what made today great?", "Share this feeling with someone?"]
  },
  hopeful: {
    messages: [
      "I can feel your optimism! It's beautiful ✨",
      "Hope is powerful. I believe in you!",
      "The future is looking bright!",
      "Your hope inspires me too!"
    ],
    actions: ["gratitude", "journal"],
    emotion: "encouraging",
    followUps: ["What are you most looking forward to?", "Let's capture this hopeful feeling!"]
  },
  grateful: {
    messages: [
      "Gratitude changes everything 💕",
      "I'm grateful for you too!",
      "A thankful heart is a happy heart",
      "Counting blessings is so powerful!"
    ],
    actions: ["gratitude", "journal"],
    emotion: "happy",
    followUps: ["Want to write more about what you're grateful for?"]
  },
  content: {
    messages: [
      "Peace is precious. Enjoy this moment 🌸",
      "I love this calm energy",
      "Contentment suits you well",
      "This is a good place to be"
    ],
    actions: ["breathing", "rest"],
    emotion: "calm",
    followUps: ["Shall we do a mindfulness moment together?"]
  },
  neutral: {
    messages: [
      "Hey there! How's your day going?",
      "I'm here whenever you need me",
      "Just checking in on you 💙",
      "What's on your mind today?"
    ],
    actions: ["journal", "walk"],
    emotion: "caring",
    followUps: ["Want to talk about anything?", "Shall we do something together?"]
  },
  mixed: {
    messages: [
      "It's okay to have mixed feelings",
      "Life can be complicated. I understand",
      "Complex emotions are valid",
      "Let's sort through these feelings together"
    ],
    actions: ["journal", "breathing"],
    emotion: "caring",
    followUps: ["Want to write about what's going on?"]
  },
  anxious: {
    messages: [
      "I notice you're feeling anxious. Let's breathe together 🫂",
      "Anxiety is tough. I'm right here with you",
      "You're safe in this moment. Let's ground ourselves",
      "Those worries are heavy. Can I help carry them?"
    ],
    actions: ["breathing", "stretch"],
    emotion: "caring",
    followUps: ["4 deep breaths with me?", "Let's try the 5-4-3-2-1 grounding technique?"]
  },
  worried: {
    messages: [
      "Those worries sound heavy. I'm listening 💙",
      "It's okay to be concerned. Let's talk through it",
      "Worrying shows you care. But let's not let it consume you",
      "I hear your concerns. Let's take one thing at a time"
    ],
    actions: ["journal", "breathing"],
    emotion: "caring",
    followUps: ["Want to write down what's worrying you?", "Sometimes naming worries takes their power away"]
  },
  fearful: {
    messages: [
      "You're safe here with me 💕",
      "Fear is trying to protect you, but you're okay",
      "I'm right beside you. You're not alone",
      "Let's take this one breath at a time"
    ],
    actions: ["breathing", "rest"],
    emotion: "caring",
    followUps: ["Focus on my voice. Breathe with me?", "You've been brave before. You can do this."]
  },
  sad: {
    messages: [
      "I'm sorry you're feeling sad 💙 I'm here",
      "It's okay to feel this way. Sadness is part of being human",
      "I wish I could give you a hug right now",
      "Your feelings matter. Let them flow"
    ],
    actions: ["journal", "social"],
    emotion: "caring",
    followUps: ["Want to talk about it?", "Sometimes just sitting together helps"]
  },
  lonely: {
    messages: [
      "I'm right here with you. You're not alone 💕",
      "Loneliness is painful. But I see you",
      "Even when it doesn't feel like it, people care about you",
      "Let's spend some time together"
    ],
    actions: ["social", "journal"],
    emotion: "caring",
    followUps: ["Would reaching out to someone help?", "I'm always here to keep you company"]
  },
  hopeless: {
    messages: [
      "Even when it's dark, I'm still here with you 💙",
      "Hopelessness lies. Things can get better",
      "You matter. Your life matters. Please believe that",
      "One moment at a time. That's all you need to focus on"
    ],
    actions: ["breathing", "social"],
    emotion: "concerned",
    followUps: ["Please reach out to someone who can help. You deserve support.", "Can we take just one small step together?"]
  },
  angry: {
    messages: [
      "Your anger is valid. It's okay to feel this way",
      "Let's channel this energy somewhere safe",
      "Anger often protects hurt underneath. I see you",
      "Take a breath. I'm listening"
    ],
    actions: ["breathing", "stretch", "walk"],
    emotion: "caring",
    followUps: ["Want to go for a walk to clear your head?", "Physical movement can help release this energy"]
  },
  frustrated: {
    messages: [
      "Frustration is exhausting. I get it",
      "It's okay to be frustrated. Some things ARE hard",
      "Let's take a step back together",
      "You're doing your best. That's enough"
    ],
    actions: ["breathing", "stretch"],
    emotion: "caring",
    followUps: ["A short break might help. Walk with me?", "Sometimes stepping away brings clarity"]
  },
  irritated: {
    messages: [
      "Something's bothering you. Want to talk?",
      "It's one of those days, huh?",
      "Let's shake off this irritation together",
      "Deep breaths can help reset"
    ],
    actions: ["breathing", "walk"],
    emotion: "playful",
    followUps: ["Quick stretch to shake it off?", "Let's do something fun!"]
  },
  stressed: {
    messages: [
      "That stress is real. But you're not alone 💙",
      "One thing at a time. You've got this",
      "Let's take a moment to decompress",
      "Stress is temporary. Let's work through it"
    ],
    actions: ["breathing", "stretch", "walk"],
    emotion: "encouraging",
    followUps: ["5-minute breathing break?", "What's the most important thing right now?"]
  },
  overwhelmed: {
    messages: [
      "It sounds like a lot right now. Let's slow down 🫂",
      "You don't have to do everything. Just the next small thing",
      "I'm here. Let's take this together",
      "Overwhelm is a signal to pause, not push harder"
    ],
    actions: ["breathing", "rest"],
    emotion: "caring",
    followUps: ["Let's just breathe for now. Nothing else matters.", "What's ONE thing we can let go of?"]
  }
};

// ============================================
// PET PERSONALITY RESPONSES
// ============================================

const personalityModifiers: Record<PetPersonality, {
  prefix: string[];
  emoji: string;
  style: "energetic" | "calm";
}> = {
  buddy: {
    prefix: ["*excited tail wag*", "*happy bounce*", "*loyal gaze*", "*brings you a ball*"],
    emoji: "🐕",
    style: "energetic"
  },
  whiskers: {
    prefix: ["*gentle purr*", "*slow blink*", "*soft meow*", "*curls up beside you*"],
    emoji: "🐱",
    style: "calm"
  }
};

// ============================================
// MAIN FUNCTIONS
// ============================================

export function generatePetResponse(
  state: UserState,
  personality: PetPersonality = "buddy"
): PetResponse {
  const mood = state.currentMood || "neutral";
  const responses = emotionalResponses[mood];
  const pers = personalityModifiers[personality];
  
  // Select random response elements
  const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
  const message = responses.messages[Math.floor(Math.random() * responses.messages.length)];
  const action = responses.actions[Math.floor(Math.random() * responses.actions.length)];
  const followUp = responses.followUps[Math.floor(Math.random() * responses.followUps.length)];
  
  return {
    message: `${prefix} ${message}`,
    action,
    emotion: responses.emotion,
    followUp
  };
}

export function generatePatternAwareResponse(
  state: UserState,
  personality: PetPersonality = "buddy"
): PetResponse {
  const moodPatterns = detectMoodPatterns(state);
  const habitPatterns = detectHabitPatterns(state);
  const allPatterns = [...moodPatterns, ...habitPatterns];
  const pers = personalityModifiers[personality];
  
  // Prioritize high urgency patterns
  const highPriority = allPatterns.find(p => p.urgency === "high");
  const mediumPriority = allPatterns.find(p => p.urgency === "medium");
  
  if (highPriority) {
    const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
    return {
      message: `${prefix} ${highPriority.message}`,
      emotion: "concerned",
      followUp: highPriority.suggestion
    };
  }
  
  if (mediumPriority) {
    const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
    return {
      message: `${prefix} ${mediumPriority.message}`,
      emotion: "caring",
      followUp: mediumPriority.suggestion,
      action: mediumPriority.type === "habit_pattern" ? "stretch" : "breathing"
    };
  }
  
  // Check for celebrations
  const improvement = allPatterns.find(p => p.type === "improvement");
  if (improvement) {
    const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
    return {
      message: `${prefix} ${improvement.message}`,
      emotion: "happy",
      followUp: "Keep up the amazing work! 🎉"
    };
  }
  
  // Default to emotional response
  return generatePetResponse(state, personality);
}

export function generateTimeBasedGreeting(
  state: UserState,
  personality: PetPersonality = "buddy"
): string {
  const hour = new Date().getHours();
  const pers = personalityModifiers[personality];
  const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
  
  const greetings: Record<string, string[]> = {
    morning: [
      "Good morning! Ready to start the day? ☀️",
      "Rise and shine! I've been waiting for you!",
      "Morning! Let's make today great together!"
    ],
    afternoon: [
      "Good afternoon! How's your day going?",
      "Hey there! Taking a break?",
      "Afternoon check-in! How are you feeling?"
    ],
    evening: [
      "Good evening! Time to wind down 🌙",
      "Hey! How was your day?",
      "Evening! Let's reflect on today together"
    ],
    night: [
      "Still up? Let's do something calming 🌟",
      "Night owl, huh? I'm here with you",
      "Can't sleep? Let's try some deep breaths"
    ]
  };
  
  let timeOfDay: string;
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17 && hour < 21) timeOfDay = "evening";
  else timeOfDay = "night";
  
  const greeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];
  return `${prefix} ${greeting}`;
}

export function generateHabitReminder(
  habit: string,
  personality: PetPersonality = "buddy"
): string {
  const pers = personalityModifiers[personality];
  const prefix = pers.prefix[Math.floor(Math.random() * pers.prefix.length)];
  
  const reminders: Record<string, string[]> = {
    water: [
      "Have you had water recently? Stay hydrated! 💧",
      "Water break time! Your body will thank you",
      "Hydration check! Let's drink some water together"
    ],
    exercise: [
      "Time to move that body! Even 5 minutes helps 💪",
      "Your body wants to move! Quick stretch?",
      "Movement is medicine! Walk with me?"
    ],
    breathe: [
      "Let's take a breathing break 🌬️",
      "Deep breaths reset everything. Join me?",
      "Pause for a moment. Breathe with me"
    ],
    sleep: [
      "Rest is important! Are you getting enough? 😴",
      "Your body needs recovery time",
      "Quality sleep changes everything"
    ],
    journal: [
      "Want to write about your day? 📝",
      "Journaling helps process feelings",
      "Let's capture your thoughts together"
    ],
    gratitude: [
      "What's one thing you're grateful for? 🙏",
      "Gratitude shifts perspective. What's good today?",
      "Find one small blessing in this moment"
    ]
  };
  
  const messages = reminders[habit] || reminders.breathe;
  return `${prefix} ${messages[Math.floor(Math.random() * messages.length)]}`;
}

export function celebrateAchievement(
  achievement: string,
  personality: PetPersonality = "buddy"
): string {
  const pers = personalityModifiers[personality];
  
  const celebrations: Record<string, string[]> = {
    streak: [
      "Amazing streak! You're unstoppable! 🔥",
      "Look at you go! Consistency is key! 🌟",
      "Streak champion! So proud of you! 🏆"
    ],
    mood_improvement: [
      "Your mood has been improving! I noticed! 📈",
      "Things are looking up! You're doing great! 🌈",
      "Progress! Your hard work is paying off! 💪"
    ],
    habit_complete: [
      "You did it! Another habit checked off! ✅",
      "Way to go! Self-care superstar! ⭐",
      "Excellent! You're taking care of yourself! 💕"
    ],
    journal_entry: [
      "Beautiful reflection! Writing helps so much! 📖",
      "Thank you for sharing your thoughts! 💙",
      "Self-awareness is powerful! Great journaling! ✨"
    ],
    breathing: [
      "Great breathing session! Feel the calm? 🧘",
      "You took time to breathe! That takes discipline! 🌸",
      "Mindfulness moment complete! Well done! 🕊️"
    ]
  };
  
  const messages = celebrations[achievement] || celebrations.habit_complete;
  const prefix = pers.style === "energetic" ? "*excited jumping*" : "*proud purr*";
  return `${prefix} ${messages[Math.floor(Math.random() * messages.length)]}`;
}





