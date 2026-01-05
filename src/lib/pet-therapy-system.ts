/**
 * Revolutionary Pet Therapy System
 * 
 * A unique virtual pet companion system that provides therapeutic support
 * through emotional intelligence, memory, evolution, and guided activities.
 */

// ============================================================================
// TYPES
// ============================================================================

export type PetType = 'dog' | 'cat';
export type PetMood = 'joyful' | 'calm' | 'concerned' | 'comforting' | 'playful' | 'sleepy' | 'attentive' | 'proud';
export type PetEvolutionStage = 'baby' | 'young' | 'adult' | 'wise';

export interface PetEmotionalState {
  happiness: number; // 0-100
  energy: number; // 0-100
  concern: number; // 0-100 (concern for user)
  affection: number; // 0-100
  currentMood: PetMood;
}

export interface PetMemory {
  id: string;
  type: 'emotional_pattern' | 'preference' | 'milestone' | 'breakthrough' | 'concern';
  content: string;
  emotionalContext: string;
  importance: number; // 1-10
  createdAt: Date;
}

export interface TherapeuticAbility {
  id: string;
  name: string;
  description: string;
  type: TherapeuticAbilityType;
  unlockedAtBond: number;
  duration: number; // minutes
  benefits: string[];
}

export type TherapeuticAbilityType = 
  | 'guided_breathing'
  | 'comfort_cuddle'
  | 'mindful_walk'
  | 'grounding_exercise'
  | 'celebration_dance'
  | 'sleep_companion'
  | 'cbt_guide'
  | 'gratitude_sharing'
  | 'anxiety_relief'
  | 'mood_boost';

export interface PetTherapyActivity {
  id: string;
  name: string;
  description: string;
  type: TherapeuticAbilityType;
  duration: number;
  steps: ActivityStep[];
  petAnimations: string[];
  bondReward: number;
  moodBoost: number;
}

export interface ActivityStep {
  instruction: string;
  duration: number; // seconds
  petAnimation: string;
  petMessage?: string;
}

export interface TherapeuticPet {
  id: string;
  name: string;
  type: PetType;
  personality: 'calm' | 'playful' | 'grounding' | 'motivating';
  emotionalState: PetEmotionalState;
  bondLevel: number; // 0-100
  evolutionStage: PetEvolutionStage;
  memories: PetMemory[];
  unlockedAbilities: string[];
  totalActivitiesCompleted: number;
  createdAt: Date;
}

// ============================================================================
// THERAPEUTIC ABILITIES
// ============================================================================

export const therapeuticAbilities: TherapeuticAbility[] = [
  {
    id: 'guided_breathing',
    name: 'Breathing Together',
    description: 'Your pet guides you through calming breathing exercises',
    type: 'guided_breathing',
    unlockedAtBond: 0,
    duration: 3,
    benefits: ['Reduce anxiety', 'Calm nervous system', 'Feel connected']
  },
  {
    id: 'comfort_cuddle',
    name: 'Comfort Session',
    description: 'A warm, comforting moment with your pet',
    type: 'comfort_cuddle',
    unlockedAtBond: 10,
    duration: 5,
    benefits: ['Feel supported', 'Reduce loneliness', 'Emotional comfort']
  },
  {
    id: 'mindful_walk',
    name: 'Mindful Walk',
    description: 'Take a virtual mindful walk with your companion',
    type: 'mindful_walk',
    unlockedAtBond: 20,
    duration: 5,
    benefits: ['Grounding', 'Present moment awareness', 'Gentle movement']
  },
  {
    id: 'grounding_exercise',
    name: 'Grounding Together',
    description: 'Your pet helps you feel grounded and present',
    type: 'grounding_exercise',
    unlockedAtBond: 15,
    duration: 4,
    benefits: ['Reduce dissociation', 'Feel present', 'Calm anxiety']
  },
  {
    id: 'celebration_dance',
    name: 'Victory Dance',
    description: 'Celebrate your wins with your pet!',
    type: 'celebration_dance',
    unlockedAtBond: 25,
    duration: 2,
    benefits: ['Boost mood', 'Acknowledge progress', 'Feel joy']
  },
  {
    id: 'sleep_companion',
    name: 'Sleep Time',
    description: 'Your pet helps you wind down for rest',
    type: 'sleep_companion',
    unlockedAtBond: 30,
    duration: 10,
    benefits: ['Better sleep', 'Relaxation', 'Peaceful transition']
  },
  {
    id: 'cbt_guide',
    name: 'Thought Helper',
    description: 'Your pet guides you through challenging thoughts',
    type: 'cbt_guide',
    unlockedAtBond: 40,
    duration: 8,
    benefits: ['Challenge negative thoughts', 'New perspectives', 'Cognitive flexibility']
  },
  {
    id: 'gratitude_sharing',
    name: 'Gratitude Moment',
    description: 'Share what you\'re grateful for with your pet',
    type: 'gratitude_sharing',
    unlockedAtBond: 5,
    duration: 3,
    benefits: ['Positive focus', 'Appreciation', 'Mood boost']
  },
  {
    id: 'anxiety_relief',
    name: 'Calm Down',
    description: 'Your pet helps soothe your anxiety',
    type: 'anxiety_relief',
    unlockedAtBond: 35,
    duration: 5,
    benefits: ['Reduce anxiety', 'Feel safe', 'Emotional regulation']
  },
  {
    id: 'mood_boost',
    name: 'Cheer Up',
    description: 'Let your pet brighten your day',
    type: 'mood_boost',
    unlockedAtBond: 20,
    duration: 3,
    benefits: ['Improve mood', 'Feel loved', 'Positive energy']
  }
];

// ============================================================================
// PET THERAPY ACTIVITIES
// ============================================================================

export const petTherapyActivities: PetTherapyActivity[] = [
  {
    id: 'breathing_together',
    name: 'Breathing Together',
    description: 'Follow your pet\'s breathing rhythm to calm down',
    type: 'guided_breathing',
    duration: 3,
    bondReward: 5,
    moodBoost: 15,
    petAnimations: ['breathe', 'calm', 'attentive'],
    steps: [
      { instruction: 'Watch your pet settle into a calm position', duration: 5, petAnimation: 'settle', petMessage: '*settles down peacefully*' },
      { instruction: 'Notice how your pet breathes slowly and deeply', duration: 5, petAnimation: 'breathe', petMessage: '*takes a slow, deep breath*' },
      { instruction: 'Breathe in with your pet... 1... 2... 3... 4...', duration: 4, petAnimation: 'breathe_in' },
      { instruction: 'Hold gently... 1... 2... 3... 4...', duration: 4, petAnimation: 'hold' },
      { instruction: 'Breathe out slowly... 1... 2... 3... 4... 5... 6...', duration: 6, petAnimation: 'breathe_out' },
      { instruction: 'Your pet looks at you with calm eyes. Repeat together.', duration: 3, petAnimation: 'calm_look', petMessage: '*looks at you peacefully*' },
      { instruction: 'Continue breathing together for a few more cycles', duration: 30, petAnimation: 'breathe' },
      { instruction: 'Your pet seems relaxed and happy you did this together', duration: 5, petAnimation: 'happy', petMessage: '*wags tail/purrs contentedly*' }
    ]
  },
  {
    id: 'comfort_session',
    name: 'Comfort Session',
    description: 'Receive comfort and support from your pet',
    type: 'comfort_cuddle',
    duration: 5,
    bondReward: 8,
    moodBoost: 20,
    petAnimations: ['comfort', 'nuzzle', 'stay_close'],
    steps: [
      { instruction: 'Your pet senses you need comfort and comes closer', duration: 5, petAnimation: 'approach', petMessage: '*moves closer to you*' },
      { instruction: 'Feel your pet\'s warm presence beside you', duration: 10, petAnimation: 'stay_close', petMessage: '*stays close, offering warmth*' },
      { instruction: 'Your pet gently nuzzles against you', duration: 8, petAnimation: 'nuzzle', petMessage: '*nuzzles you gently*' },
      { instruction: 'Take a moment to feel supported. You\'re not alone.', duration: 15, petAnimation: 'comfort' },
      { instruction: 'Your pet looks at you with understanding', duration: 5, petAnimation: 'understanding_look', petMessage: '*looks at you with soft, caring eyes*' },
      { instruction: 'It\'s okay to feel what you\'re feeling', duration: 10, petAnimation: 'stay_close', petMessage: '*stays by your side*' },
      { instruction: 'Your pet is here for you, no matter what', duration: 10, petAnimation: 'loyal', petMessage: '*I\'m here for you*' }
    ]
  },
  {
    id: 'mindful_walk',
    name: 'Mindful Walk',
    description: 'Take a mindful virtual walk with your companion',
    type: 'mindful_walk',
    duration: 5,
    bondReward: 10,
    moodBoost: 18,
    petAnimations: ['walk', 'explore', 'happy'],
    steps: [
      { instruction: 'Your pet is excited to go for a walk with you!', duration: 5, petAnimation: 'excited', petMessage: '*bounces excitedly*' },
      { instruction: 'As you walk, notice 5 things you can see', duration: 20, petAnimation: 'walk', petMessage: '*walks beside you, looking around*' },
      { instruction: 'Your pet stops to sniff something interesting', duration: 10, petAnimation: 'sniff', petMessage: '*sniffs curiously*' },
      { instruction: 'Notice 4 things you can hear', duration: 15, petAnimation: 'listen', petMessage: '*ears perk up, listening*' },
      { instruction: 'Feel your feet on the ground as you walk', duration: 15, petAnimation: 'walk' },
      { instruction: 'Your pet looks back at you happily', duration: 5, petAnimation: 'happy_look', petMessage: '*looks back with joy*' },
      { instruction: 'Notice 3 things you can feel (temperature, breeze, etc.)', duration: 15, petAnimation: 'walk' },
      { instruction: 'Your pet finds a nice spot to rest', duration: 10, petAnimation: 'rest', petMessage: '*finds a peaceful spot*' }
    ]
  },
  {
    id: 'grounding_together',
    name: 'Grounding Together',
    description: 'Your pet helps you feel grounded and present',
    type: 'grounding_exercise',
    duration: 4,
    bondReward: 7,
    moodBoost: 15,
    petAnimations: ['grounded', 'present', 'calm'],
    steps: [
      { instruction: 'Your pet sits calmly, fully present', duration: 5, petAnimation: 'sit_calm', petMessage: '*sits peacefully, fully present*' },
      { instruction: 'Feel your feet on the ground, like your pet\'s paws', duration: 10, petAnimation: 'grounded' },
      { instruction: 'Name 5 things you can see around you', duration: 20, petAnimation: 'look_around' },
      { instruction: 'Name 4 things you can touch', duration: 15, petAnimation: 'attentive' },
      { instruction: 'Name 3 things you can hear', duration: 15, petAnimation: 'listen' },
      { instruction: 'Name 2 things you can smell', duration: 10, petAnimation: 'sniff' },
      { instruction: 'Name 1 thing you can taste', duration: 10, petAnimation: 'calm' },
      { instruction: 'Your pet looks at you proudly', duration: 5, petAnimation: 'proud', petMessage: '*looks at you with pride*' }
    ]
  },
  {
    id: 'celebration',
    name: 'Victory Celebration',
    description: 'Celebrate your achievements with your pet!',
    type: 'celebration_dance',
    duration: 2,
    bondReward: 5,
    moodBoost: 25,
    petAnimations: ['celebrate', 'dance', 'jump'],
    steps: [
      { instruction: 'Your pet senses something good happened!', duration: 3, petAnimation: 'alert', petMessage: '*perks up excitedly*' },
      { instruction: 'Time to celebrate! Your pet starts dancing!', duration: 10, petAnimation: 'dance', petMessage: '*does a happy dance*' },
      { instruction: 'Jump for joy with your pet!', duration: 8, petAnimation: 'jump', petMessage: '*jumps with excitement*' },
      { instruction: 'Your pet is so proud of you!', duration: 5, petAnimation: 'proud', petMessage: '*beams with pride*' },
      { instruction: 'Take a moment to feel good about your achievement', duration: 10, petAnimation: 'happy' },
      { instruction: 'Your pet gives you a celebratory nuzzle', duration: 5, petAnimation: 'nuzzle', petMessage: '*nuzzles you happily*' }
    ]
  },
  {
    id: 'gratitude_moment',
    name: 'Gratitude Sharing',
    description: 'Share what you\'re grateful for with your pet',
    type: 'gratitude_sharing',
    duration: 3,
    bondReward: 5,
    moodBoost: 12,
    petAnimations: ['listen', 'happy', 'content'],
    steps: [
      { instruction: 'Your pet settles in to listen to you', duration: 5, petAnimation: 'settle', petMessage: '*settles down to listen*' },
      { instruction: 'Think of one thing you\'re grateful for today', duration: 15, petAnimation: 'attentive' },
      { instruction: 'Share it with your pet (out loud or in your mind)', duration: 10, petAnimation: 'listen', petMessage: '*listens intently*' },
      { instruction: 'Your pet seems to understand and appreciate it', duration: 5, petAnimation: 'nod', petMessage: '*nods understandingly*' },
      { instruction: 'Think of another thing you\'re grateful for', duration: 15, petAnimation: 'attentive' },
      { instruction: 'Your pet wags/purrs, happy to share this moment', duration: 5, petAnimation: 'happy', petMessage: '*happy to share this with you*' }
    ]
  }
];

// ============================================================================
// PET EMOTIONAL INTELLIGENCE
// ============================================================================

export function calculatePetMood(
  userEmotionalState: { valence: number; arousal: number; primary: string },
  petState: PetEmotionalState,
  bondLevel: number
): PetMood {
  const { valence, arousal, primary } = userEmotionalState;
  
  // High bond = more responsive to user emotions
  const responsiveness = 0.5 + (bondLevel / 200); // 0.5 to 1.0
  
  // If user is distressed, pet becomes concerned/comforting
  if (valence < -0.3 || ['sadness', 'anxiety', 'fear', 'loneliness'].includes(primary)) {
    return arousal > 0.5 ? 'concerned' : 'comforting';
  }
  
  // If user is happy, pet mirrors happiness
  if (valence > 0.3 || primary === 'happiness') {
    return arousal > 0.5 ? 'joyful' : 'playful';
  }
  
  // If user is calm/neutral
  if (arousal < 0.3) {
    return petState.energy < 30 ? 'sleepy' : 'calm';
  }
  
  // Default attentive state
  return 'attentive';
}

export function updatePetEmotionalState(
  currentState: PetEmotionalState,
  userInteraction: 'positive' | 'negative' | 'neutral',
  activityCompleted?: boolean
): PetEmotionalState {
  let { happiness, energy, concern, affection, currentMood } = currentState;
  
  // Update based on interaction
  if (userInteraction === 'positive') {
    happiness = Math.min(100, happiness + 5);
    affection = Math.min(100, affection + 3);
    concern = Math.max(0, concern - 5);
  } else if (userInteraction === 'negative') {
    concern = Math.min(100, concern + 10);
    happiness = Math.max(0, happiness - 3);
  }
  
  // Activity completion boosts everything
  if (activityCompleted) {
    happiness = Math.min(100, happiness + 10);
    affection = Math.min(100, affection + 5);
    energy = Math.max(0, energy - 5); // Activities use energy
  }
  
  // Natural energy decay
  energy = Math.max(0, energy - 1);
  
  // Update mood based on state
  if (happiness > 80) currentMood = 'joyful';
  else if (concern > 60) currentMood = 'concerned';
  else if (energy < 20) currentMood = 'sleepy';
  else if (happiness > 50) currentMood = 'playful';
  else currentMood = 'calm';
  
  return { happiness, energy, concern, affection, currentMood };
}

// ============================================================================
// PET MEMORY SYSTEM
// ============================================================================

export function createPetMemory(
  type: PetMemory['type'],
  content: string,
  emotionalContext: string,
  importance: number = 5
): PetMemory {
  return {
    id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    content,
    emotionalContext,
    importance,
    createdAt: new Date()
  };
}

export function shouldCreateMemory(
  userMessage: string,
  emotionalState: { primary: string; intensity: string }
): { should: boolean; type: PetMemory['type']; importance: number } {
  // High intensity emotions create memories
  if (emotionalState.intensity === 'high') {
    if (['happiness', 'hope'].includes(emotionalState.primary)) {
      return { should: true, type: 'breakthrough', importance: 8 };
    }
    if (['sadness', 'anxiety', 'fear'].includes(emotionalState.primary)) {
      return { should: true, type: 'concern', importance: 7 };
    }
  }
  
  // Milestone keywords
  if (/first time|finally|achieved|accomplished|proud|breakthrough/i.test(userMessage)) {
    return { should: true, type: 'milestone', importance: 9 };
  }
  
  // Preference keywords
  if (/i like|i love|i prefer|my favorite|helps me/i.test(userMessage)) {
    return { should: true, type: 'preference', importance: 6 };
  }
  
  return { should: false, type: 'emotional_pattern', importance: 5 };
}

// ============================================================================
// PET EVOLUTION
// ============================================================================

export function calculateEvolutionStage(bondLevel: number, totalActivities: number): PetEvolutionStage {
  const score = bondLevel + (totalActivities * 2);
  
  if (score >= 150) return 'wise';
  if (score >= 80) return 'adult';
  if (score >= 30) return 'young';
  return 'baby';
}

export function getEvolutionBenefits(stage: PetEvolutionStage): string[] {
  switch (stage) {
    case 'baby':
      return ['Basic comfort', 'Simple breathing exercises'];
    case 'young':
      return ['All baby abilities', 'Grounding exercises', 'Mood sensing'];
    case 'adult':
      return ['All young abilities', 'CBT guidance', 'Deep emotional support'];
    case 'wise':
      return ['All adult abilities', 'Advanced therapy techniques', 'Personalized insights'];
  }
}

// ============================================================================
// PET MESSAGES
// ============================================================================

export const petMessages: Record<PetMood, string[]> = {
  joyful: [
    "*bounces excitedly* I'm so happy to see you! 🎉",
    "*tail wagging intensely* Today feels like a great day!",
    "*does a little dance* You make me so happy!",
    "*jumps with joy* Let's do something fun together!"
  ],
  calm: [
    "*peaceful sigh* It's nice just being here with you.",
    "*settles comfortably* I'm here whenever you need me.",
    "*gentle tail wag* Everything feels okay right now.",
    "*content purr/sigh* This is nice."
  ],
  concerned: [
    "*moves closer* I sense something's bothering you...",
    "*soft whimper* Are you okay? I'm here for you.",
    "*worried eyes* I wish I could help more...",
    "*stays close* Whatever it is, we'll get through it together."
  ],
  comforting: [
    "*nuzzles gently* I'm right here with you. 💚",
    "*warm presence* You're not alone in this.",
    "*soft comfort* It's okay to feel this way.",
    "*stays by your side* I'll stay as long as you need."
  ],
  playful: [
    "*playful bounce* Want to do something fun?",
    "*brings toy* Let's play! It might help!",
    "*excited wiggle* I have so much energy!",
    "*playful bow* Come on, let's have some fun!"
  ],
  sleepy: [
    "*yawns* I'm a bit tired... want to rest together?",
    "*stretches* Maybe we both need some rest.",
    "*curls up* It's okay to take it easy sometimes.",
    "*drowsy blink* Rest is important too..."
  ],
  attentive: [
    "*ears perked* I'm listening...",
    "*focused gaze* Tell me what's on your mind.",
    "*attentive posture* I'm here to listen.",
    "*patient waiting* Take your time, I'm not going anywhere."
  ],
  proud: [
    "*chest puffed* I'm so proud of you!",
    "*happy dance* You did amazing!",
    "*beaming* Look at you go!",
    "*celebratory spin* That's my human!"
  ]
};

export function getPetMessage(mood: PetMood, petName: string): string {
  const messages = petMessages[mood];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return message;
}

// ============================================================================
// UNLOCKED ABILITIES
// ============================================================================

export function getUnlockedAbilities(bondLevel: number): TherapeuticAbility[] {
  return therapeuticAbilities.filter(ability => ability.unlockedAtBond <= bondLevel);
}

export function getNextAbilityToUnlock(bondLevel: number): TherapeuticAbility | null {
  const locked = therapeuticAbilities
    .filter(ability => ability.unlockedAtBond > bondLevel)
    .sort((a, b) => a.unlockedAtBond - b.unlockedAtBond);
  
  return locked[0] || null;
}
