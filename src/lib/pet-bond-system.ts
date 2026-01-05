/**
 * Pet Bond Building System
 * Manages pet-user relationships, interactions, and bond progression
 */

import { createClient } from "@/lib/supabase/client";

export type InteractionType = 
  | 'pet' 
  | 'play' 
  | 'feed' 
  | 'talk' 
  | 'cuddle' 
  | 'exercise' 
  | 'train' 
  | 'celebrate' 
  | 'comfort' 
  | 'sleep';

export interface PetInteraction {
  id: string;
  userId: string;
  petId: string;
  type: InteractionType;
  bondGain: number;
  happinessGain: number;
  energyChange: number;
  affectionGain: number;
  timestamp: Date;
  message: string;
}

export interface BondMilestone {
  level: number;
  name: string;
  description: string;
  unlockedFeatures: string[];
  specialMessage: string;
}

export interface PetBondStats {
  totalInteractions: number;
  totalBondGained: number;
  currentBond: number;
  lastInteractionTime: Date | null;
  favoriteInteraction: InteractionType | null;
  streakDays: number;
}

// Bond milestones
export const bondMilestones: BondMilestone[] = [
  {
    level: 0,
    name: 'New Friend',
    description: 'You just met your pet!',
    unlockedFeatures: ['pet', 'play'],
    specialMessage: 'Welcome to your new friendship! 🐾'
  },
  {
    level: 10,
    name: 'Acquaintance',
    description: 'Your pet is starting to trust you',
    unlockedFeatures: ['feed', 'talk'],
    specialMessage: 'Your pet is warming up to you! 💚'
  },
  {
    level: 25,
    name: 'Friend',
    description: 'A real friendship is forming',
    unlockedFeatures: ['cuddle', 'exercise'],
    specialMessage: 'You\'re becoming real friends! 🌟'
  },
  {
    level: 40,
    name: 'Best Friend',
    description: 'Your pet adores you',
    unlockedFeatures: ['train', 'celebrate'],
    specialMessage: 'Your pet absolutely adores you! 💕'
  },
  {
    level: 60,
    name: 'Soulmate',
    description: 'An unbreakable bond',
    unlockedFeatures: ['comfort', 'sleep'],
    specialMessage: 'You\'re soulmates! 👑'
  },
  {
    level: 80,
    name: 'Eternal Companion',
    description: 'The deepest bond possible',
    unlockedFeatures: ['special_abilities'],
    specialMessage: 'Your bond is eternal! ✨'
  },
  {
    level: 100,
    name: 'Perfect Bond',
    description: 'The ultimate connection',
    unlockedFeatures: ['all_abilities'],
    specialMessage: 'Perfect bond achieved! 🏆'
  }
];

// Interaction rewards
export const interactionRewards: Record<InteractionType, { bondGain: number; happinessGain: number; energyChange: number; affectionGain: number; messages: string[] }> = {
  'pet': {
    bondGain: 2,
    happinessGain: 5,
    energyChange: 0,
    affectionGain: 3,
    messages: [
      'Your pet purrs with joy!',
      'Your pet wags its tail happily!',
      'Your pet nuzzles your hand!',
      'Your pet leans into your touch!',
    ]
  },
  'play': {
    bondGain: 5,
    happinessGain: 15,
    energyChange: -10,
    affectionGain: 5,
    messages: [
      'Your pet bounces around excitedly!',
      'Your pet plays with pure joy!',
      'Your pet chases around playfully!',
      'Your pet does a happy dance!',
    ]
  },
  'feed': {
    bondGain: 3,
    happinessGain: 8,
    energyChange: 10,
    affectionGain: 2,
    messages: [
      'Your pet eats happily!',
      'Your pet munches contentedly!',
      'Your pet purrs while eating!',
      'Your pet looks grateful!',
    ]
  },
  'talk': {
    bondGain: 2,
    happinessGain: 3,
    energyChange: 0,
    affectionGain: 4,
    messages: [
      'Your pet listens intently!',
      'Your pet tilts its head thoughtfully!',
      'Your pet seems to understand!',
      'Your pet looks at you with understanding!',
    ]
  },
  'cuddle': {
    bondGain: 4,
    happinessGain: 10,
    energyChange: 5,
    affectionGain: 8,
    messages: [
      'Your pet snuggles close!',
      'Your pet purrs contentedly!',
      'Your pet rests its head on you!',
      'Your pet feels so warm and safe!',
    ]
  },
  'exercise': {
    bondGain: 4,
    happinessGain: 12,
    energyChange: -15,
    affectionGain: 3,
    messages: [
      'Your pet runs around energetically!',
      'Your pet stretches and feels great!',
      'Your pet is full of energy!',
      'Your pet feels stronger!',
    ]
  },
  'train': {
    bondGain: 6,
    happinessGain: 8,
    energyChange: -5,
    affectionGain: 4,
    messages: [
      'Your pet learns something new!',
      'Your pet is so proud!',
      'Your pet masters a new skill!',
      'Your pet looks accomplished!',
    ]
  },
  'celebrate': {
    bondGain: 5,
    happinessGain: 20,
    energyChange: 0,
    affectionGain: 6,
    messages: [
      'Your pet celebrates with you!',
      'Your pet does a victory dance!',
      'Your pet is so happy for you!',
      'Your pet jumps with joy!',
    ]
  },
  'comfort': {
    bondGain: 4,
    happinessGain: 5,
    energyChange: 0,
    affectionGain: 7,
    messages: [
      'Your pet stays close to comfort you!',
      'Your pet gently nuzzles you!',
      'Your pet seems to understand your pain!',
      'Your pet offers silent support!',
    ]
  },
  'sleep': {
    bondGain: 3,
    happinessGain: 2,
    energyChange: 20,
    affectionGain: 5,
    messages: [
      'Your pet curls up beside you!',
      'Your pet purrs you to sleep!',
      'Your pet keeps you company through the night!',
      'Your pet dreams peacefully beside you!',
    ]
  }
};

/**
 * Record a pet interaction
 */
export async function recordPetInteraction(
  userId: string,
  petId: string,
  interactionType: InteractionType
): Promise<PetInteraction> {
  const rewards = interactionRewards[interactionType];
  const messages = rewards.messages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  const interaction: PetInteraction = {
    id: `interaction-${Date.now()}`,
    userId,
    petId,
    type: interactionType,
    bondGain: rewards.bondGain,
    happinessGain: rewards.happinessGain,
    energyChange: rewards.energyChange,
    affectionGain: rewards.affectionGain,
    timestamp: new Date(),
    message,
  };

  // Save to Supabase if available
  try {
    const supabase = createClient();
    await supabase.from('pet_interactions').insert({
      user_id: userId,
      pet_id: petId,
      interaction_type: interactionType,
      bond_gain: rewards.bondGain,
      happiness_gain: rewards.happinessGain,
      energy_change: rewards.energyChange,
      affection_gain: rewards.affectionGain,
      message,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not save interaction to Supabase:', error);
  }

  return interaction;
}

/**
 * Get bond milestone for current bond level
 */
export function getBondMilestone(bondLevel: number): BondMilestone {
  let milestone = bondMilestones[0];
  for (const m of bondMilestones) {
    if (bondLevel >= m.level) {
      milestone = m;
    } else {
      break;
    }
  }
  return milestone;
}

/**
 * Get next bond milestone
 */
export function getNextBondMilestone(bondLevel: number): BondMilestone | null {
  for (const m of bondMilestones) {
    if (bondLevel < m.level) {
      return m;
    }
  }
  return null;
}

/**
 * Calculate bond progress to next milestone
 */
export function getBondProgress(bondLevel: number): { current: number; next: number; progress: number } {
  const current = getBondMilestone(bondLevel);
  const next = getNextBondMilestone(bondLevel);

  if (!next) {
    return { current: current.level, next: 100, progress: 100 };
  }

  const range = next.level - current.level;
  const progress = bondLevel - current.level;
  const percentage = Math.round((progress / range) * 100);

  return { current: current.level, next: next.level, progress: percentage };
}

/**
 * Get interaction streak
 */
export async function getInteractionStreak(userId: string, petId: string): Promise<number> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pet_interactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const interaction of data) {
      const interactionDate = new Date(interaction.created_at);
      interactionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.warn('Could not fetch interaction streak:', error);
    return 0;
  }
}

/**
 * Get favorite interaction type
 */
export async function getFavoriteInteraction(userId: string, petId: string): Promise<InteractionType | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pet_interactions')
      .select('interaction_type')
      .eq('user_id', userId)
      .eq('pet_id', petId);

    if (error) throw error;

    if (!data || data.length === 0) return null;

    const counts: Record<string, number> = {};
    for (const interaction of data) {
      counts[interaction.interaction_type] = (counts[interaction.interaction_type] || 0) + 1;
    }

    let favorite: InteractionType | null = null;
    let maxCount = 0;

    for (const [type, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        favorite = type as InteractionType;
      }
    }

    return favorite;
  } catch (error) {
    console.warn('Could not fetch favorite interaction:', error);
    return null;
  }
}

/**
 * Get bond stats
 */
export async function getPetBondStats(userId: string, petId: string): Promise<PetBondStats> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pet_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const totalInteractions = data?.length || 0;
    const totalBondGained = data?.reduce((sum, i) => sum + i.bond_gain, 0) || 0;
    const lastInteraction = data?.[0]?.created_at ? new Date(data[0].created_at) : null;
    const favorite = await getFavoriteInteraction(userId, petId);
    const streak = await getInteractionStreak(userId, petId);

    return {
      totalInteractions,
      totalBondGained,
      currentBond: Math.min(totalBondGained, 100),
      lastInteractionTime: lastInteraction,
      favoriteInteraction: favorite,
      streakDays: streak,
    };
  } catch (error) {
    console.warn('Could not fetch bond stats:', error);
    return {
      totalInteractions: 0,
      totalBondGained: 0,
      currentBond: 0,
      lastInteractionTime: null,
      favoriteInteraction: null,
      streakDays: 0,
    };
  }
}
