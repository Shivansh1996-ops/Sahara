/**
 * Advanced Journal Analysis Engine
 * Analyzes journal entries for:
 * - Emotional tone with nuance
 * - Recurring themes and patterns
 * - Cognitive distortions (CBT-based)
 * - Personalized insights
 */

// ============================================
// TYPES
// ============================================

export type EmotionalTone = 
  | "positive" | "hopeful" | "grateful" | "content"
  | "neutral" | "mixed"
  | "anxious" | "worried" | "fearful"
  | "sad" | "lonely" | "hopeless"
  | "angry" | "frustrated" | "irritated"
  | "stressed" | "overwhelmed";

export type ThemeCategory = 
  | "work_stress" | "career" | "productivity"
  | "relationships" | "family" | "loneliness" | "social"
  | "self_doubt" | "self_criticism" | "identity"
  | "health" | "sleep" | "physical"
  | "finances" | "future_worry"
  | "trauma" | "grief" | "loss"
  | "achievement" | "growth" | "gratitude";

export type CognitiveDistortion = 
  | "catastrophizing"
  | "black_and_white"
  | "mind_reading"
  | "fortune_telling"
  | "emotional_reasoning"
  | "should_statements"
  | "labeling"
  | "personalization"
  | "overgeneralization"
  | "mental_filtering"
  | "disqualifying_positive"
  | "magnification";

export interface EmotionalAnalysis {
  primaryTone: EmotionalTone;
  secondaryTones: EmotionalTone[];
  valence: number;
  arousal: number;
  confidence: number;
  indicators: string[];
}

export interface ThemeAnalysis {
  themes: {
    category: ThemeCategory;
    confidence: number;
    mentions: number;
    keywords: string[];
  }[];
  recurringPatterns: string[];
}

export interface DistortionAnalysis {
  distortions: {
    type: CognitiveDistortion;
    severity: "mild" | "moderate" | "significant";
    evidence: string[];
    reframe: string;
  }[];
  totalDistortionScore: number;
}

export interface JournalInsight {
  type: "positive" | "concern" | "pattern" | "suggestion";
  title: string;
  description: string;
  actionable?: string;
}

export interface FullJournalAnalysis {
  emotional: EmotionalAnalysis;
  themes: ThemeAnalysis;
  distortions: DistortionAnalysis;
  insights: JournalInsight[];
  wellnessImpact: number;
  timestamp: Date;
}

// ============================================
// EMOTIONAL TONE PATTERNS
// ============================================

const emotionalPatterns: Record<EmotionalTone, {
  keywords: string[];
  phrases: string[];
  weight: number;
  valence: number;
  arousal: number;
}> = {
  positive: {
    keywords: ["happy", "joy", "excited", "wonderful", "amazing", "fantastic", "great", "love", "blessed", "thrilled"],
    phrases: ["so happy", "feeling great", "best day", "love my life", "couldn't be better"],
    weight: 1.0, valence: 0.9, arousal: 0.7
  },
  hopeful: {
    keywords: ["hope", "optimistic", "looking forward", "excited", "anticipate", "believe", "confident"],
    phrases: ["things will get better", "looking forward to", "believe in myself", "future looks"],
    weight: 1.0, valence: 0.7, arousal: 0.5
  },
  grateful: {
    keywords: ["grateful", "thankful", "appreciate", "blessed", "fortunate", "lucky"],
    phrases: ["so grateful", "thankful for", "appreciate having", "lucky to have"],
    weight: 1.0, valence: 0.8, arousal: 0.3
  },
  content: {
    keywords: ["content", "peaceful", "calm", "relaxed", "satisfied", "comfortable", "serene"],
    phrases: ["feeling content", "at peace", "nice and calm", "feeling settled"],
    weight: 1.0, valence: 0.6, arousal: 0.2
  },
  neutral: {
    keywords: ["okay", "fine", "alright", "normal", "usual", "regular"],
    phrases: ["nothing special", "same as usual", "just another day"],
    weight: 0.5, valence: 0.0, arousal: 0.3
  },
  mixed: {
    keywords: ["conflicted", "torn", "unsure", "complicated", "mixed"],
    phrases: ["not sure how I feel", "mixed feelings", "part of me"],
    weight: 0.8, valence: 0.0, arousal: 0.5
  },
  anxious: {
    keywords: ["anxious", "nervous", "worried", "uneasy", "restless", "tense", "apprehensive"],
    phrases: ["can't stop worrying", "what if", "keep thinking about", "worried sick"],
    weight: 1.2, valence: -0.6, arousal: 0.8
  },
  worried: {
    keywords: ["worried", "concerned", "troubled", "bothered", "preoccupied"],
    phrases: ["worried about", "can't help but worry", "on my mind"],
    weight: 1.1, valence: -0.5, arousal: 0.6
  },
  fearful: {
    keywords: ["scared", "afraid", "terrified", "frightened", "panic", "dread"],
    phrases: ["so scared", "afraid of", "terrifies me", "panic attack"],
    weight: 1.3, valence: -0.8, arousal: 0.9
  },
  sad: {
    keywords: ["sad", "unhappy", "down", "blue", "miserable", "heartbroken", "crying"],
    phrases: ["feeling down", "so sad", "makes me cry", "breaks my heart"],
    weight: 1.2, valence: -0.7, arousal: 0.4
  },
  lonely: {
    keywords: ["lonely", "alone", "isolated", "disconnected", "abandoned", "forgotten"],
    phrases: ["so lonely", "all alone", "no one understands", "feel isolated"],
    weight: 1.3, valence: -0.7, arousal: 0.3
  },
  hopeless: {
    keywords: ["hopeless", "helpless", "pointless", "worthless", "empty", "numb", "despair"],
    phrases: ["what's the point", "nothing matters", "can't go on", "no hope"],
    weight: 1.5, valence: -0.9, arousal: 0.2
  },
  angry: {
    keywords: ["angry", "furious", "enraged", "livid", "outraged", "mad"],
    phrases: ["so angry", "makes me furious", "how dare", "pissed off"],
    weight: 1.2, valence: -0.6, arousal: 0.9
  },
  frustrated: {
    keywords: ["frustrated", "annoyed", "irritated", "exasperated", "fed up"],
    phrases: ["so frustrated", "drives me crazy", "sick of", "can't stand"],
    weight: 1.1, valence: -0.5, arousal: 0.7
  },
  irritated: {
    keywords: ["irritated", "bothered", "bugged", "peeved", "aggravated"],
    phrases: ["getting on my nerves", "really bothers me", "so annoying"],
    weight: 1.0, valence: -0.4, arousal: 0.6
  },
  stressed: {
    keywords: ["stressed", "pressure", "overwhelmed", "burden", "strain", "exhausted"],
    phrases: ["so stressed", "under pressure", "too much", "can't cope"],
    weight: 1.2, valence: -0.6, arousal: 0.8
  },
  overwhelmed: {
    keywords: ["overwhelmed", "drowning", "swamped", "buried", "overloaded"],
    phrases: ["too much to handle", "can't keep up", "falling behind", "losing control"],
    weight: 1.3, valence: -0.7, arousal: 0.9
  }
};

// ============================================
// COGNITIVE DISTORTION PATTERNS
// ============================================

const distortionPatterns: Record<CognitiveDistortion, {
  patterns: RegExp[];
  phrases: string[];
  description: string;
  reframes: string[];
}> = {
  catastrophizing: {
    patterns: [
      /what if .*(terrible|awful|disaster|worst|horrible)/i,
      /this is (the worst|a disaster|terrible)/i,
      /everything (is|will be) (ruined|destroyed|over)/i
    ],
    phrases: ["worst case scenario", "everything will fall apart", "it's all over", "disaster"],
    description: "Expecting the worst possible outcome",
    reframes: [
      "What is the most likely outcome, not the worst?",
      "Have I survived similar situations before?",
      "What would I tell a friend thinking this way?"
    ]
  },
  black_and_white: {
    patterns: [
      /\b(always|never|everyone|no one|everything|nothing|completely|totally)\b/i,
      /either .* or/i
    ],
    phrases: ["always", "never", "everyone", "no one", "complete failure", "all or nothing"],
    description: "Seeing things in extremes with no middle ground",
    reframes: [
      "Is there any middle ground here?",
      "Can something be partially good and partially challenging?",
      "What percentage is more accurate than 0% or 100%?"
    ]
  },
  mind_reading: {
    patterns: [
      /they (think|believe|must think) (I'm|that I)/i,
      /I know (they|he|she) (thinks|feels)/i,
      /(he|she|they) (hate|dislike|judge) me/i
    ],
    phrases: ["they think I'm", "everyone thinks", "they must think", "people are judging"],
    description: "Assuming you know what others are thinking",
    reframes: [
      "What evidence do I have for what they're thinking?",
      "Have I asked them directly?",
      "Could there be other explanations?"
    ]
  },
  fortune_telling: {
    patterns: [
      /I (know|just know) .* (will|going to|won't)/i,
      /it's going to (fail|go wrong|be terrible)/i,
      /I'm going to (fail|mess up|ruin)/i
    ],
    phrases: ["I know it will fail", "it's going to go wrong", "I'm going to mess up"],
    description: "Predicting negative outcomes as certain",
    reframes: [
      "Can I really predict the future?",
      "What are all the possible outcomes?",
      "What evidence supports this prediction?"
    ]
  },
  emotional_reasoning: {
    patterns: [
      /I feel .* (so|therefore) (I am|it is)/i,
      /because I feel .*, I am/i
    ],
    phrases: ["I feel stupid so I must be", "I feel worthless therefore I am", "I feel like a failure"],
    description: "Treating feelings as facts",
    reframes: [
      "Just because I feel it, does that make it true?",
      "What objective evidence contradicts this feeling?",
      "Would my feelings change my worth as a person?"
    ]
  },
  should_statements: {
    patterns: [
      /I (should|shouldn't|must|have to|ought to)/i,
      /they (should|shouldn't|must)/i
    ],
    phrases: ["I should", "I shouldn't", "I must", "I have to", "they should"],
    description: "Rigid rules about how things must be",
    reframes: [
      "Is this a preference or a rigid rule?",
      "What if I replaced 'should' with 'could'?",
      "Where did this rule come from?"
    ]
  },
  labeling: {
    patterns: [
      /I('m| am) (a|an|such a) (failure|loser|idiot|stupid|worthless)/i,
      /I('m| am) (completely|totally|just) (worthless|useless|pathetic)/i
    ],
    phrases: ["I'm a failure", "I'm an idiot", "I'm worthless", "I'm a loser"],
    description: "Assigning global negative labels",
    reframes: [
      "Am I defining myself by one behavior?",
      "Would I label someone else this way?",
      "Does this label account for all my qualities?"
    ]
  },
  personalization: {
    patterns: [
      /it's (all|entirely) my fault/i,
      /because of me|I caused/i,
      /I'm (to blame|responsible) for everything/i
    ],
    phrases: ["it's my fault", "I'm to blame", "because of me", "I caused this"],
    description: "Blaming yourself for things outside your control",
    reframes: [
      "What other factors contributed?",
      "Am I taking responsibility for others' choices?",
      "What percentage was actually in my control?"
    ]
  },
  overgeneralization: {
    patterns: [
      /this always happens/i,
      /I always fail/i,
      /nothing ever works/i
    ],
    phrases: ["this always happens", "I always", "I never", "every time", "nothing ever"],
    description: "Drawing broad conclusions from single events",
    reframes: [
      "Is this truly 'always' or 'never'?",
      "Can I think of any exceptions?",
      "What would be more accurate?"
    ]
  },
  mental_filtering: {
    patterns: [
      /can't stop thinking about .* bad/i,
      /all I (can see|notice) is/i
    ],
    phrases: ["all I see is the negative", "can't stop thinking about what went wrong", "only see the flaws"],
    description: "Focusing only on negatives",
    reframes: [
      "What positive aspects am I overlooking?",
      "What would someone else notice?",
      "Can I list both positives and negatives?"
    ]
  },
  disqualifying_positive: {
    patterns: [
      /doesn't (count|matter)/i,
      /they're just being nice/i,
      /just luck/i
    ],
    phrases: ["doesn't count", "they're just being nice", "just luck", "anyone could do that"],
    description: "Dismissing positive experiences",
    reframes: [
      "Why doesn't this positive thing count?",
      "Would I dismiss someone else's achievement?",
      "What if I accepted this at face value?"
    ]
  },
  magnification: {
    patterns: [
      /this is (huge|enormous|the biggest)/i,
      /I can't (handle|cope)/i,
      /this ruins everything/i
    ],
    phrases: ["this is huge", "can't handle this", "this changes everything", "unbearable"],
    description: "Exaggerating the importance of negatives",
    reframes: [
      "How important will this be in 5 years?",
      "On a scale of 1-10, how bad is this?",
      "Have I handled similar challenges?"
    ]
  }
};

// ============================================
// THEME PATTERNS
// ============================================

const themePatterns: Record<ThemeCategory, { keywords: string[]; phrases: string[] }> = {
  work_stress: {
    keywords: ["work", "job", "boss", "deadline", "meeting", "project", "coworker", "office"],
    phrases: ["at work", "my boss", "work stress", "job stress"]
  },
  career: {
    keywords: ["career", "promotion", "interview", "resume", "professional"],
    phrases: ["career path", "job search", "career change"]
  },
  productivity: {
    keywords: ["productive", "procrastinate", "focus", "distracted", "accomplish", "tasks"],
    phrases: ["get things done", "can't focus", "wasted time"]
  },
  relationships: {
    keywords: ["partner", "boyfriend", "girlfriend", "husband", "wife", "relationship", "dating"],
    phrases: ["my partner", "our relationship", "broke up"]
  },
  family: {
    keywords: ["family", "parents", "mom", "dad", "siblings", "brother", "sister", "kids"],
    phrases: ["my family", "my parents", "family issues"]
  },
  loneliness: {
    keywords: ["lonely", "alone", "isolated", "friendless"],
    phrases: ["feel alone", "no friends", "nobody understands"]
  },
  social: {
    keywords: ["friends", "social", "party", "hangout", "people"],
    phrases: ["with friends", "social anxiety", "meeting people"]
  },
  self_doubt: {
    keywords: ["doubt", "unsure", "insecure", "uncertain"],
    phrases: ["doubt myself", "not sure if I can", "am I good enough"]
  },
  self_criticism: {
    keywords: ["stupid", "failure", "worthless", "useless", "hate myself"],
    phrases: ["I'm so stupid", "I'm a failure", "hate myself"]
  },
  identity: {
    keywords: ["identity", "who am I", "purpose", "meaning"],
    phrases: ["don't know who I am", "finding myself"]
  },
  health: {
    keywords: ["health", "sick", "pain", "doctor", "illness", "symptoms"],
    phrases: ["feeling sick", "health issues", "chronic pain"]
  },
  sleep: {
    keywords: ["sleep", "insomnia", "tired", "exhausted", "nightmare"],
    phrases: ["can't sleep", "so tired", "bad dreams"]
  },
  physical: {
    keywords: ["exercise", "gym", "workout", "body", "weight", "fitness"],
    phrases: ["went to gym", "body image", "no energy"]
  },
  finances: {
    keywords: ["money", "financial", "bills", "debt", "budget", "broke"],
    phrases: ["money problems", "can't afford", "financial stress"]
  },
  future_worry: {
    keywords: ["future", "tomorrow", "upcoming", "uncertain"],
    phrases: ["worried about future", "what will happen"]
  },
  trauma: {
    keywords: ["trauma", "ptsd", "flashback", "trigger", "abuse"],
    phrases: ["traumatic experience", "can't forget"]
  },
  grief: {
    keywords: ["grief", "loss", "mourning", "death", "died", "miss"],
    phrases: ["lost someone", "miss them", "still grieving"]
  },
  loss: {
    keywords: ["lost", "losing", "gone", "ended"],
    phrases: ["lost my", "it's over"]
  },
  achievement: {
    keywords: ["achieved", "accomplished", "success", "won", "proud"],
    phrases: ["finally did it", "so proud", "achieved my goal"]
  },
  growth: {
    keywords: ["growth", "learning", "improving", "progress", "developing"],
    phrases: ["making progress", "getting better", "personal growth"]
  },
  gratitude: {
    keywords: ["grateful", "thankful", "appreciate", "blessed"],
    phrases: ["grateful for", "thankful that", "appreciate having"]
  }
};

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

export function analyzeEmotionalTone(text: string): EmotionalAnalysis {
  const lowerText = text.toLowerCase();
  const scores: Record<EmotionalTone, number> = {} as Record<EmotionalTone, number>;
  const foundIndicators: string[] = [];
  
  for (const tone of Object.keys(emotionalPatterns) as EmotionalTone[]) {
    scores[tone] = 0;
  }
  
  for (const [tone, { keywords, phrases, weight }] of Object.entries(emotionalPatterns)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[tone as EmotionalTone] += weight;
        foundIndicators.push(keyword);
      }
    }
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        scores[tone as EmotionalTone] += weight * 2;
        foundIndicators.push(phrase);
      }
    }
  }
  
  const sortedTones = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0);
  
  const primaryTone: EmotionalTone = sortedTones[0]?.[0] as EmotionalTone || "neutral";
  const secondaryTones = sortedTones.slice(1, 3).filter(([, s]) => s > 0.3).map(([t]) => t as EmotionalTone);
  
  const pattern = emotionalPatterns[primaryTone];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  
  return {
    primaryTone,
    secondaryTones,
    valence: pattern?.valence || 0,
    arousal: pattern?.arousal || 0.5,
    confidence: Math.min(1, sortedTones[0]?.[1] / totalScore || 0.5),
    indicators: [...new Set(foundIndicators)].slice(0, 8)
  };
}

export function analyzeThemes(text: string, previousEntries?: string[]): ThemeAnalysis {
  const lowerText = text.toLowerCase();
  const themeScores: Record<ThemeCategory, { score: number; keywords: string[] }> = {} as any;
  
  for (const theme of Object.keys(themePatterns) as ThemeCategory[]) {
    themeScores[theme] = { score: 0, keywords: [] };
  }
  
  for (const [theme, { keywords, phrases }] of Object.entries(themePatterns)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        themeScores[theme as ThemeCategory].score += 2;
        themeScores[theme as ThemeCategory].keywords.push(keyword);
      }
    }
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        themeScores[theme as ThemeCategory].score += 3;
        themeScores[theme as ThemeCategory].keywords.push(phrase);
      }
    }
  }
  
  const themes = Object.entries(themeScores)
    .filter(([, { score }]) => score >= 2)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 5)
    .map(([category, { score, keywords }]) => ({
      category: category as ThemeCategory,
      confidence: Math.min(1, score / 10),
      mentions: keywords.length,
      keywords: [...new Set(keywords)].slice(0, 5)
    }));
  
  const recurringPatterns: string[] = [];
  if (previousEntries?.length) {
    const allText = [text, ...previousEntries].join(" ").toLowerCase();
    for (const [theme, { keywords }] of Object.entries(themePatterns)) {
      let count = 0;
      for (const kw of keywords) {
        if (allText.split(kw).length - 1 >= 3) count++;
      }
      if (count >= 2) recurringPatterns.push(theme);
    }
  }
  
  return { themes, recurringPatterns };
}

export function analyzeCognitiveDistortions(text: string): DistortionAnalysis {
  const distortions: DistortionAnalysis["distortions"] = [];
  let totalScore = 0;
  
  for (const [type, { patterns, phrases, reframes }] of Object.entries(distortionPatterns)) {
    const evidence: string[] = [];
    let matches = 0;
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        evidence.push(match[0]);
        matches++;
      }
    }
    
    const lowerText = text.toLowerCase();
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        if (!evidence.some(e => e.toLowerCase().includes(phrase.toLowerCase()))) {
          evidence.push(phrase);
        }
        matches++;
      }
    }
    
    if (matches > 0) {
      const severity = matches >= 3 ? "significant" : matches >= 2 ? "moderate" : "mild";
      totalScore += severity === "significant" ? 15 : severity === "moderate" ? 10 : 5;
      
      distortions.push({
        type: type as CognitiveDistortion,
        severity,
        evidence: evidence.slice(0, 3),
        reframe: reframes[Math.floor(Math.random() * reframes.length)]
      });
    }
  }
  
  return {
    distortions: distortions.sort((a, b) => {
      const order = { significant: 3, moderate: 2, mild: 1 };
      return order[b.severity] - order[a.severity];
    }),
    totalDistortionScore: Math.min(100, totalScore)
  };
}

export function analyzeJournalEntry(text: string, previousEntries?: string[]): FullJournalAnalysis {
  const emotional = analyzeEmotionalTone(text);
  const themes = analyzeThemes(text, previousEntries);
  const distortions = analyzeCognitiveDistortions(text);
  
  const insights: JournalInsight[] = [];
  
  if (emotional.valence > 0.5) {
    insights.push({
      type: "positive",
      title: "Positive Emotional State",
      description: `You're experiencing ${emotional.primaryTone} feelings. Great job nurturing your wellbeing!`,
      actionable: "Note what contributed to these feelings to recreate them."
    });
  } else if (emotional.valence < -0.5) {
    insights.push({
      type: "concern",
      title: "Challenging Emotions",
      description: `You seem to be feeling ${emotional.primaryTone}. It's okay to feel this way.`,
      actionable: "Consider a grounding exercise or reaching out to someone."
    });
  }
  
  if (distortions.distortions.length > 0) {
    const top = distortions.distortions[0];
    insights.push({
      type: "suggestion",
      title: `Thought Pattern: ${top.type.replace("_", " ")}`,
      description: `Notice some ${top.type.replace("_", " ")} thinking.`,
      actionable: top.reframe
    });
  }
  
  let wellnessImpact = emotional.valence * 30;
  wellnessImpact -= distortions.totalDistortionScore * 0.3;
  if (themes.themes.some(t => ["achievement", "growth", "gratitude"].includes(t.category))) {
    wellnessImpact += 10;
  }
  
  return {
    emotional,
    themes,
    distortions,
    insights,
    wellnessImpact: Math.max(-50, Math.min(50, Math.round(wellnessImpact))),
    timestamp: new Date()
  };
}

export function getEmotionColor(tone: EmotionalTone): string {
  const colors: Record<EmotionalTone, string> = {
    positive: "#22c55e", hopeful: "#84cc16", grateful: "#10b981", content: "#14b8a6",
    neutral: "#6b7280", mixed: "#8b5cf6",
    anxious: "#a855f7", worried: "#d946ef", fearful: "#ec4899",
    sad: "#3b82f6", lonely: "#6366f1", hopeless: "#1e40af",
    angry: "#ef4444", frustrated: "#f97316", irritated: "#fb923c",
    stressed: "#eab308", overwhelmed: "#dc2626"
  };
  return colors[tone] || "#6b7280";
}

export function getDistortionLabel(type: CognitiveDistortion): string {
  const labels: Record<CognitiveDistortion, string> = {
    catastrophizing: "Catastrophizing",
    black_and_white: "All-or-Nothing",
    mind_reading: "Mind Reading",
    fortune_telling: "Fortune Telling",
    emotional_reasoning: "Emotional Reasoning",
    should_statements: "Should Statements",
    labeling: "Labeling",
    personalization: "Personalization",
    overgeneralization: "Overgeneralization",
    mental_filtering: "Mental Filtering",
    disqualifying_positive: "Disqualifying Positive",
    magnification: "Magnification"
  };
  return labels[type];
}





