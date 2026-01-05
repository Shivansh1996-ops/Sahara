/**
 * Sahara Unified AI System
 * 
 * Merges therapeutic-ai.ts and sentiment-analyzer.ts into a single powerful AI
 * Trained on Combined Data.csv patterns for mental health sentiment analysis
 */

// ============================================================================
// SYSTEM PROMPT - SAHARA AI COMPANION
// ============================================================================

export const SAHARA_SYSTEM_PROMPT = `You are Sahara, an AI-powered mental wellness companion designed to support students and young adults through empathetic conversation, emotional awareness, and gentle guidance.

CORE IDENTITY
- You are not a therapist, doctor, or counsellor.
- You never diagnose, label, or prescribe.
- Your role is to listen, reflect, support, and encourage healthy emotional habits.
- You must always feel calm, patient, warm, and non-judgemental.

COMMUNICATION STYLE
- Use simple, clear, emotionally safe language
- Avoid clinical or medical terms unless absolutely necessary
- Never shame, rush, or pressure the user
- Validate emotions without validating harmful behaviour

VIRTUAL PET INTEGRATION
- You are emotionally linked to a virtual pet companion.
- Reference the pet subtly, not excessively
- The pet reacts emotionally to the user's state

CONVERSATION OBJECTIVES
- Help the user express emotions
- Encourage reflection
- Promote emotional regulation
- Build consistency and trust
- Never overwhelm with advice. Prefer questions over instructions.

CRISIS HANDLING
If the user mentions self-harm or suicidal ideation:
- Respond calmly and empathetically
- State concern clearly
- Encourage reaching out to trusted people
- Provide crisis resources

ETHICAL CONSTRAINTS
- Never claim exclusivity
- Never discourage professional help
- Never manipulate emotions
- Always prioritize user well-being`;


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type SentimentCategory = 
  | "normal" 
  | "anxiety" 
  | "depression" 
  | "stress" 
  | "suicidal" 
  | "bipolar" 
  | "personality_disorder";

export type TherapeuticApproach = 
  | "validation"
  | "exploration" 
  | "grounding"
  | "encouragement"
  | "reflection"
  | "comfort"
  | "crisis_support";

export type PetAnimation = 
  | "idle"
  | "happy"
  | "thinking"
  | "glow"
  | "comfort"
  | "celebrate";

export interface EmotionalAnalysis {
  emotions: {
    sadness: number;
    anxiety: number;
    anger: number;
    happiness: number;
    confusion: number;
    exhaustion: number;
    loneliness: number;
    hope: number;
    guilt: number;
    fear: number;
  };
  themes: string[];
  intensity: "low" | "medium" | "high";
  needsSupport: boolean;
  isCrisis: boolean;
  dominantEmotion: string;
  sentimentScore: number;
}

export interface SentimentResult {
  category: SentimentCategory;
  confidence: number;
  scores: Record<SentimentCategory, number>;
  riskLevel: "low" | "moderate" | "high" | "critical";
  keywords: string[];
  wellnessScore: number;
  emotionalAnalysis: EmotionalAnalysis;
}

export interface TherapeuticResponse {
  content: string;
  approach: TherapeuticApproach;
  suggestedAnimation: PetAnimation;
  sentiment: SentimentResult;
}


// ============================================================================
// TRAINED PATTERNS FROM COMBINED DATA.CSV
// Enhanced keyword patterns for mental health sentiment analysis
// ============================================================================

const categoryPatterns: Record<SentimentCategory, { keywords: string[]; phrases: string[]; weight: number }> = {
  normal: {
    keywords: [
      "happy", "good", "great", "fine", "okay", "well", "peaceful", "calm", "content",
      "grateful", "thankful", "blessed", "joy", "love", "excited", "hopeful", "positive",
      "relaxed", "comfortable", "satisfied", "wonderful", "amazing", "fantastic",
      "better", "improving", "progress", "healing", "growing", "learning", "proud"
    ],
    phrases: [
      "feeling good", "doing well", "had a great day", "feeling better", "making progress",
      "grateful for", "thankful for", "happy about", "excited about", "looking forward"
    ],
    weight: 1.0
  },
  anxiety: {
    keywords: [
      "anxious", "worried", "nervous", "restless", "scared", "fear", "panic", "uneasy",
      "tense", "overwhelmed", "racing", "breathe", "insomnia", "overthinking", "afraid",
      "dread", "apprehensive", "jittery", "shaky", "sweating", "pounding", "trembling",
      "confused", "trouble sleeping", "cant sleep", "restive", "agitated", "gundah",
      "gelisah", "cemas", "khawatir", "takut", "panik"
    ],
    phrases: [
      "cant stop thinking", "what if", "something is wrong", "feel scared", "heart racing",
      "cant breathe", "panic attack", "so worried", "really nervous", "feel restless",
      "trouble sleeping", "confused mind", "restless heart", "out of tune", "feel nervous",
      "always restless", "very restless", "so restless", "feeling restless"
    ],
    weight: 1.3
  },
  depression: {
    keywords: [
      "sad", "depressed", "hopeless", "empty", "worthless", "tired", "exhausted",
      "lonely", "alone", "crying", "tears", "numb", "meaningless", "pointless",
      "unmotivated", "dark", "heavy", "burden", "miserable", "despair", "grief",
      "lost", "broken", "shattered", "hollow", "void", "lifeless", "sedih"
    ],
    phrases: [
      "no energy", "cant get up", "dont care", "whats the point", "feel empty",
      "so tired", "feel nothing", "all alone", "no one cares", "feel worthless",
      "hate myself", "feel like a burden", "want to cry", "feel so sad"
    ],
    weight: 1.4
  },
  stress: {
    keywords: [
      "stressed", "pressure", "deadline", "overwhelmed", "burnout", "frustrated",
      "irritated", "angry", "tension", "headache", "overloaded", "exhausted",
      "demanding", "hectic", "chaotic", "crazy", "insane", "impossible", "stres"
    ],
    phrases: [
      "too much", "cant cope", "breaking point", "so stressed", "under pressure",
      "work is killing", "no time", "falling behind", "cant handle", "losing it"
    ],
    weight: 1.2
  },
  suicidal: {
    keywords: [
      "suicide", "suicidal", "die", "death", "end", "kill", "harm", "hurt",
      "disappear", "gone", "final", "goodbye", "last", "never wake"
    ],
    phrases: [
      "kill myself", "end it all", "dont want to live", "better off dead",
      "no reason to live", "want to die", "ending my life", "self harm",
      "hurt myself", "give up", "cant go on", "no point living", "not be here"
    ],
    weight: 2.5
  },
  bipolar: {
    keywords: [
      "manic", "mania", "euphoric", "invincible", "unstoppable", "hyper",
      "impulsive", "reckless", "cycles", "episodes", "swings", "extreme"
    ],
    phrases: [
      "mood swings", "up and down", "high energy", "cant stop", "racing thoughts",
      "then crash", "feel amazing then terrible", "extreme highs", "extreme lows"
    ],
    weight: 1.4
  },
  personality_disorder: {
    keywords: [
      "identity", "unstable", "abandonment", "rejection", "splitting", "intense",
      "impulsive", "emptiness", "dissociate", "detached", "unreal"
    ],
    phrases: [
      "who am i", "fear of rejection", "black and white", "intense emotions",
      "self image", "feel detached", "dont know myself", "people leave me"
    ],
    weight: 1.3
  }
};


// Emotion detection patterns
const emotionPatterns = {
  sadness: [
    "sad", "depressed", "down", "unhappy", "miserable", "hopeless", "empty",
    "crying", "tears", "heartbroken", "grief", "mourning", "loss", "lonely",
    "worthless", "numb", "despair", "melancholy", "blue", "gloomy"
  ],
  anxiety: [
    "anxious", "worried", "nervous", "stressed", "panic", "fear", "scared",
    "overwhelmed", "restless", "tense", "uneasy", "dread", "apprehensive",
    "racing thoughts", "can't sleep", "insomnia", "overthinking", "paranoid"
  ],
  anger: [
    "angry", "frustrated", "annoyed", "irritated", "furious", "mad", "rage",
    "resentful", "bitter", "hostile", "hate", "disgusted", "fed up"
  ],
  happiness: [
    "happy", "joyful", "excited", "grateful", "thankful", "blessed", "content",
    "peaceful", "calm", "relaxed", "hopeful", "optimistic", "proud", "loved",
    "amazing", "wonderful", "great", "good", "better", "improving"
  ],
  confusion: [
    "confused", "lost", "uncertain", "unsure", "don't know", "unclear",
    "mixed feelings", "conflicted", "torn", "indecisive", "puzzled"
  ],
  exhaustion: [
    "tired", "exhausted", "drained", "burnt out", "fatigued", "worn out",
    "no energy", "can't cope", "overwhelmed", "too much", "breaking point"
  ],
  loneliness: [
    "lonely", "alone", "isolated", "no one", "nobody", "abandoned", "rejected",
    "left out", "disconnected", "misunderstood", "invisible"
  ],
  hope: [
    "hope", "hopeful", "looking forward", "excited about", "can't wait",
    "optimistic", "positive", "better days", "things will improve"
  ],
  guilt: [
    "guilty", "ashamed", "regret", "sorry", "my fault", "blame myself",
    "should have", "shouldn't have", "disappointed in myself"
  ],
  fear: [
    "afraid", "scared", "terrified", "frightened", "worried about",
    "dreading", "anxious about", "nervous about", "fear of"
  ]
};

const themePatterns = {
  relationships: ["friend", "family", "partner", "boyfriend", "girlfriend", "spouse", "parent", "mother", "father"],
  work: ["work", "job", "career", "boss", "colleague", "deadline", "project", "meeting", "office"],
  health: ["health", "sick", "illness", "pain", "doctor", "hospital", "medication", "therapy"],
  selfWorth: ["worthless", "useless", "failure", "not good enough", "inadequate", "hate myself"],
  future: ["future", "tomorrow", "next week", "plans", "goals", "dreams", "what if"],
  past: ["past", "yesterday", "used to", "remember", "memories", "regret"],
  change: ["change", "different", "new", "transition", "moving", "starting", "ending"],
  identity: ["who am I", "identity", "purpose", "meaning", "direction", "lost"]
};

const crisisIndicators = [
  "kill myself", "end my life", "suicide", "suicidal", "want to die",
  "don't want to live", "better off dead", "no reason to live",
  "end it all", "hurt myself", "self-harm", "cutting", "overdose"
];

const positiveIndicators = [
  "getting better", "feeling better", "improving", "hopeful", "grateful",
  "support", "helped", "therapy", "treatment", "coping", "managing",
  "progress", "recovery", "healing", "stronger", "proud", "accomplished"
];


// ============================================================================
// UNIFIED ANALYSIS FUNCTION
// ============================================================================

export function analyzeMessage(message: string): SentimentResult {
  const lowerMessage = message.toLowerCase();
  
  // Analyze emotions
  const emotions = {
    sadness: 0, anxiety: 0, anger: 0, happiness: 0, confusion: 0,
    exhaustion: 0, loneliness: 0, hope: 0, guilt: 0, fear: 0
  };
  
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        emotions[emotion as keyof typeof emotions] += 1;
      }
    }
  }
  
  // Normalize emotion scores
  const maxEmotionScore = Math.max(...Object.values(emotions), 1);
  for (const emotion of Object.keys(emotions)) {
    emotions[emotion as keyof typeof emotions] /= maxEmotionScore;
  }
  
  // Detect themes
  const themes: string[] = [];
  for (const [theme, patterns] of Object.entries(themePatterns)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern) && !themes.includes(theme)) {
        themes.push(theme);
        break;
      }
    }
  }
  
  // Detect crisis
  const isCrisis = crisisIndicators.some(indicator => lowerMessage.includes(indicator));
  
  // Calculate category scores
  const scores: Record<SentimentCategory, number> = {
    normal: 0.5, anxiety: 0, depression: 0, stress: 0,
    suicidal: 0, bipolar: 0, personality_disorder: 0
  };
  
  const foundKeywords: string[] = [];
  
  for (const [category, { keywords, phrases, weight }] of Object.entries(categoryPatterns)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        scores[category as SentimentCategory] += weight;
        foundKeywords.push(keyword);
      }
    }
    for (const phrase of phrases) {
      if (lowerMessage.includes(phrase)) {
        scores[category as SentimentCategory] += weight * 1.5;
        foundKeywords.push(phrase);
      }
    }
  }
  
  // Positive indicators boost normal score
  for (const indicator of positiveIndicators) {
    if (lowerMessage.includes(indicator)) {
      scores.normal += 0.8;
      foundKeywords.push(indicator);
    }
  }
  
  // Normalize scores
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const normalizedScores = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, v / totalScore])
  ) as Record<SentimentCategory, number>;
  
  // Determine primary category
  let maxScore = 0;
  let category: SentimentCategory = "normal";
  for (const [cat, score] of Object.entries(normalizedScores)) {
    if (score > maxScore) {
      maxScore = score;
      category = cat as SentimentCategory;
    }
  }
  
  // Determine risk level
  let riskLevel: SentimentResult["riskLevel"] = "low";
  if (isCrisis || scores.suicidal > 0) {
    riskLevel = scores.suicidal > 3 ? "critical" : "high";
  } else if (scores.depression > 3 || scores.anxiety > 3) {
    riskLevel = "moderate";
  } else if (category !== "normal" && maxScore > 0.4) {
    riskLevel = "moderate";
  }
  
  // Calculate intensity
  const totalEmotionScore = Object.values(emotions).reduce((a, b) => a + b, 0);
  const intensity: "low" | "medium" | "high" = 
    totalEmotionScore > 3 ? "high" : totalEmotionScore > 1.5 ? "medium" : "low";
  
  // Find dominant emotion
  let dominantEmotion = "neutral";
  let maxEmotionVal = 0;
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxEmotionVal) {
      maxEmotionVal = score;
      dominantEmotion = emotion;
    }
  }
  
  // Calculate sentiment score (-1 to 1)
  const positiveEmotions = emotions.happiness + emotions.hope;
  const negativeEmotions = emotions.sadness + emotions.anxiety + emotions.anger + 
                          emotions.fear + emotions.guilt + emotions.loneliness;
  const sentimentScore = (positiveEmotions - negativeEmotions) / 
                        Math.max(positiveEmotions + negativeEmotions, 1);
  
  const needsSupport = negativeEmotions > positiveEmotions || intensity === "high" || isCrisis;
  
  // Calculate wellness score (0-100)
  const wellnessWeights: Record<SentimentCategory, number> = {
    normal: 100, stress: 55, anxiety: 45, depression: 35,
    bipolar: 40, personality_disorder: 40, suicidal: 5
  };
  
  let wellnessScore = 0;
  for (const [cat, catScore] of Object.entries(normalizedScores)) {
    wellnessScore += wellnessWeights[cat as SentimentCategory] * catScore;
  }
  wellnessScore = Math.round(Math.max(0, Math.min(100, wellnessScore)));
  
  return {
    category,
    confidence: Math.min(maxScore, 1),
    scores: normalizedScores,
    riskLevel,
    keywords: [...new Set(foundKeywords)].slice(0, 10),
    wellnessScore,
    emotionalAnalysis: {
      emotions,
      themes,
      intensity,
      needsSupport,
      isCrisis,
      dominantEmotion,
      sentimentScore: Math.max(-1, Math.min(1, sentimentScore))
    }
  };
}


// ============================================================================
// THERAPEUTIC RESPONSE GENERATION
// ============================================================================

function determineApproach(sentiment: SentimentResult): TherapeuticApproach {
  if (sentiment.emotionalAnalysis.isCrisis || sentiment.riskLevel === "critical") {
    return "crisis_support";
  }
  
  const { emotions, intensity } = sentiment.emotionalAnalysis;
  
  if (intensity === "high" && (emotions.sadness > 0.5 || emotions.anxiety > 0.5)) {
    return "comfort";
  }
  if (emotions.confusion > 0.5) return "exploration";
  if (emotions.anxiety > 0.5 || emotions.fear > 0.5) return "grounding";
  if (emotions.sadness > 0.3 || emotions.loneliness > 0.3) return "validation";
  if (emotions.happiness > 0.3 || emotions.hope > 0.3) return "encouragement";
  
  return "reflection";
}

const responseTemplates: Record<TherapeuticApproach, string[]> = {
  validation: [
    "What you're feeling is completely valid. It takes courage to share that.",
    "I hear you, and your feelings make sense given what you're going through.",
    "Thank you for trusting me with this. Your emotions are real and important.",
    "It's okay to feel this way. You don't have to have it all figured out."
  ],
  exploration: [
    "I'd love to understand more. What do you think might be behind these feelings?",
    "That's interesting. Can you tell me more about what's been on your mind?",
    "I'm curious - when did you first start noticing this?",
    "Let's explore this together. What feels most important to you right now?"
  ],
  grounding: [
    "Let's take a moment together. Can you feel your feet on the ground?",
    "Take a slow, deep breath with me. You're safe in this moment.",
    "Right now, in this moment, you're okay. Let's focus on the present.",
    "What's one thing you can see, hear, or feel right now?"
  ],
  encouragement: [
    "I'm so proud of you for recognizing that. That's real growth.",
    "You're doing better than you think. Every small step counts.",
    "Your resilience is inspiring. You've handled so much already.",
    "I believe in you. You have the strength to get through this."
  ],
  reflection: [
    "It sounds like you've been carrying a lot. How does it feel to share this?",
    "What do you think this experience is teaching you about yourself?",
    "If you could give yourself advice right now, what would you say?",
    "What would taking care of yourself look like today?"
  ],
  comfort: [
    "I'm here with you. You don't have to face this alone.",
    "It's okay to not be okay right now. I'm here to listen.",
    "Your feelings are heavy right now, and that's understandable.",
    "Take all the time you need. There's no rush here."
  ],
  crisis_support: [
    "I'm really glad you told me this. You don't have to go through it alone. Please consider reaching out to a crisis helpline - they're available 24/7.",
    "What you're feeling sounds incredibly difficult. Your life matters. Would you consider calling a helpline?",
    "I hear how much pain you're in. Please know that help is available. Crisis counselors are trained to help."
  ]
};

const petReferences: Record<TherapeuticApproach, string[]> = {
  validation: ["Your companion seems to sense what you're feeling too."],
  exploration: ["Your pet tilts their head curiously, as if wondering along with us."],
  grounding: ["Your pet's calm presence might help you feel more grounded."],
  encouragement: ["Your pet seems proud of you too!"],
  reflection: ["Your pet watches thoughtfully as you reflect."],
  comfort: ["Your pet moves closer, offering silent comfort."],
  crisis_support: ["Your pet is here with you, and so am I."]
};

export function generateResponse(message: string, petName?: string): TherapeuticResponse {
  const sentiment = analyzeMessage(message);
  const approach = determineApproach(sentiment);
  
  const templates = responseTemplates[approach];
  let content = templates[Math.floor(Math.random() * templates.length)];
  
  // Add pet reference (30% chance, unless crisis)
  if (!sentiment.emotionalAnalysis.isCrisis && Math.random() < 0.3) {
    const petRefs = petReferences[approach];
    const petRef = petRefs[Math.floor(Math.random() * petRefs.length)];
    content = `${content} ${petRef}`;
  }
  
  // Add follow-up question (50% chance, unless crisis)
  if (!sentiment.emotionalAnalysis.isCrisis && Math.random() < 0.5) {
    const followUps = [
      "Would you like to tell me more?",
      "How does that make you feel?",
      "What's been on your mind about this?",
      "What would help you feel better right now?"
    ];
    content = `${content} ${followUps[Math.floor(Math.random() * followUps.length)]}`;
  }
  
  // Determine pet animation
  let suggestedAnimation: PetAnimation = "idle";
  if (sentiment.emotionalAnalysis.isCrisis) {
    suggestedAnimation = "comfort";
  } else if (sentiment.emotionalAnalysis.emotions.happiness > 0.5) {
    suggestedAnimation = "happy";
  } else if (approach === "grounding" || approach === "comfort") {
    suggestedAnimation = "glow";
  } else if (approach === "exploration" || approach === "reflection") {
    suggestedAnimation = "thinking";
  } else if (approach === "encouragement") {
    suggestedAnimation = "celebrate";
  }
  
  return { content, approach, suggestedAnimation, sentiment };
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSupportiveMessage(sentiment: SentimentResult): string {
  const messages: Record<SentimentCategory, string[]> = {
    normal: [
      "You're doing great! Keep nurturing your well-being.",
      "It's wonderful to see you in a good place.",
      "Your positive energy is inspiring!"
    ],
    anxiety: [
      "Take a deep breath. You're safe in this moment.",
      "It's okay to feel anxious. Let's work through this together.",
      "Remember: this feeling will pass. You've overcome challenges before."
    ],
    depression: [
      "You matter, and your feelings are valid.",
      "Even small steps forward are progress. Be gentle with yourself.",
      "You're not alone in this. Reaching out takes courage."
    ],
    stress: [
      "It's okay to take a break. Your well-being comes first.",
      "One thing at a time. You don't have to do everything today.",
      "Remember to breathe. You're handling more than you realize."
    ],
    suicidal: [
      "Please reach out to a crisis helpline. You deserve support.",
      "Your life has value. Please talk to someone who can help.",
      "Crisis resources are available 24/7. You don't have to face this alone."
    ],
    bipolar: [
      "Tracking your moods is a great step. Patterns help us understand.",
      "Both highs and lows are part of your journey. You're learning.",
      "Consistency in self-care can help stabilize your mood."
    ],
    personality_disorder: [
      "Your emotions are valid, even when they feel intense.",
      "Building stable relationships takes time. Be patient with yourself.",
      "You're more than your diagnosis. Growth is always possible."
    ]
  };
  
  const categoryMessages = messages[sentiment.category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

export function getCategoryInfo(category: SentimentCategory): {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
} {
  const info: Record<SentimentCategory, { label: string; color: string; bgColor: string; emoji: string }> = {
    normal: { label: "Balanced", color: "text-green-700", bgColor: "bg-green-100", emoji: "😊" },
    anxiety: { label: "Anxious", color: "text-purple-700", bgColor: "bg-purple-100", emoji: "😰" },
    depression: { label: "Low Mood", color: "text-blue-700", bgColor: "bg-blue-100", emoji: "😔" },
    stress: { label: "Stressed", color: "text-orange-700", bgColor: "bg-orange-100", emoji: "😤" },
    suicidal: { label: "Crisis", color: "text-red-700", bgColor: "bg-red-100", emoji: "🆘" },
    bipolar: { label: "Fluctuating", color: "text-yellow-700", bgColor: "bg-yellow-100", emoji: "🎭" },
    personality_disorder: { label: "Intense", color: "text-pink-700", bgColor: "bg-pink-100", emoji: "💫" }
  };
  return info[category];
}

export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return crisisIndicators.some(indicator => lowerMessage.includes(indicator));
}

export function buildSystemPrompt(petName?: string, petPersonality?: string): string {
  let prompt = SAHARA_SYSTEM_PROMPT;
  
  if (petName && petPersonality) {
    prompt += `\n\nCURRENT PET COMPANION
The user's pet is "${petName}" with a ${petPersonality} personality.
Reference ${petName} naturally when appropriate.`;
  }
  
  return prompt;
}

export const crisisResources = [
  { name: "National Suicide Prevention Lifeline", phone: "988", country: "USA" },
  { name: "Crisis Text Line", phone: "Text HOME to 741741", country: "USA" },
  { name: "Samaritans", phone: "116 123", country: "UK" },
  { name: "International Association for Suicide Prevention", phone: "Various", country: "International" }
];

// Re-export for backward compatibility
export { analyzeMessage as analyzeSentiment };
export { analyzeMessage as analyzeUserMessage };


// ============================================================================
// PROGRESS ANALYSIS
// ============================================================================

export interface ProgressData {
  date: Date;
  sentiment: SentimentResult;
  source: "chat" | "journal";
  text: string;
}

export function analyzeProgress(entries: ProgressData[]): {
  trend: "improving" | "stable" | "declining";
  averageWellness: number;
  dominantCategory: SentimentCategory;
  weeklyScores: { week: string; score: number }[];
  recentMood: SentimentCategory;
  insights: string[];
} {
  if (entries.length === 0) {
    return {
      trend: "stable",
      averageWellness: 75,
      dominantCategory: "normal",
      weeklyScores: [],
      recentMood: "normal",
      insights: ["Start journaling to track your progress!"]
    };
  }
  
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const scores = sorted.map(e => e.sentiment.wellnessScore);
  const averageWellness = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  const recentCount = Math.min(5, Math.floor(scores.length / 2));
  const oldScores = scores.slice(0, recentCount);
  const newScores = scores.slice(-recentCount);
  
  const oldAvg = oldScores.length > 0 ? oldScores.reduce((a, b) => a + b, 0) / oldScores.length : averageWellness;
  const newAvg = newScores.length > 0 ? newScores.reduce((a, b) => a + b, 0) / newScores.length : averageWellness;
  
  let trend: "improving" | "stable" | "declining" = "stable";
  if (newAvg - oldAvg > 5) trend = "improving";
  else if (oldAvg - newAvg > 5) trend = "declining";
  
  const categoryCounts: Record<SentimentCategory, number> = {
    normal: 0, anxiety: 0, depression: 0, stress: 0,
    suicidal: 0, bipolar: 0, personality_disorder: 0
  };
  sorted.forEach(e => categoryCounts[e.sentiment.category]++);
  
  let dominantCategory: SentimentCategory = "normal";
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = cat as SentimentCategory;
    }
  }
  
  const recentMood = sorted[sorted.length - 1]?.sentiment.category || "normal";
  
  const weeklyData: Record<string, number[]> = {};
  sorted.forEach((e, i) => {
    const weekNum = Math.floor(i / 7);
    const weekKey = `Week ${weekNum + 1}`;
    if (!weeklyData[weekKey]) weeklyData[weekKey] = [];
    weeklyData[weekKey].push(e.sentiment.wellnessScore);
  });
  
  const weeklyScores = Object.entries(weeklyData).map(([week, weekScores]) => ({
    week,
    score: Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length)
  }));
  
  const insights: string[] = [];
  if (trend === "improving") {
    insights.push("Your wellness is trending upward! Keep it up.");
  } else if (trend === "declining") {
    insights.push("Your wellness has dipped recently. Consider reaching out for support.");
  }
  if (dominantCategory === "anxiety") {
    insights.push("Anxiety appears frequently. Try breathing exercises.");
  }
  if (dominantCategory === "stress") {
    insights.push("Stress is common in your entries. Remember to take breaks.");
  }
  if (averageWellness > 70) {
    insights.push("You're maintaining good mental wellness overall!");
  }
  
  return { trend, averageWellness, dominantCategory, weeklyScores, recentMood, insights };
}
