/**
 * Habit Coach System
 * 
 * Helps users build and maintain healthy wellness habits with
 * tracking, streaks, reminders, and encouragement.
 */

// ============================================================================
// TYPES
// ============================================================================

export type HabitCategory = 
  | 'mindfulness'
  | 'exercise'
  | 'sleep'
  | 'social'
  | 'nutrition'
  | 'gratitude'
  | 'journaling'
  | 'breathing'
  | 'self_care';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[]; // 0-6 for custom frequency (0 = Sunday)
  reminderTime?: string; // HH:MM format
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  completions: HabitCompletion[];
  createdAt: Date;
  isActive: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: Date;
  note?: string;
  mood?: number; // 1-5
}

export interface HabitSuggestion {
  name: string;
  description: string;
  category: HabitCategory;
  benefits: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: number; // minutes
}

export interface HabitProgress {
  habit: Habit;
  completedToday: boolean;
  completedThisWeek: number;
  weeklyGoal: number;
  progressPercent: number;
}

// ============================================================================
// HABIT SUGGESTIONS
// ============================================================================

export const habitSuggestions: HabitSuggestion[] = [
  // Mindfulness
  {
    name: '5-Minute Meditation',
    description: 'Start your day with a short meditation session',
    category: 'mindfulness',
    benefits: ['Reduced stress', 'Better focus', 'Emotional balance'],
    difficulty: 'easy',
    timeRequired: 5
  },
  {
    name: 'Mindful Breathing',
    description: 'Take 10 deep breaths when you wake up',
    category: 'breathing',
    benefits: ['Calm start to day', 'Reduced anxiety', 'Better oxygen flow'],
    difficulty: 'easy',
    timeRequired: 2
  },
  {
    name: 'Body Scan',
    description: 'Do a quick body scan to check in with yourself',
    category: 'mindfulness',
    benefits: ['Body awareness', 'Tension release', 'Mind-body connection'],
    difficulty: 'medium',
    timeRequired: 10
  },
  
  // Exercise
  {
    name: 'Morning Stretch',
    description: 'Gentle stretching to wake up your body',
    category: 'exercise',
    benefits: ['Flexibility', 'Energy boost', 'Reduced stiffness'],
    difficulty: 'easy',
    timeRequired: 5
  },
  {
    name: 'Daily Walk',
    description: 'Take a 15-minute walk outside',
    category: 'exercise',
    benefits: ['Fresh air', 'Light exercise', 'Mental clarity'],
    difficulty: 'easy',
    timeRequired: 15
  },
  {
    name: 'Quick Workout',
    description: '20-minute exercise session',
    category: 'exercise',
    benefits: ['Physical fitness', 'Endorphin release', 'Better sleep'],
    difficulty: 'medium',
    timeRequired: 20
  },
  
  // Sleep
  {
    name: 'Screen-Free Hour',
    description: 'No screens 1 hour before bed',
    category: 'sleep',
    benefits: ['Better sleep quality', 'Easier falling asleep', 'Reduced eye strain'],
    difficulty: 'medium',
    timeRequired: 60
  },
  {
    name: 'Consistent Bedtime',
    description: 'Go to bed at the same time each night',
    category: 'sleep',
    benefits: ['Better sleep rhythm', 'More energy', 'Improved mood'],
    difficulty: 'medium',
    timeRequired: 0
  },
  {
    name: 'Wind-Down Routine',
    description: 'Create a relaxing pre-sleep routine',
    category: 'sleep',
    benefits: ['Easier transition to sleep', 'Reduced anxiety', 'Better rest'],
    difficulty: 'easy',
    timeRequired: 15
  },
  
  // Social
  {
    name: 'Reach Out',
    description: 'Message or call someone you care about',
    category: 'social',
    benefits: ['Connection', 'Support network', 'Reduced loneliness'],
    difficulty: 'easy',
    timeRequired: 5
  },
  {
    name: 'Quality Time',
    description: 'Spend meaningful time with someone',
    category: 'social',
    benefits: ['Deeper relationships', 'Emotional support', 'Joy'],
    difficulty: 'medium',
    timeRequired: 30
  },
  
  // Gratitude
  {
    name: 'Gratitude Journal',
    description: 'Write 3 things you\'re grateful for',
    category: 'gratitude',
    benefits: ['Positive mindset', 'Appreciation', 'Better mood'],
    difficulty: 'easy',
    timeRequired: 5
  },
  {
    name: 'Thank Someone',
    description: 'Express gratitude to someone in your life',
    category: 'gratitude',
    benefits: ['Stronger relationships', 'Positive feelings', 'Spreading kindness'],
    difficulty: 'easy',
    timeRequired: 2
  },
  
  // Journaling
  {
    name: 'Morning Pages',
    description: 'Write freely for 10 minutes each morning',
    category: 'journaling',
    benefits: ['Mental clarity', 'Emotional processing', 'Creativity'],
    difficulty: 'medium',
    timeRequired: 10
  },
  {
    name: 'Evening Reflection',
    description: 'Reflect on your day before bed',
    category: 'journaling',
    benefits: ['Self-awareness', 'Learning from experiences', 'Closure'],
    difficulty: 'easy',
    timeRequired: 5
  },
  
  // Self-care
  {
    name: 'Hydration Check',
    description: 'Drink 8 glasses of water',
    category: 'self_care',
    benefits: ['Better energy', 'Clearer thinking', 'Physical health'],
    difficulty: 'easy',
    timeRequired: 0
  },
  {
    name: 'Healthy Meal',
    description: 'Eat at least one nutritious meal',
    category: 'nutrition',
    benefits: ['Better energy', 'Physical health', 'Mood stability'],
    difficulty: 'easy',
    timeRequired: 30
  },
  {
    name: 'Self-Compassion Break',
    description: 'Take a moment to be kind to yourself',
    category: 'self_care',
    benefits: ['Self-acceptance', 'Reduced self-criticism', 'Emotional healing'],
    difficulty: 'easy',
    timeRequired: 3
  }
];

// ============================================================================
// CATEGORY INFO
// ============================================================================

export const categoryInfo: Record<HabitCategory, { name: string; icon: string; color: string; description: string }> = {
  mindfulness: {
    name: 'Mindfulness',
    icon: '🧘',
    color: 'bg-purple-100 text-purple-700',
    description: 'Practices that help you stay present and aware'
  },
  exercise: {
    name: 'Exercise',
    icon: '💪',
    color: 'bg-green-100 text-green-700',
    description: 'Physical activities for body and mind'
  },
  sleep: {
    name: 'Sleep',
    icon: '😴',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Habits for better rest and recovery'
  },
  social: {
    name: 'Social',
    icon: '👥',
    color: 'bg-pink-100 text-pink-700',
    description: 'Connecting with others'
  },
  nutrition: {
    name: 'Nutrition',
    icon: '🥗',
    color: 'bg-orange-100 text-orange-700',
    description: 'Healthy eating habits'
  },
  gratitude: {
    name: 'Gratitude',
    icon: '🙏',
    color: 'bg-amber-100 text-amber-700',
    description: 'Appreciating the good in life'
  },
  journaling: {
    name: 'Journaling',
    icon: '📝',
    color: 'bg-blue-100 text-blue-700',
    description: 'Writing for reflection and clarity'
  },
  breathing: {
    name: 'Breathing',
    icon: '🌬️',
    color: 'bg-teal-100 text-teal-700',
    description: 'Breath-focused exercises'
  },
  self_care: {
    name: 'Self-Care',
    icon: '💚',
    color: 'bg-sage-100 text-sage-700',
    description: 'Taking care of yourself'
  }
};

// ============================================================================
// ENCOURAGEMENT MESSAGES
// ============================================================================

export const encouragementMessages = {
  streakStart: [
    "Great start! You've begun building a new habit. 🌱",
    "Day 1 complete! Every journey starts with a single step. ✨",
    "You did it! The first day is often the hardest. 💪"
  ],
  streakContinue: [
    "You're on a roll! Keep it up! 🔥",
    "Another day, another win! You're doing amazing! ⭐",
    "Consistency is key, and you've got it! 💚",
    "Look at you go! Your dedication is inspiring! 🌟"
  ],
  streakMilestone: {
    7: ["One week strong! You're building something great! 🎉", "7 days! You're officially forming a habit! 🏆"],
    14: ["Two weeks! You're really committed! 💪", "14 days of dedication! Incredible! 🌟"],
    21: ["21 days! They say it takes this long to form a habit! 🎊", "Three weeks! You've made this a part of your life! 🏅"],
    30: ["A whole month! You're unstoppable! 🚀", "30 days! This is now part of who you are! 👑"],
    60: ["60 days! Your commitment is extraordinary! 🌈", "Two months strong! You're an inspiration! 💫"],
    90: ["90 days! You've truly transformed this into a lifestyle! 🎯", "Three months! This habit is now second nature! 🏆"],
    365: ["ONE YEAR! You're absolutely incredible! 🎆", "365 days! You've achieved something truly remarkable! 👑"]
  },
  missedDay: [
    "It's okay to miss a day. What matters is getting back on track. 💚",
    "One day doesn't define your journey. You've got this! 🌱",
    "Missing a day is human. Your streak may reset, but your progress doesn't. ✨",
    "Don't be hard on yourself. Tomorrow is a new opportunity. 🌅"
  ],
  comeback: [
    "Welcome back! It takes courage to start again. 💪",
    "You're here, and that's what matters. Let's go! 🌟",
    "Every day is a chance to begin again. You've got this! 🌈"
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createHabit(
  name: string,
  description: string,
  category: HabitCategory,
  frequency: HabitFrequency = 'daily',
  reminderTime?: string
): Habit {
  return {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    description,
    category,
    frequency,
    reminderTime,
    streak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    completions: [],
    createdAt: new Date(),
    isActive: true
  };
}

export function completeHabit(habit: Habit, note?: string, mood?: number): Habit {
  const completion: HabitCompletion = {
    id: `completion-${Date.now()}`,
    habitId: habit.id,
    completedAt: new Date(),
    note,
    mood
  };
  
  const updatedCompletions = [...habit.completions, completion];
  const newStreak = calculateStreak(updatedCompletions);
  
  return {
    ...habit,
    completions: updatedCompletions,
    streak: newStreak,
    longestStreak: Math.max(habit.longestStreak, newStreak),
    totalCompletions: habit.totalCompletions + 1
  };
}

export function calculateStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;
  
  const sorted = [...completions].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const completion of sorted) {
    const completionDate = new Date(completion.completedAt);
    completionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = completionDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function isCompletedToday(habit: Habit): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return habit.completions.some(c => {
    const completionDate = new Date(c.completedAt);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime();
  });
}

export function getCompletionsThisWeek(habit: Habit): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return habit.completions.filter(c => 
    new Date(c.completedAt) >= weekAgo
  ).length;
}

export function getHabitProgress(habit: Habit): HabitProgress {
  const completedToday = isCompletedToday(habit);
  const completedThisWeek = getCompletionsThisWeek(habit);
  const weeklyGoal = habit.frequency === 'daily' ? 7 : 
                     habit.frequency === 'weekly' ? 1 : 
                     (habit.targetDays?.length || 7);
  const progressPercent = Math.min(100, (completedThisWeek / weeklyGoal) * 100);
  
  return {
    habit,
    completedToday,
    completedThisWeek,
    weeklyGoal,
    progressPercent
  };
}

export function getEncouragementMessage(streak: number, previousStreak: number): string {
  // Streak milestone
  const milestones = [365, 90, 60, 30, 21, 14, 7];
  for (const milestone of milestones) {
    if (streak === milestone) {
      const messages = encouragementMessages.streakMilestone[milestone as keyof typeof encouragementMessages.streakMilestone];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
  
  // First day
  if (streak === 1 && previousStreak === 0) {
    return encouragementMessages.streakStart[Math.floor(Math.random() * encouragementMessages.streakStart.length)];
  }
  
  // Comeback
  if (streak === 1 && previousStreak > 1) {
    return encouragementMessages.comeback[Math.floor(Math.random() * encouragementMessages.comeback.length)];
  }
  
  // Continue streak
  return encouragementMessages.streakContinue[Math.floor(Math.random() * encouragementMessages.streakContinue.length)];
}

export function getMissedDayMessage(): string {
  return encouragementMessages.missedDay[Math.floor(Math.random() * encouragementMessages.missedDay.length)];
}

export function getSuggestedHabits(
  existingCategories: HabitCategory[],
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): HabitSuggestion[] {
  // Prioritize categories user doesn't have yet
  const suggestions = habitSuggestions.filter(s => 
    s.difficulty === difficulty || difficulty === 'easy'
  );
  
  // Sort to prioritize new categories
  return suggestions.sort((a, b) => {
    const aHas = existingCategories.includes(a.category) ? 1 : 0;
    const bHas = existingCategories.includes(b.category) ? 1 : 0;
    return aHas - bHas;
  }).slice(0, 6);
}
