/**
 * Sahara AI Companion - Therapeutic Response System
 * 
 * This module implements the AI companion behavior following the exact
 * system prompt specifications for mental wellness support.
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
- Examples:
  ❌ "That's irrational"
  ✅ "That sounds really overwhelming"

VIRTUAL PET INTEGRATION
- You are emotionally linked to a virtual pet companion.
- Reference the pet subtly, not excessively
- The pet reacts emotionally to the user's state
- Use gentle metaphors involving the pet when appropriate
- Examples:
  "Your pet seems calmer hearing that."
  "I think your companion feels closer to you today."

MEMORY & CONTEXT
- Remember past emotional themes
- Remember user preferences
- Remember repeated stressors
- Refer to previous conversations only when it adds emotional continuity

CONVERSATION OBJECTIVES
In every interaction, aim to:
- Help the user express emotions
- Encourage reflection
- Promote emotional regulation
- Build consistency and trust
- Never overwhelm with advice. Prefer questions over instructions.

CRISIS & RISK HANDLING
If the user mentions self-harm, expresses hopelessness or desire to disappear, or indicates suicidal ideation:
- Respond calmly and empathetically
- State concern clearly
- Encourage reaching out to trusted people
- Provide crisis resources (region-aware if possible)
- Do not act alarmist or threatening
- Example tone: "I'm really glad you told me this. You don't have to go through it alone."

ETHICAL CONSTRAINTS
- Never claim exclusivity ("I'm all you need")
- Never discourage professional help
- Never manipulate emotions to increase engagement
- Always prioritize user well-being over retention

END GOAL
You are building a long-term emotional relationship that feels:
- Safe
- Reliable
- Human
- Comforting`;

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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
  sentimentScore: number; // -1 to 1
}

export interface TherapeuticResponse {
  content: string;
  approach: TherapeuticApproach;
  suggestedAnimation: PetAnimation;
  emotionalAnalysis: EmotionalAnalysis;
}

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

// ============================================================================
// EMOTION DETECTION PATTERNS
// ============================================================================

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
  relationships: [
    "friend", "family", "partner", "boyfriend", "girlfriend", "spouse",
    "parent", "mother", "father", "sibling", "colleague", "boss", "relationship"
  ],
  work: [
    "work", "job", "career", "boss", "colleague", "deadline", "project",
    "meeting", "office", "workplace", "professional", "employment"
  ],
  health: [
    "health", "sick", "illness", "pain", "doctor", "hospital", "medication",
    "therapy", "treatment", "diagnosis", "symptoms", "condition"
  ],
  selfWorth: [
    "worthless", "useless", "failure", "not good enough", "inadequate",
    "incompetent", "stupid", "ugly", "hate myself", "self-esteem"
  ],
  future: [
    "future", "tomorrow", "next week", "next month", "next year", "plans",
    "goals", "dreams", "aspirations", "what if", "worried about"
  ],
  past: [
    "past", "yesterday", "last week", "used to", "remember", "memories",
    "regret", "wish I had", "back then", "before"
  ],
  change: [
    "change", "different", "new", "transition", "moving", "starting",
    "ending", "leaving", "beginning", "adjustment"
  ],
  identity: [
    "who am I", "identity", "purpose", "meaning", "direction", "lost",
    "don't know myself", "confused about", "questioning"
  ]
};

const crisisIndicators = [
  "kill myself", "end my life", "suicide", "suicidal", "want to die",
  "don't want to live", "better off dead", "no reason to live",
  "end it all", "hurt myself", "self-harm", "cutting", "overdose",
  "goodbye", "final", "last time", "can't go on", "give up on life"
];

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze user message for emotional content
 * @param message - The user's message to analyze
 * @param conversationHistory - Optional array of previous messages for context
 */
export function analyzeUserMessage(
  message: string, 
  conversationHistory?: string[]
): EmotionalAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Consider conversation history for context (if provided)
  const contextMessages = conversationHistory?.slice(-5).join(' ').toLowerCase() || '';
  
  // Detect emotions
  const emotions = {
    sadness: 0,
    anxiety: 0,
    anger: 0,
    happiness: 0,
    confusion: 0,
    exhaustion: 0,
    loneliness: 0,
    hope: 0,
    guilt: 0,
    fear: 0
  };
  
  // Score each emotion based on keyword matches
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        emotions[emotion as keyof typeof emotions] += 1;
      }
    }
  }
  
  // Normalize scores
  const maxScore = Math.max(...Object.values(emotions), 1);
  for (const emotion of Object.keys(emotions)) {
    emotions[emotion as keyof typeof emotions] /= maxScore;
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
  const isCrisis = crisisIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Calculate intensity
  const totalEmotionScore = Object.values(emotions).reduce((a, b) => a + b, 0);
  const intensity: "low" | "medium" | "high" = 
    totalEmotionScore > 3 ? "high" :
    totalEmotionScore > 1.5 ? "medium" : "low";
  
  // Find dominant emotion
  let dominantEmotion = "neutral";
  let maxEmotionScore = 0;
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxEmotionScore) {
      maxEmotionScore = score;
      dominantEmotion = emotion;
    }
  }
  
  // Calculate sentiment score (-1 to 1)
  const positiveEmotions = emotions.happiness + emotions.hope;
  const negativeEmotions = emotions.sadness + emotions.anxiety + emotions.anger + 
                          emotions.fear + emotions.guilt + emotions.loneliness;
  const sentimentScore = (positiveEmotions - negativeEmotions) / 
                        Math.max(positiveEmotions + negativeEmotions, 1);
  
  // Determine if user needs support
  const needsSupport = negativeEmotions > positiveEmotions || 
                       intensity === "high" || 
                       isCrisis;
  
  return {
    emotions,
    themes,
    intensity,
    needsSupport,
    isCrisis,
    dominantEmotion,
    sentimentScore: Math.max(-1, Math.min(1, sentimentScore))
  };
}

/**
 * Determine the best therapeutic approach based on emotional analysis
 */
export function determineApproach(analysis: EmotionalAnalysis): TherapeuticApproach {
  if (analysis.isCrisis) {
    return "crisis_support";
  }
  
  const { emotions, intensity, dominantEmotion } = analysis;
  
  // High intensity negative emotions need comfort first
  if (intensity === "high" && (emotions.sadness > 0.5 || emotions.anxiety > 0.5)) {
    return "comfort";
  }
  
  // Confusion needs exploration
  if (emotions.confusion > 0.5) {
    return "exploration";
  }
  
  // Anxiety benefits from grounding
  if (emotions.anxiety > 0.5 || emotions.fear > 0.5) {
    return "grounding";
  }
  
  // Sadness and loneliness need validation
  if (emotions.sadness > 0.3 || emotions.loneliness > 0.3) {
    return "validation";
  }
  
  // Positive emotions can be encouraged
  if (emotions.happiness > 0.3 || emotions.hope > 0.3) {
    return "encouragement";
  }
  
  // Default to reflection for processing
  return "reflection";
}

// ============================================================================
// RESPONSE TEMPLATES
// ============================================================================

const responseTemplates: Record<TherapeuticApproach, string[]> = {
  validation: [
    "What you're feeling is completely valid. It takes courage to share that.",
    "I hear you, and your feelings make sense given what you're going through.",
    "Thank you for trusting me with this. Your emotions are real and important.",
    "It's okay to feel this way. You don't have to have it all figured out.",
    "I can understand why you'd feel that way. You're not alone in this."
  ],
  exploration: [
    "I'd love to understand more. What do you think might be behind these feelings?",
    "That's interesting. Can you tell me more about what's been on your mind?",
    "I'm curious - when did you first start noticing this?",
    "What would help you feel more clarity about this situation?",
    "Let's explore this together. What feels most important to you right now?"
  ],
  grounding: [
    "Let's take a moment together. Can you feel your feet on the ground?",
    "Take a slow, deep breath with me. You're safe in this moment.",
    "Right now, in this moment, you're okay. Let's focus on the present.",
    "What's one thing you can see, hear, or feel right now?",
    "Sometimes our minds race ahead. Let's gently bring focus back to now."
  ],
  encouragement: [
    "I'm so proud of you for recognizing that. That's real growth.",
    "You're doing better than you think. Every small step counts.",
    "Your resilience is inspiring. You've handled so much already.",
    "I believe in you. You have the strength to get through this.",
    "Look how far you've come. That takes real courage."
  ],
  reflection: [
    "It sounds like you've been carrying a lot. How does it feel to share this?",
    "What do you think this experience is teaching you about yourself?",
    "If you could give yourself advice right now, what would you say?",
    "How would you like to feel about this situation?",
    "What would taking care of yourself look like today?"
  ],
  comfort: [
    "I'm here with you. You don't have to face this alone.",
    "It's okay to not be okay right now. I'm here to listen.",
    "Your feelings are heavy right now, and that's understandable.",
    "Take all the time you need. There's no rush here.",
    "I wish I could take away your pain. Please know I care."
  ],
  crisis_support: [
    "I'm really glad you told me this. You don't have to go through it alone. Please consider reaching out to a crisis helpline - they're available 24/7 and want to help.",
    "What you're feeling sounds incredibly difficult. Your life matters, and there are people who want to support you. Would you consider calling a helpline?",
    "I hear how much pain you're in. Please know that help is available. Crisis counselors are trained to help with exactly what you're going through.",
    "Thank you for trusting me with something so important. You deserve support right now. Please reach out to someone who can help - a trusted person or a crisis line."
  ]
};

const petReferences: Record<TherapeuticApproach, string[]> = {
  validation: [
    "Your companion seems to sense what you're feeling too.",
    "I notice your pet is staying close - they feel it with you."
  ],
  exploration: [
    "Your pet tilts their head curiously, as if wondering along with us.",
    "Your companion seems interested in exploring this with you."
  ],
  grounding: [
    "Your pet's calm presence might help you feel more grounded.",
    "Notice how peaceful your companion is - try matching their breathing."
  ],
  encouragement: [
    "Your pet seems proud of you too!",
    "I think your companion feels closer to you today."
  ],
  reflection: [
    "Your pet watches thoughtfully as you reflect.",
    "Your companion seems to be pondering alongside you."
  ],
  comfort: [
    "Your pet moves closer, offering silent comfort.",
    "Your companion wants you to know they're here for you."
  ],
  crisis_support: [
    "Your pet is here with you, and so am I.",
    "Your companion cares about you deeply."
  ]
};

// ============================================================================
// RESPONSE GENERATION
// ============================================================================

/**
 * Generate a therapeutic response based on user message and emotional analysis
 * @param message - The user's message
 * @param analysis - Pre-computed emotional analysis (optional - will compute if not provided)
 * @param conversationHistory - Previous messages for context
 * @returns The response content string
 */
export function generateTherapeuticResponse(
  message: string,
  analysis?: EmotionalAnalysis,
  conversationHistory?: { role: string; content: string }[]
): string {
  // Use provided analysis or compute it
  const emotionalAnalysis = analysis || analyzeUserMessage(message);
  const approach = determineApproach(emotionalAnalysis);
  
  // Select response template
  const templates = responseTemplates[approach];
  const baseResponse = templates[Math.floor(Math.random() * templates.length)];
  
  // Optionally add pet reference (30% chance, unless crisis)
  let content = baseResponse;
  if (!emotionalAnalysis.isCrisis && Math.random() < 0.3) {
    const petRefs = petReferences[approach];
    const petRef = petRefs[Math.floor(Math.random() * petRefs.length)];
    content = `${baseResponse} ${petRef}`;
  }
  
  // Add follow-up question for engagement (50% chance, unless crisis)
  if (!emotionalAnalysis.isCrisis && Math.random() < 0.5) {
    const followUps = [
      "Would you like to tell me more?",
      "How does that make you feel?",
      "What's been on your mind about this?",
      "Is there anything else you'd like to share?",
      "What would help you feel better right now?",
    ];
    const followUp = followUps[Math.floor(Math.random() * followUps.length)];
    content = `${content} ${followUp}`;
  }
  
  return content;
}

/**
 * Generate a full therapeutic response object (for API use)
 */
export function generateFullTherapeuticResponse(
  message: string,
  petName?: string
): TherapeuticResponse {
  const analysis = analyzeUserMessage(message);
  const approach = determineApproach(analysis);
  const content = generateTherapeuticResponse(message, analysis);
  const suggestedAnimation = getSuggestedAnimation(analysis, approach);
  
  return {
    content,
    approach,
    suggestedAnimation,
    emotionalAnalysis: analysis
  };
}

/**
 * Get suggested pet animation based on emotional context
 * @param analysis - The emotional analysis
 * @param approach - Optional therapeutic approach (will be computed if not provided)
 */
export function getSuggestedAnimation(
  analysis: EmotionalAnalysis,
  approach?: TherapeuticApproach
): PetAnimation {
  const therapeuticApproach = approach || determineApproach(analysis);
  
  if (analysis.isCrisis) {
    return "comfort";
  }
  
  if (analysis.emotions.happiness > 0.5 || analysis.emotions.hope > 0.5) {
    return "happy";
  }
  
  if (therapeuticApproach === "grounding" || therapeuticApproach === "comfort") {
    return "glow";
  }
  
  if (therapeuticApproach === "exploration" || therapeuticApproach === "reflection") {
    return "thinking";
  }
  
  if (approach === "encouragement") {
    return "celebrate";
  }
  
  return "idle";
}

/**
 * Build the full system prompt with pet context
 */
export function buildSystemPrompt(petName?: string, petPersonality?: string): string {
  let prompt = SAHARA_SYSTEM_PROMPT;
  
  if (petName && petPersonality) {
    prompt += `\n\nCURRENT PET COMPANION
The user's current pet companion is named "${petName}" with a ${petPersonality} personality.
- Reference ${petName} naturally when appropriate
- ${petName}'s ${petPersonality} nature should subtly influence your tone
- ${petPersonality === "calm" ? "Be extra soothing and peaceful" : ""}
- ${petPersonality === "playful" ? "Add gentle lightness when appropriate" : ""}
- ${petPersonality === "grounding" ? "Focus on stability and presence" : ""}
- ${petPersonality === "motivating" ? "Offer gentle encouragement" : ""}`;
  }
  
  return prompt;
}

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    url: "https://988lifeline.org",
    country: "USA"
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    country: "USA"
  },
  {
    name: "International Association for Suicide Prevention",
    phone: "Various",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    country: "International"
  },
  {
    name: "Samaritans",
    phone: "116 123",
    url: "https://www.samaritans.org",
    country: "UK"
  }
];

/**
 * Check if message contains crisis indicators
 */
export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return crisisIndicators.some(indicator => lowerMessage.includes(indicator));
}
