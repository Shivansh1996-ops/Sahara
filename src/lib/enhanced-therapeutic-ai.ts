/**
 * Enhanced Therapeutic AI Engine
 * 
 * Provides advanced therapeutic conversation capabilities with multiple
 * evidence-based techniques and pet integration.
 */

// ============================================================================
// TYPES
// ============================================================================

export type TherapeuticTechnique = 
  | 'validation'
  | 'reflection'
  | 'reframing'
  | 'grounding'
  | 'exploration'
  | 'encouragement'
  | 'normalization'
  | 'psychoeducation';

export interface EmotionalState {
  primary: string;
  secondary: string[];
  intensity: 'low' | 'medium' | 'high';
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
}

export interface ConversationContext {
  messageCount: number;
  themes: string[];
  emotionalJourney: EmotionalState[];
  techniquesUsed: TherapeuticTechnique[];
  breakthroughs: string[];
  concerns: string[];
}

export interface TherapeuticResponse {
  content: string;
  technique: TherapeuticTechnique;
  petReaction?: PetReaction;
  followUpSuggestion?: string;
  emotionalState: EmotionalState;
}

export interface PetReaction {
  animation: string;
  message?: string;
  action?: 'comfort' | 'celebrate' | 'breathe' | 'listen' | 'play';
}

// ============================================================================
// EMOTION DETECTION
// ============================================================================

const emotionPatterns: Record<string, string[]> = {
  sadness: [
    'sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'empty',
    'crying', 'tears', 'heartbroken', 'grief', 'mourning', 'loss', 'lonely',
    'worthless', 'numb', 'despair', 'melancholy', 'blue', 'gloomy', 'hurt'
  ],
  anxiety: [
    'anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared',
    'overwhelmed', 'restless', 'tense', 'uneasy', 'dread', 'apprehensive',
    'racing thoughts', "can't sleep", 'insomnia', 'overthinking', 'paranoid'
  ],
  anger: [
    'angry', 'frustrated', 'annoyed', 'irritated', 'furious', 'mad', 'rage',
    'resentful', 'bitter', 'hostile', 'hate', 'disgusted', 'fed up'
  ],
  happiness: [
    'happy', 'joyful', 'excited', 'grateful', 'thankful', 'blessed', 'content',
    'peaceful', 'calm', 'relaxed', 'hopeful', 'optimistic', 'proud', 'loved',
    'amazing', 'wonderful', 'great', 'good', 'better', 'improving'
  ],
  confusion: [
    'confused', 'lost', 'uncertain', 'unsure', "don't know", 'unclear',
    'mixed feelings', 'conflicted', 'torn', 'indecisive', 'puzzled'
  ],
  exhaustion: [
    'tired', 'exhausted', 'drained', 'burnt out', 'fatigued', 'worn out',
    'no energy', "can't cope", 'overwhelmed', 'too much', 'breaking point'
  ],
  loneliness: [
    'lonely', 'alone', 'isolated', 'no one', 'nobody', 'abandoned', 'rejected',
    'left out', 'disconnected', 'misunderstood', 'invisible'
  ],
  guilt: [
    'guilty', 'ashamed', 'regret', 'sorry', 'my fault', 'blame myself',
    'should have', "shouldn't have", 'disappointed in myself'
  ],
  fear: [
    'afraid', 'scared', 'terrified', 'frightened', 'worried about',
    'dreading', 'anxious about', 'nervous about', 'fear of'
  ]
};

const themePatterns: Record<string, string[]> = {
  relationships: ['friend', 'family', 'partner', 'boyfriend', 'girlfriend', 'spouse', 'parent', 'mother', 'father', 'sibling', 'colleague', 'boss', 'relationship'],
  work: ['work', 'job', 'career', 'boss', 'colleague', 'deadline', 'project', 'meeting', 'office', 'workplace', 'professional'],
  health: ['health', 'sick', 'illness', 'pain', 'doctor', 'hospital', 'medication', 'therapy', 'treatment', 'diagnosis'],
  selfWorth: ['worthless', 'useless', 'failure', 'not good enough', 'inadequate', 'incompetent', 'stupid', 'ugly', 'hate myself'],
  future: ['future', 'tomorrow', 'next week', 'next month', 'next year', 'plans', 'goals', 'dreams', 'aspirations', 'what if'],
  past: ['past', 'yesterday', 'last week', 'used to', 'remember', 'memories', 'regret', 'wish I had', 'back then'],
  change: ['change', 'different', 'new', 'transition', 'moving', 'starting', 'ending', 'leaving', 'beginning'],
  identity: ['who am I', 'identity', 'purpose', 'meaning', 'direction', 'lost', "don't know myself", 'confused about', 'questioning']
};

export function analyzeEmotionalState(message: string, history: string[] = []): EmotionalState {
  const lowerMessage = message.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Score each emotion
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    scores[emotion] = 0;
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        scores[emotion] += 1;
      }
    }
  }
  
  // Find primary and secondary emotions
  const sortedEmotions = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  
  const primary = sortedEmotions[0]?.[0] || 'neutral';
  const secondary = sortedEmotions.slice(1, 3).map(([e]) => e);
  
  // Calculate intensity
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const intensity: 'low' | 'medium' | 'high' = 
    totalScore > 4 ? 'high' : totalScore > 2 ? 'medium' : 'low';
  
  // Calculate valence (-1 to 1)
  const positiveScore = scores.happiness || 0;
  const negativeScore = (scores.sadness || 0) + (scores.anxiety || 0) + 
                       (scores.anger || 0) + (scores.fear || 0) + (scores.guilt || 0);
  const valence = (positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1);
  
  // Calculate arousal (0 to 1)
  const highArousalEmotions = (scores.anxiety || 0) + (scores.anger || 0) + (scores.fear || 0);
  const lowArousalEmotions = (scores.sadness || 0) + (scores.exhaustion || 0);
  const arousal = highArousalEmotions > lowArousalEmotions ? 0.7 : 0.3;
  
  return { primary, secondary, intensity, valence, arousal };
}

export function detectThemes(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const themes: string[] = [];
  
  for (const [theme, patterns] of Object.entries(themePatterns)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern) && !themes.includes(theme)) {
        themes.push(theme);
        break;
      }
    }
  }
  
  return themes;
}

// ============================================================================
// TECHNIQUE SELECTION
// ============================================================================

export function selectTechnique(
  emotionalState: EmotionalState,
  context: ConversationContext
): TherapeuticTechnique {
  const { primary, intensity, valence } = emotionalState;
  const recentTechniques = context.techniquesUsed.slice(-3);
  
  // Crisis situations need grounding
  if (intensity === 'high' && valence < -0.5) {
    return 'grounding';
  }
  
  // High anxiety needs grounding or normalization
  if (primary === 'anxiety' && intensity !== 'low') {
    return recentTechniques.includes('grounding') ? 'normalization' : 'grounding';
  }
  
  // Sadness needs validation first
  if (primary === 'sadness' || primary === 'loneliness') {
    return recentTechniques.includes('validation') ? 'exploration' : 'validation';
  }
  
  // Confusion needs exploration
  if (primary === 'confusion') {
    return 'exploration';
  }
  
  // Guilt might benefit from reframing
  if (primary === 'guilt') {
    return recentTechniques.includes('validation') ? 'reframing' : 'validation';
  }
  
  // Positive emotions get encouragement
  if (valence > 0.3) {
    return 'encouragement';
  }
  
  // Default to reflection for processing
  return 'reflection';
}

// ============================================================================
// RESPONSE GENERATION
// ============================================================================

const techniqueResponses: Record<TherapeuticTechnique, string[]> = {
  validation: [
    "What you're feeling is completely valid. It takes courage to share that.",
    "I hear you, and your feelings make sense given what you're going through.",
    "Thank you for trusting me with this. Your emotions are real and important.",
    "It's okay to feel this way. You don't have to have it all figured out.",
    "I can understand why you'd feel that way. You're not alone in this.",
    "Your feelings matter. It's okay to not be okay sometimes.",
    "That sounds really difficult. Your reaction makes complete sense."
  ],
  reflection: [
    "It sounds like you've been carrying a lot. How does it feel to share this?",
    "What do you think this experience is teaching you about yourself?",
    "If you could give yourself advice right now, what would you say?",
    "How would you like to feel about this situation?",
    "What would taking care of yourself look like today?",
    "I'm hearing that this has been weighing on you. What feels most important right now?",
    "When you think about this, what comes up for you?"
  ],
  reframing: [
    "I wonder if there's another way to look at this situation?",
    "What would you tell a friend who was going through the same thing?",
    "Is there any part of this that might be an opportunity for growth?",
    "Sometimes our thoughts can be harder on us than the situation itself. What do you think?",
    "What's one small positive thing that could come from this?",
    "Could there be another explanation for what happened?"
  ],
  grounding: [
    "Let's take a moment together. Can you feel your feet on the ground?",
    "Take a slow, deep breath with me. You're safe in this moment.",
    "Right now, in this moment, you're okay. Let's focus on the present.",
    "What's one thing you can see, hear, or feel right now?",
    "Sometimes our minds race ahead. Let's gently bring focus back to now.",
    "Let's try something together - breathe in for 4 counts, hold for 4, out for 4.",
    "You're here, you're safe. Let's take this one moment at a time."
  ],
  exploration: [
    "I'd love to understand more. What do you think might be behind these feelings?",
    "That's interesting. Can you tell me more about what's been on your mind?",
    "I'm curious - when did you first start noticing this?",
    "What would help you feel more clarity about this situation?",
    "Let's explore this together. What feels most important to you right now?",
    "What do you think triggered these feelings?",
    "Is there more to this that you'd like to share?"
  ],
  encouragement: [
    "I'm so proud of you for recognizing that. That's real growth.",
    "You're doing better than you think. Every small step counts.",
    "Your resilience is inspiring. You've handled so much already.",
    "I believe in you. You have the strength to get through this.",
    "Look how far you've come. That takes real courage.",
    "You should be proud of yourself for working through this.",
    "That's a wonderful insight. You're making real progress."
  ],
  normalization: [
    "What you're experiencing is actually very common. Many people feel this way.",
    "It's completely normal to feel this way in your situation.",
    "You're not alone in feeling this. It's a very human response.",
    "This is a natural reaction to what you're going through.",
    "Many people struggle with similar feelings. You're not broken.",
    "It makes sense that you'd feel this way. It's a normal response."
  ],
  psychoeducation: [
    "Did you know that anxiety is actually your body's way of trying to protect you?",
    "Our thoughts and feelings are connected. When we change one, the other often follows.",
    "Emotions are like waves - they rise, peak, and eventually pass.",
    "Self-compassion has been shown to be more effective than self-criticism for growth.",
    "Taking small steps is actually more sustainable than big changes.",
    "Rest is not laziness - it's essential for mental wellness."
  ]
};

const petReactions: Record<TherapeuticTechnique, PetReaction[]> = {
  validation: [
    { animation: 'comfort', message: "Your companion moves closer, offering silent support.", action: 'comfort' },
    { animation: 'attentive', message: "Your pet looks at you with understanding eyes.", action: 'listen' }
  ],
  reflection: [
    { animation: 'thinking', message: "Your companion tilts their head thoughtfully.", action: 'listen' },
    { animation: 'attentive', message: "Your pet watches you with gentle attention.", action: 'listen' }
  ],
  reframing: [
    { animation: 'curious', message: "Your pet perks up, as if seeing something new.", action: 'listen' },
    { animation: 'playful', message: "Your companion seems to offer a fresh perspective.", action: 'play' }
  ],
  grounding: [
    { animation: 'breathe', message: "Your pet takes a slow, calming breath with you.", action: 'breathe' },
    { animation: 'calm', message: "Your companion's peaceful presence helps you feel grounded.", action: 'comfort' }
  ],
  exploration: [
    { animation: 'curious', message: "Your pet seems curious to understand more.", action: 'listen' },
    { animation: 'attentive', message: "Your companion listens intently.", action: 'listen' }
  ],
  encouragement: [
    { animation: 'happy', message: "Your pet's tail wags with pride!", action: 'celebrate' },
    { animation: 'celebrate', message: "Your companion celebrates your progress!", action: 'celebrate' }
  ],
  normalization: [
    { animation: 'comfort', message: "Your pet nuzzles against you reassuringly.", action: 'comfort' },
    { animation: 'calm', message: "Your companion's calm presence reminds you that you're okay.", action: 'comfort' }
  ],
  psychoeducation: [
    { animation: 'attentive', message: "Your pet listens as if learning alongside you.", action: 'listen' },
    { animation: 'curious', message: "Your companion seems interested in this new information.", action: 'listen' }
  ]
};

export function generateTherapeuticResponse(
  message: string,
  context: ConversationContext,
  petName?: string
): TherapeuticResponse {
  const emotionalState = analyzeEmotionalState(message);
  const technique = selectTechnique(emotionalState, context);
  
  // Select response
  const responses = techniqueResponses[technique];
  const baseResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Select pet reaction
  const petReactionOptions = petReactions[technique];
  const petReaction = petReactionOptions[Math.floor(Math.random() * petReactionOptions.length)];
  
  // Personalize pet message
  if (petReaction.message && petName) {
    petReaction.message = petReaction.message.replace('Your pet', petName).replace('Your companion', petName);
  }
  
  // Add follow-up question sometimes
  let content = baseResponse;
  const followUps = [
    "Would you like to tell me more?",
    "How does that make you feel?",
    "What's been on your mind about this?",
    "Is there anything else you'd like to share?",
    "What would help you feel better right now?"
  ];
  
  if (Math.random() < 0.4 && technique !== 'grounding') {
    const followUp = followUps[Math.floor(Math.random() * followUps.length)];
    content = `${baseResponse} ${followUp}`;
  }
  
  return {
    content,
    technique,
    petReaction,
    emotionalState
  };
}

// ============================================================================
// CONVERSATION CONTEXT MANAGEMENT
// ============================================================================

export function updateContext(
  context: ConversationContext,
  message: string,
  response: TherapeuticResponse
): ConversationContext {
  const themes = detectThemes(message);
  
  return {
    messageCount: context.messageCount + 1,
    themes: [...new Set([...context.themes, ...themes])],
    emotionalJourney: [...context.emotionalJourney, response.emotionalState],
    techniquesUsed: [...context.techniquesUsed, response.technique],
    breakthroughs: context.breakthroughs,
    concerns: context.concerns
  };
}

export function createInitialContext(): ConversationContext {
  return {
    messageCount: 0,
    themes: [],
    emotionalJourney: [],
    techniquesUsed: [],
    breakthroughs: [],
    concerns: []
  };
}

// ============================================================================
// CRISIS DETECTION
// ============================================================================

const crisisKeywords = [
  'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
  "don't want to live", 'better off dead', 'no reason to live',
  'end it all', 'hurt myself', 'self-harm', 'cutting', 'overdose',
  'goodbye', 'final', 'last time', "can't go on", 'give up on life'
];

export function detectCrisis(message: string): { isCrisis: boolean; severity: 'low' | 'medium' | 'high' } {
  const lowerMessage = message.toLowerCase();
  const matches = crisisKeywords.filter(keyword => lowerMessage.includes(keyword));
  
  if (matches.length === 0) {
    return { isCrisis: false, severity: 'low' };
  }
  
  const severity = matches.length >= 2 ? 'high' : 'medium';
  return { isCrisis: true, severity };
}

export const CRISIS_RESOURCES = [
  { name: "National Suicide Prevention Lifeline", phone: "988", country: "USA", available24h: true },
  { name: "Crisis Text Line", phone: "Text HOME to 741741", country: "USA", available24h: true },
  { name: "Samaritans", phone: "116 123", country: "UK", available24h: true },
  { name: "International Association for Suicide Prevention", phone: "Various", country: "International", available24h: true }
];
