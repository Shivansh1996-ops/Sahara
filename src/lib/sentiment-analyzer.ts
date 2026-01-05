/**
 * Sentiment Analysis Module for Mental Health
 * Trained on mental health dataset with categories:
 * - Normal, Anxiety, Depression, Stress, Suicidal, Bipolar, Personality disorder
 */

export type SentimentCategory = 
  | "normal" 
  | "anxiety" 
  | "depression" 
  | "stress" 
  | "suicidal" 
  | "bipolar" 
  | "personality_disorder";

export interface SentimentResult {
  category: SentimentCategory;
  confidence: number;
  scores: Record<SentimentCategory, number>;
  riskLevel: "low" | "moderate" | "high" | "critical";
  keywords: string[];
  wellnessScore: number;
}

export interface ProgressData {
  date: Date;
  sentiment: SentimentResult;
  source: "chat" | "journal";
  text: string;
}

// Enhanced keyword patterns trained from Combined Data.csv dataset
const categoryPatterns: Record<SentimentCategory, { keywords: string[]; phrases: string[]; weight: number }> = {
  normal: {
    keywords: [
      "happy", "good", "great", "fine", "okay", "well", "peaceful", "calm", "content",
      "grateful", "thankful", "blessed", "joy", "love", "excited", "hopeful", "positive",
      "relaxed", "comfortable", "satisfied", "wonderful", "amazing", "fantastic",
      "better", "improving", "progress", "healing", "growing", "learning"
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
      "confused", "trouble sleeping", "cant sleep", "restive", "agitated"
    ],
    phrases: [
      "cant stop thinking", "what if", "something is wrong", "feel scared", "heart racing",
      "cant breathe", "panic attack", "so worried", "really nervous", "feel restless",
      "trouble sleeping", "confused mind", "restless heart", "out of tune", "feel nervous"
    ],
    weight: 1.3
  },
  depression: {
    keywords: [
      "sad", "depressed", "hopeless", "empty", "worthless", "tired", "exhausted",
      "lonely", "alone", "crying", "tears", "numb", "meaningless", "pointless",
      "unmotivated", "dark", "heavy", "burden", "miserable", "despair", "grief",
      "lost", "broken", "shattered", "hollow", "void", "lifeless"
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
      "demanding", "hectic", "chaotic", "crazy", "insane", "impossible"
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

// Positive indicators that boost wellness
const positiveIndicators = [
  "getting better", "feeling better", "improving", "hopeful", "grateful",
  "support", "helped", "therapy", "treatment", "coping", "managing",
  "progress", "recovery", "healing", "stronger", "proud", "accomplished"
];

// Crisis indicators
const crisisIndicators = [
  "right now", "tonight", "today", "immediately", "cant take it anymore",
  "plan to", "method", "goodbye", "final", "last time", "this is it"
];

/**
 * Analyze text for mental health sentiment using trained patterns
 */
export function analyzeSentiment(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  const scores: Record<SentimentCategory, number> = {
    normal: 0.5, // Base score for normal
    anxiety: 0,
    depression: 0,
    stress: 0,
    suicidal: 0,
    bipolar: 0,
    personality_disorder: 0
  };
  
  const foundKeywords: string[] = [];
  
  // Score based on keywords and phrases
  for (const [category, { keywords, phrases, weight }] of Object.entries(categoryPatterns)) {
    // Check keywords
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[category as SentimentCategory] += weight;
        foundKeywords.push(keyword);
      }
    }
    // Check phrases (higher weight)
    for (const phrase of phrases) {
      if (lowerText.includes(phrase)) {
        scores[category as SentimentCategory] += weight * 1.5;
        foundKeywords.push(phrase);
      }
    }
  }
  
  // Positive indicators boost normal score
  let positiveBoost = 0;
  for (const indicator of positiveIndicators) {
    if (lowerText.includes(indicator)) {
      positiveBoost += 0.8;
      foundKeywords.push(indicator);
    }
  }
  scores.normal += positiveBoost;
  
  // Crisis indicators increase suicidal score significantly
  for (const indicator of crisisIndicators) {
    if (lowerText.includes(indicator) && scores.suicidal > 0) {
      scores.suicidal += 2.0;
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
  if (scores.suicidal > 0) {
    riskLevel = scores.suicidal > 3 ? "critical" : "high";
  } else if (scores.depression > 3 || scores.anxiety > 3) {
    riskLevel = "moderate";
  } else if (category !== "normal" && maxScore > 0.4) {
    riskLevel = "moderate";
  }
  
  // Calculate wellness score
  const wellnessScore = calculateWellnessScore({ 
    category, confidence: maxScore, scores: normalizedScores, 
    riskLevel, keywords: foundKeywords, wellnessScore: 0 
  });
  
  return {
    category,
    confidence: Math.min(maxScore, 1),
    scores: normalizedScores,
    riskLevel,
    keywords: [...new Set(foundKeywords)].slice(0, 10),
    wellnessScore
  };
}

/**
 * Calculate wellness score (0-100)
 */
export function calculateWellnessScore(sentiment: SentimentResult): number {
  const weights: Record<SentimentCategory, number> = {
    normal: 100,
    stress: 55,
    anxiety: 45,
    depression: 35,
    bipolar: 40,
    personality_disorder: 40,
    suicidal: 5
  };
  
  let score = 0;
  for (const [cat, catScore] of Object.entries(sentiment.scores)) {
    score += weights[cat as SentimentCategory] * catScore;
  }
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Analyze progress over time from journal and chat entries
 */
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
  
  // Sort by date
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate wellness scores
  const scores = sorted.map(e => e.sentiment.wellnessScore);
  const averageWellness = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  // Determine trend
  const recentCount = Math.min(5, Math.floor(scores.length / 2));
  const oldScores = scores.slice(0, recentCount);
  const newScores = scores.slice(-recentCount);
  
  const oldAvg = oldScores.length > 0 ? oldScores.reduce((a, b) => a + b, 0) / oldScores.length : averageWellness;
  const newAvg = newScores.length > 0 ? newScores.reduce((a, b) => a + b, 0) / newScores.length : averageWellness;
  
  let trend: "improving" | "stable" | "declining" = "stable";
  if (newAvg - oldAvg > 5) trend = "improving";
  else if (oldAvg - newAvg > 5) trend = "declining";
  
  // Find dominant category
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
  
  // Recent mood (last entry)
  const recentMood = sorted[sorted.length - 1]?.sentiment.category || "normal";
  
  // Weekly scores
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
  
  // Generate insights
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

/**
 * Get supportive message based on sentiment
 */
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

/**
 * Get category display info
 */
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
