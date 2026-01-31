/**
 * Wellness Insights & Mood Prediction Engine
 * Analyzes user data to generate insights, predictions, and recommendations
 */

import { EmotionalTone } from "./journal-analysis-engine";

// ============================================
// TYPES
// ============================================

export interface WellnessData {
  moodEntries: { mood: EmotionalTone; timestamp: Date; score: number }[];
  habitCompletions: { habit: string; date: Date; completed: boolean }[];
  journalEntries: { date: Date; sentiment: number; themes: string[] }[];
  sleepData: { date: Date; quality: number; hours: number }[];
  exerciseData: { date: Date; minutes: number; type: string }[];
  socialData: { date: Date; interactions: number }[];
}

export interface InsightCard {
  id: string;
  type: "mood" | "habit" | "sleep" | "exercise" | "social" | "pattern" | "prediction" | "achievement";
  title: string;
  description: string;
  icon: string;
  color: string;
  metric?: string;
  trend?: "up" | "down" | "stable";
  actionable?: string;
  priority: number; // 1-10, higher = more important
}

export interface MoodPrediction {
  predictedMood: EmotionalTone;
  confidence: number;
  factors: { factor: string; impact: "positive" | "negative"; weight: number }[];
  suggestion: string;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  overallScore: number;
  moodSummary: {
    averageValence: number;
    dominantMood: EmotionalTone;
    moodSwings: number;
    bestDay: string;
    challengingDay: string;
  };
  habitSummary: {
    completionRate: number;
    bestHabit: string;
    needsWork: string;
    streak: number;
  };
  sleepSummary: {
    averageHours: number;
    averageQuality: number;
    trend: "improving" | "declining" | "stable";
  };
  exerciseSummary: {
    totalMinutes: number;
    daysActive: number;
    favoriteActivity: string;
  };
  keyInsights: string[];
  recommendations: string[];
  celebrateMoments: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  category: "mindfulness" | "exercise" | "social" | "sleep" | "journaling" | "gratitude" | "cbt";
  title: string;
  description: string;
  duration: string;
  difficulty: "easy" | "medium" | "challenging";
  basedOn: string; // What data triggered this
  impact: string;
}

// ============================================
// MOOD PREDICTION
// ============================================

export function predictTomorrowMood(data: WellnessData): MoodPrediction {
  const factors: MoodPrediction["factors"] = [];
  let moodScore = 50; // Neutral baseline
  
  // Analyze recent mood trend
  const recentMoods = data.moodEntries.slice(-7);
  if (recentMoods.length > 0) {
    const avgScore = recentMoods.reduce((a, b) => a + b.score, 0) / recentMoods.length;
    const trend = recentMoods.length >= 3 
      ? (recentMoods.slice(-3).reduce((a, b) => a + b.score, 0) / 3) - 
        (recentMoods.slice(0, 3).reduce((a, b) => a + b.score, 0) / 3)
      : 0;
    
    if (trend > 5) {
      factors.push({ factor: "Mood trending upward", impact: "positive", weight: 15 });
      moodScore += 15;
    } else if (trend < -5) {
      factors.push({ factor: "Mood trending downward", impact: "negative", weight: 15 });
      moodScore -= 15;
    }
    
    moodScore = (moodScore + avgScore) / 2;
  }
  
  // Sleep impact
  const recentSleep = data.sleepData.slice(-3);
  if (recentSleep.length > 0) {
    const avgSleep = recentSleep.reduce((a, b) => a + b.quality, 0) / recentSleep.length;
    const avgHours = recentSleep.reduce((a, b) => a + b.hours, 0) / recentSleep.length;
    
    if (avgSleep >= 4 && avgHours >= 7) {
      factors.push({ factor: "Good sleep quality", impact: "positive", weight: 12 });
      moodScore += 12;
    } else if (avgSleep <= 2 || avgHours < 5) {
      factors.push({ factor: "Poor sleep recently", impact: "negative", weight: 15 });
      moodScore -= 15;
    }
  }
  
  // Exercise impact
  const recentExercise = data.exerciseData.slice(-7);
  const totalMinutes = recentExercise.reduce((a, b) => a + b.minutes, 0);
  
  if (totalMinutes >= 150) {
    factors.push({ factor: "Active lifestyle", impact: "positive", weight: 10 });
    moodScore += 10;
  } else if (totalMinutes < 30) {
    factors.push({ factor: "Limited physical activity", impact: "negative", weight: 8 });
    moodScore -= 8;
  }
  
  // Social impact
  const recentSocial = data.socialData.slice(-7);
  const totalInteractions = recentSocial.reduce((a, b) => a + b.interactions, 0);
  
  if (totalInteractions >= 5) {
    factors.push({ factor: "Good social connection", impact: "positive", weight: 8 });
    moodScore += 8;
  } else if (totalInteractions === 0) {
    factors.push({ factor: "Social isolation", impact: "negative", weight: 10 });
    moodScore -= 10;
  }
  
  // Habit completion impact
  const recentHabits = data.habitCompletions.slice(-7);
  const completionRate = recentHabits.length > 0
    ? recentHabits.filter(h => h.completed).length / recentHabits.length
    : 0;
  
  if (completionRate >= 0.7) {
    factors.push({ factor: "Consistent self-care habits", impact: "positive", weight: 10 });
    moodScore += 10;
  } else if (completionRate < 0.3) {
    factors.push({ factor: "Neglected habits", impact: "negative", weight: 8 });
    moodScore -= 8;
  }
  
  // Day of week pattern (if enough data)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay();
  
  // Monday tends to be harder for many
  if (dayOfWeek === 1) {
    factors.push({ factor: "Monday typically challenging", impact: "negative", weight: 5 });
    moodScore -= 5;
  }
  // Friday/Saturday tend to be better
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    factors.push({ factor: "Weekend approaching", impact: "positive", weight: 5 });
    moodScore += 5;
  }
  
  // Convert score to mood
  moodScore = Math.max(0, Math.min(100, moodScore));
  
  let predictedMood: EmotionalTone;
  if (moodScore >= 75) predictedMood = "positive";
  else if (moodScore >= 60) predictedMood = "hopeful";
  else if (moodScore >= 50) predictedMood = "content";
  else if (moodScore >= 40) predictedMood = "neutral";
  else if (moodScore >= 30) predictedMood = "stressed";
  else if (moodScore >= 20) predictedMood = "anxious";
  else predictedMood = "sad";
  
  // Generate suggestion based on lowest factors
  const negativeFactors = factors.filter(f => f.impact === "negative").sort((a, b) => b.weight - a.weight);
  let suggestion = "Keep up the good work!";
  
  if (negativeFactors.length > 0) {
    const topNegative = negativeFactors[0].factor.toLowerCase();
    if (topNegative.includes("sleep")) {
      suggestion = "Try going to bed 30 minutes earlier tonight";
    } else if (topNegative.includes("activity") || topNegative.includes("exercise")) {
      suggestion = "A short walk tomorrow could boost your mood";
    } else if (topNegative.includes("social")) {
      suggestion = "Consider reaching out to a friend tomorrow";
    } else if (topNegative.includes("habit")) {
      suggestion = "Focus on just one self-care habit tomorrow";
    } else if (topNegative.includes("mood")) {
      suggestion = "Try a gratitude exercise to shift perspective";
    }
  }
  
  return {
    predictedMood,
    confidence: Math.min(0.85, 0.5 + (factors.length * 0.05)),
    factors: factors.slice(0, 5),
    suggestion
  };
}

// ============================================
// INSIGHT GENERATION
// ============================================

export function generateInsightCards(data: WellnessData): InsightCard[] {
  const cards: InsightCard[] = [];
  
  // Mood insight
  const recentMoods = data.moodEntries.slice(-7);
  if (recentMoods.length > 0) {
    const avgScore = recentMoods.reduce((a, b) => a + b.score, 0) / recentMoods.length;
    const oldAvg = data.moodEntries.slice(-14, -7).reduce((a, b) => a + b.score, 0) / 7 || avgScore;
    const trend = avgScore > oldAvg + 5 ? "up" : avgScore < oldAvg - 5 ? "down" : "stable";
    
    cards.push({
      id: "mood-trend",
      type: "mood",
      title: "Mood Trend",
      description: trend === "up" 
        ? "Your mood has been improving! Keep it up!"
        : trend === "down"
        ? "Your mood has dipped. Let's work on that together."
        : "Your mood has been stable this week.",
      icon: trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️",
      color: trend === "up" ? "#22c55e" : trend === "down" ? "#f59e0b" : "#6b7280",
      metric: `${Math.round(avgScore)}%`,
      trend,
      priority: 8
    });
  }
  
  // Habit streak
  const habitDates = [...new Set(data.habitCompletions.filter(h => h.completed).map(h => h.date.toDateString()))];
  let streak = 0;
  const today = new Date().toDateString();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    if (habitDates.includes(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) break;
  }
  
  if (streak >= 3) {
    cards.push({
      id: "habit-streak",
      type: "achievement",
      title: `${streak} Day Streak! 🔥`,
      description: `You've been consistent for ${streak} days. Amazing dedication!`,
      icon: "🔥",
      color: "#f59e0b",
      metric: `${streak} days`,
      trend: "up",
      priority: 7
    });
  }
  
  // Sleep insight
  const recentSleep = data.sleepData.slice(-7);
  if (recentSleep.length > 0) {
    const avgHours = recentSleep.reduce((a, b) => a + b.hours, 0) / recentSleep.length;
    const avgQuality = recentSleep.reduce((a, b) => a + b.quality, 0) / recentSleep.length;
    
    cards.push({
      id: "sleep-insight",
      type: "sleep",
      title: "Sleep Quality",
      description: avgQuality >= 4 
        ? "Great sleep this week! This fuels your wellbeing."
        : avgQuality <= 2
        ? "Sleep has been rough. This affects your mood."
        : "Sleep is okay. Room for improvement.",
      icon: "😴",
      color: avgQuality >= 4 ? "#22c55e" : avgQuality <= 2 ? "#ef4444" : "#eab308",
      metric: `${avgHours.toFixed(1)}h avg`,
      trend: avgQuality >= 4 ? "up" : avgQuality <= 2 ? "down" : "stable",
      actionable: avgQuality <= 2 ? "Try a relaxing routine before bed" : undefined,
      priority: avgQuality <= 2 ? 9 : 5
    });
  }
  
  // Exercise insight
  const weeklyExercise = data.exerciseData.slice(-7).reduce((a, b) => a + b.minutes, 0);
  cards.push({
    id: "exercise-insight",
    type: "exercise",
    title: "Physical Activity",
    description: weeklyExercise >= 150
      ? "You're hitting exercise goals! Physical health boosts mental health."
      : weeklyExercise >= 60
      ? "Good movement this week. Can you add a bit more?"
      : "More movement could really help your mood.",
    icon: "🏃",
    color: weeklyExercise >= 150 ? "#22c55e" : weeklyExercise >= 60 ? "#eab308" : "#ef4444",
    metric: `${weeklyExercise} min`,
    trend: weeklyExercise >= 150 ? "up" : weeklyExercise < 60 ? "down" : "stable",
    actionable: weeklyExercise < 60 ? "Start with a 10-minute walk today" : undefined,
    priority: weeklyExercise < 60 ? 7 : 4
  });
  
  // Social connection
  const weeklySocial = data.socialData.slice(-7).reduce((a, b) => a + b.interactions, 0);
  if (weeklySocial === 0) {
    cards.push({
      id: "social-insight",
      type: "social",
      title: "Social Connection",
      description: "No social interactions logged this week. Connection helps wellbeing.",
      icon: "👋",
      color: "#ec4899",
      actionable: "Reach out to one person today",
      priority: 8
    });
  } else if (weeklySocial >= 5) {
    cards.push({
      id: "social-insight",
      type: "social",
      title: "Great Connections!",
      description: "You've been socially active. This is great for mental health!",
      icon: "💕",
      color: "#22c55e",
      metric: `${weeklySocial} interactions`,
      priority: 3
    });
  }
  
  // Prediction card
  const prediction = predictTomorrowMood(data);
  cards.push({
    id: "mood-prediction",
    type: "prediction",
    title: "Tomorrow's Outlook",
    description: `Based on your patterns, tomorrow might feel ${prediction.predictedMood}.`,
    icon: "🔮",
    color: prediction.predictedMood === "positive" || prediction.predictedMood === "hopeful" 
      ? "#22c55e" 
      : prediction.predictedMood === "stressed" || prediction.predictedMood === "anxious"
      ? "#f59e0b"
      : "#6b7280",
    actionable: prediction.suggestion,
    priority: 6
  });
  
  return cards.sort((a, b) => b.priority - a.priority);
}

// ============================================
// PERSONALIZED RECOMMENDATIONS
// ============================================

export function generateRecommendations(data: WellnessData): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];
  
  // Analyze what's needed most
  const recentMoods = data.moodEntries.slice(-7);
  const hasAnxiety = recentMoods.some(m => ["anxious", "worried", "stressed", "overwhelmed"].includes(m.mood));
  const hasSadness = recentMoods.some(m => ["sad", "lonely", "hopeless"].includes(m.mood));
  const avgSleep = data.sleepData.slice(-7).reduce((a, b) => a + b.quality, 0) / (data.sleepData.slice(-7).length || 1);
  const weeklyExercise = data.exerciseData.slice(-7).reduce((a, b) => a + b.minutes, 0);
  const weeklySocial = data.socialData.slice(-7).reduce((a, b) => a + b.interactions, 0);
  
  // Mindfulness for anxiety
  if (hasAnxiety) {
    recommendations.push({
      id: "breathing-exercise",
      category: "mindfulness",
      title: "4-7-8 Breathing",
      description: "A calming breathing technique: inhale 4s, hold 7s, exhale 8s. Reduces anxiety.",
      duration: "5 min",
      difficulty: "easy",
      basedOn: "Recent anxious feelings",
      impact: "Immediate calm, reduced heart rate"
    });
    
    recommendations.push({
      id: "grounding-exercise",
      category: "mindfulness",
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
      duration: "3 min",
      difficulty: "easy",
      basedOn: "Anxiety patterns",
      impact: "Brings focus to present moment"
    });
  }
  
  // CBT for negative thoughts
  if (hasSadness) {
    recommendations.push({
      id: "thought-record",
      category: "cbt",
      title: "Thought Challenge",
      description: "Write down a negative thought, identify the distortion, and reframe it positively.",
      duration: "10 min",
      difficulty: "medium",
      basedOn: "Low mood patterns",
      impact: "Breaks negative thought cycles"
    });
    
    recommendations.push({
      id: "gratitude-list",
      category: "gratitude",
      title: "Gratitude List",
      description: "Write 3 specific things you're grateful for today, no matter how small.",
      duration: "5 min",
      difficulty: "easy",
      basedOn: "Mood needs lifting",
      impact: "Shifts focus to positives"
    });
  }
  
  // Sleep recommendations
  if (avgSleep < 3) {
    recommendations.push({
      id: "sleep-routine",
      category: "sleep",
      title: "Wind-Down Routine",
      description: "30 min before bed: dim lights, no screens, gentle stretching or reading.",
      duration: "30 min",
      difficulty: "medium",
      basedOn: "Poor sleep quality",
      impact: "Better sleep = better mood"
    });
  }
  
  // Exercise recommendations
  if (weeklyExercise < 60) {
    recommendations.push({
      id: "walking",
      category: "exercise",
      title: "Mood-Boosting Walk",
      description: "A brisk 15-minute walk outdoors. Natural light and movement help mood.",
      duration: "15 min",
      difficulty: "easy",
      basedOn: "Limited physical activity",
      impact: "Endorphin release, vitamin D"
    });
  }
  
  // Social recommendations
  if (weeklySocial < 2) {
    recommendations.push({
      id: "social-reach-out",
      category: "social",
      title: "Connection Moment",
      description: "Send a text or make a quick call to someone you care about.",
      duration: "5 min",
      difficulty: "easy",
      basedOn: "Low social interaction",
      impact: "Reduces isolation, boosts mood"
    });
  }
  
  // Always include journaling
  recommendations.push({
    id: "evening-journal",
    category: "journaling",
    title: "Evening Reflection",
    description: "Write about your day: one challenge, one win, one thing you learned.",
    duration: "10 min",
    difficulty: "easy",
    basedOn: "Self-awareness building",
    impact: "Processes emotions, builds insight"
  });
  
  return recommendations.slice(0, 6);
}

// ============================================
// WEEKLY REPORT
// ============================================

export function generateWeeklyReport(data: WellnessData): WeeklyReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekEnd = now;
  
  // Mood summary
  const weekMoods = data.moodEntries.filter(m => m.timestamp >= weekStart);
  const avgValence = weekMoods.length > 0 
    ? weekMoods.reduce((a, b) => a + b.score, 0) / weekMoods.length 
    : 50;
  
  const moodCounts: Record<string, number> = {};
  weekMoods.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionalTone || "neutral";
  
  const scores = weekMoods.map(m => m.score);
  const moodSwings = scores.length > 1 
    ? scores.reduce((acc, s, i) => i > 0 ? acc + Math.abs(s - scores[i-1]) : 0, 0) / (scores.length - 1)
    : 0;
  
  // Habit summary
  const weekHabits = data.habitCompletions.filter(h => h.date >= weekStart);
  const habitStats: Record<string, { completed: number; total: number }> = {};
  weekHabits.forEach(h => {
    if (!habitStats[h.habit]) habitStats[h.habit] = { completed: 0, total: 0 };
    habitStats[h.habit].total++;
    if (h.completed) habitStats[h.habit].completed++;
  });
  
  const completionRate = weekHabits.length > 0
    ? weekHabits.filter(h => h.completed).length / weekHabits.length
    : 0;
  
  const habitRates = Object.entries(habitStats).map(([habit, stats]) => ({
    habit,
    rate: stats.completed / stats.total
  })).sort((a, b) => b.rate - a.rate);
  
  // Sleep summary
  const weekSleep = data.sleepData.filter(s => s.date >= weekStart);
  const avgSleepHours = weekSleep.length > 0 
    ? weekSleep.reduce((a, b) => a + b.hours, 0) / weekSleep.length 
    : 0;
  const avgSleepQuality = weekSleep.length > 0 
    ? weekSleep.reduce((a, b) => a + b.quality, 0) / weekSleep.length 
    : 0;
  
  // Exercise summary
  const weekExercise = data.exerciseData.filter(e => e.date >= weekStart);
  const totalMinutes = weekExercise.reduce((a, b) => a + b.minutes, 0);
  const daysActive = new Set(weekExercise.map(e => e.date.toDateString())).size;
  
  // Calculate overall score
  const overallScore = Math.round(
    (avgValence * 0.35) +
    (completionRate * 100 * 0.25) +
    (Math.min(avgSleepQuality / 5, 1) * 100 * 0.2) +
    (Math.min(totalMinutes / 150, 1) * 100 * 0.2)
  );
  
  // Generate insights
  const keyInsights: string[] = [];
  const recommendations: string[] = [];
  const celebrateMoments: string[] = [];
  
  if (avgValence > 60) {
    keyInsights.push("Your overall mood was positive this week!");
    celebrateMoments.push("Maintained good emotional balance");
  } else if (avgValence < 40) {
    keyInsights.push("This was a challenging week emotionally.");
    recommendations.push("Consider scheduling more self-care time");
  }
  
  if (completionRate >= 0.7) {
    celebrateMoments.push(`Completed ${Math.round(completionRate * 100)}% of habits!`);
  } else {
    recommendations.push("Try focusing on just 2-3 key habits next week");
  }
  
  if (avgSleepHours < 6) {
    keyInsights.push("Sleep was below recommended levels.");
    recommendations.push("Prioritize getting 7-8 hours of sleep");
  }
  
  if (totalMinutes >= 150) {
    celebrateMoments.push("Hit the recommended 150 minutes of exercise!");
  } else {
    recommendations.push("Add more movement - even short walks help");
  }
  
  return {
    weekStart,
    weekEnd,
    overallScore,
    moodSummary: {
      averageValence: avgValence,
      dominantMood,
      moodSwings: Math.round(moodSwings),
      bestDay: "Saturday", // Would need more data to calculate
      challengingDay: "Monday"
    },
    habitSummary: {
      completionRate: Math.round(completionRate * 100),
      bestHabit: habitRates[0]?.habit || "None",
      needsWork: habitRates[habitRates.length - 1]?.habit || "None",
      streak: 0 // Would need streak calculation
    },
    sleepSummary: {
      averageHours: Math.round(avgSleepHours * 10) / 10,
      averageQuality: Math.round(avgSleepQuality * 10) / 10,
      trend: "stable"
    },
    exerciseSummary: {
      totalMinutes,
      daysActive,
      favoriteActivity: weekExercise[0]?.type || "Walking"
    },
    keyInsights,
    recommendations,
    celebrateMoments
  };
}

// ============================================
// GRATITUDE PROMPTS
// ============================================

export const gratitudePrompts = [
  "What's one small thing that made you smile today?",
  "Who is someone you're grateful to have in your life?",
  "What's a simple pleasure you often take for granted?",
  "What's something your body did for you today?",
  "What's a challenge that helped you grow?",
  "What's something beautiful you noticed recently?",
  "What's a skill or ability you're thankful for?",
  "What's a memory that brings you joy?",
  "What's something in nature you appreciate?",
  "What's a comfort you have that others might not?",
  "What made today slightly better than yesterday?",
  "What's something you're looking forward to?",
  "Who showed you kindness recently?",
  "What's a lesson you're grateful to have learned?",
  "What's working well in your life right now?"
];

export function getRandomGratitudePrompt(): string {
  return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];
}

// ============================================
// MINDFULNESS EXERCISES
// ============================================

export interface MindfulnessExercise {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  steps: string[];
  forMood: EmotionalTone[];
}

export const mindfulnessExercises: MindfulnessExercise[] = [
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "A calming technique used by Navy SEALs",
    duration: 240,
    steps: [
      "Breathe in slowly for 4 seconds",
      "Hold your breath for 4 seconds",
      "Exhale slowly for 4 seconds",
      "Hold empty for 4 seconds",
      "Repeat 4 times"
    ],
    forMood: ["anxious", "stressed", "overwhelmed", "worried"]
  },
  {
    id: "478-breathing",
    name: "4-7-8 Breathing",
    description: "Promotes deep relaxation and sleep",
    duration: 180,
    steps: [
      "Exhale completely through your mouth",
      "Inhale through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale through mouth for 8 seconds",
      "Repeat 3 times"
    ],
    forMood: ["anxious", "stressed", "fearful"]
  },
  {
    id: "body-scan",
    name: "Quick Body Scan",
    description: "Release tension throughout your body",
    duration: 300,
    steps: [
      "Close your eyes and take 3 deep breaths",
      "Notice your feet - release any tension",
      "Move up to your legs - let them relax",
      "Notice your stomach and chest - soften",
      "Relax your shoulders, arms, hands",
      "Release tension in your face and jaw",
      "Take 3 more breaths and open your eyes"
    ],
    forMood: ["stressed", "overwhelmed", "angry", "frustrated"]
  },
  {
    id: "grounding-54321",
    name: "5-4-3-2-1 Grounding",
    description: "Brings you back to the present moment",
    duration: 180,
    steps: [
      "Name 5 things you can SEE",
      "Name 4 things you can TOUCH",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
      "Take a deep breath - you are here, now"
    ],
    forMood: ["anxious", "fearful", "overwhelmed", "sad"]
  },
  {
    id: "loving-kindness",
    name: "Loving-Kindness",
    description: "Cultivate compassion for yourself and others",
    duration: 300,
    steps: [
      "Close your eyes and breathe deeply",
      "Say: 'May I be happy, may I be healthy, may I be safe'",
      "Think of someone you love, send them the same wishes",
      "Think of someone neutral, send them the same wishes",
      "Extend these wishes to all beings everywhere",
      "Rest in this feeling of universal love"
    ],
    forMood: ["lonely", "sad", "angry", "frustrated"]
  }
];

export function getExerciseForMood(mood: EmotionalTone): MindfulnessExercise {
  const suitable = mindfulnessExercises.filter(e => e.forMood.includes(mood));
  if (suitable.length > 0) {
    return suitable[Math.floor(Math.random() * suitable.length)];
  }
  return mindfulnessExercises[0]; // Default to box breathing
}





