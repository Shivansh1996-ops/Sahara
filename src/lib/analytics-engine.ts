/**
 * Sahara Analytics Engine
 * 
 * Implements enterprise-grade analytics algorithms for mental wellness tracking:
 * - Sentiment Trajectory Analysis
 * - Behavioural Drift Detection
 * - Engagement Health Index (EHI)
 * - Emotional Keyword Frequency Analysis
 * - Early Risk Signal Detection (Non-Clinical)
 * - Pet Bond Level Calculation
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SentimentDataPoint {
  date: Date;
  sessionId: string;
  sentimentScore: number; // -1 to 1
  messageCount: number;
  dominantEmotion: string;
}

export interface SentimentTrajectory {
  dataPoints: SentimentDataPoint[];
  trend: "improving" | "stable" | "declining";
  slope: number;
  confidence: number;
  averageSentiment: number;
}

export interface BehaviouralBaseline {
  avgSessionFrequency: number; // sessions per week
  avgResponseLength: number; // characters
  avgSessionGap: number; // hours between sessions
  avgMessagesPerSession: number;
}

export interface BehaviouralDrift {
  frequencyChange: number; // percentage
  responseLengthChange: number; // percentage
  sessionGapChange: number; // percentage
  isSignificant: boolean;
  direction: "positive" | "neutral" | "concerning";
  signals: string[];
}

export interface EngagementHealthIndex {
  overallScore: number; // 0-100
  consistencyScore: number; // 0-100
  depthScore: number; // 0-100
  sentimentStabilityScore: number; // 0-100
  interactionQualityScore: number; // 0-100
  trend: "improving" | "stable" | "declining";
}

export interface EmotionalKeywordAnalysis {
  keywords: { word: string; count: number; trend: "up" | "down" | "stable" }[];
  dominantCategory: string;
  spikes: { keyword: string; date: Date; magnitude: number }[];
}

export interface RiskSignal {
  type: "burnout" | "emotional_overload" | "disengagement" | "crisis_indicator";
  severity: "low" | "moderate" | "elevated";
  indicators: string[];
  suggestedAction: string;
  detectedAt: Date;
}

export interface PetBondMetrics {
  bondLevel: number; // 0-100
  sessionCount: number;
  consistencyBonus: number;
  emotionalOpennessBonus: number;
  positiveMomentsBonus: number;
}

export interface SessionData {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  userMessages: string[];
  sentimentScores: number[];
  emotionalKeywords: string[];
}

// ============================================================================
// 1. SENTIMENT TRAJECTORY ANALYSIS
// ============================================================================

/**
 * Analyze sentiment trajectory over time
 * Detects gradual emotional change, not single-message mood
 */
export function analyzeSentimentTrajectory(
  sessions: SessionData[],
  windowSize: number = 7
): SentimentTrajectory {
  if (sessions.length === 0) {
    return {
      dataPoints: [],
      trend: "stable",
      slope: 0,
      confidence: 0,
      averageSentiment: 0
    };
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );

  // Calculate sentiment per session
  const dataPoints: SentimentDataPoint[] = sortedSessions.map(session => {
    const avgSentiment = session.sentimentScores.length > 0
      ? session.sentimentScores.reduce((a, b) => a + b, 0) / session.sentimentScores.length
      : 0;
    
    return {
      date: session.startedAt,
      sessionId: session.id,
      sentimentScore: avgSentiment,
      messageCount: session.messageCount,
      dominantEmotion: getMostFrequent(session.emotionalKeywords) || "neutral"
    };
  });

  // Apply rolling window for smoothing
  const windowedScores = applyRollingWindow(
    dataPoints.map(d => d.sentimentScore),
    Math.min(windowSize, dataPoints.length)
  );

  // Calculate slope using linear regression
  const { slope, confidence } = calculateLinearRegression(windowedScores);

  // Determine trend
  let trend: "improving" | "stable" | "declining" = "stable";
  if (slope > 0.05 && confidence > 0.5) {
    trend = "improving";
  } else if (slope < -0.05 && confidence > 0.5) {
    trend = "declining";
  }

  // Calculate average sentiment
  const averageSentiment = dataPoints.length > 0
    ? dataPoints.reduce((sum, d) => sum + d.sentimentScore, 0) / dataPoints.length
    : 0;

  return {
    dataPoints,
    trend,
    slope,
    confidence,
    averageSentiment
  };
}

// ============================================================================
// 2. BEHAVIOURAL DRIFT DETECTION
// ============================================================================

/**
 * Detect subtle disengagement or emotional withdrawal
 * Compares recent behavior against established baseline
 */
export function detectBehaviouralDrift(
  sessions: SessionData[],
  baselineSessionCount: number = 5
): BehaviouralDrift {
  if (sessions.length < baselineSessionCount + 2) {
    return {
      frequencyChange: 0,
      responseLengthChange: 0,
      sessionGapChange: 0,
      isSignificant: false,
      direction: "neutral",
      signals: []
    };
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );

  // Establish baseline from first N sessions
  const baselineSessions = sortedSessions.slice(0, baselineSessionCount);
  const baseline = calculateBaseline(baselineSessions);

  // Calculate recent metrics (last N sessions)
  const recentSessions = sortedSessions.slice(-baselineSessionCount);
  const recent = calculateBaseline(recentSessions);

  // Calculate percentage changes
  const frequencyChange = calculatePercentageChange(
    baseline.avgSessionFrequency,
    recent.avgSessionFrequency
  );
  const responseLengthChange = calculatePercentageChange(
    baseline.avgResponseLength,
    recent.avgResponseLength
  );
  const sessionGapChange = calculatePercentageChange(
    baseline.avgSessionGap,
    recent.avgSessionGap
  );

  // Detect signals
  const signals: string[] = [];
  const THRESHOLD = 30; // 30% deviation is significant

  if (frequencyChange < -THRESHOLD) {
    signals.push("Reduced session frequency");
  }
  if (responseLengthChange < -THRESHOLD) {
    signals.push("Shorter responses");
  }
  if (sessionGapChange > THRESHOLD) {
    signals.push("Longer gaps between sessions");
  }

  // Determine if drift is significant
  const isSignificant = signals.length >= 2 || 
    Math.abs(frequencyChange) > 50 ||
    Math.abs(responseLengthChange) > 50;

  // Determine direction
  let direction: "positive" | "neutral" | "concerning" = "neutral";
  if (frequencyChange > 20 && responseLengthChange > 10) {
    direction = "positive";
  } else if (signals.length >= 2) {
    direction = "concerning";
  }

  return {
    frequencyChange,
    responseLengthChange,
    sessionGapChange,
    isSignificant,
    direction,
    signals
  };
}

function calculateBaseline(sessions: SessionData[]): BehaviouralBaseline {
  if (sessions.length === 0) {
    return {
      avgSessionFrequency: 0,
      avgResponseLength: 0,
      avgSessionGap: 0,
      avgMessagesPerSession: 0
    };
  }

  // Calculate session frequency (sessions per week)
  const firstDate = sessions[0].startedAt;
  const lastDate = sessions[sessions.length - 1].startedAt;
  const weeksDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const avgSessionFrequency = sessions.length / weeksDiff;

  // Calculate average response length
  const allMessages = sessions.flatMap(s => s.userMessages);
  const avgResponseLength = allMessages.length > 0
    ? allMessages.reduce((sum, msg) => sum + msg.length, 0) / allMessages.length
    : 0;

  // Calculate average session gap (hours)
  let totalGap = 0;
  for (let i = 1; i < sessions.length; i++) {
    totalGap += (sessions[i].startedAt.getTime() - sessions[i - 1].startedAt.getTime()) / (60 * 60 * 1000);
  }
  const avgSessionGap = sessions.length > 1 ? totalGap / (sessions.length - 1) : 0;

  // Calculate average messages per session
  const avgMessagesPerSession = sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length;

  return {
    avgSessionFrequency,
    avgResponseLength,
    avgSessionGap,
    avgMessagesPerSession
  };
}

// ============================================================================
// 3. ENGAGEMENT HEALTH INDEX (EHI)
// ============================================================================

/**
 * Calculate composite engagement health score
 * Formula: EHI = (0.3 * consistency) + (0.3 * depth) + (0.2 * sentiment_stability) + (0.2 * interaction_quality)
 */
export function calculateEngagementHealthIndex(
  sessions: SessionData[],
  expectedSessionsPerWeek: number = 3
): EngagementHealthIndex {
  if (sessions.length === 0) {
    return {
      overallScore: 50,
      consistencyScore: 50,
      depthScore: 50,
      sentimentStabilityScore: 50,
      interactionQualityScore: 50,
      trend: "stable"
    };
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );

  // 1. Consistency Score (0-100)
  // Based on regularity of sessions
  const consistencyScore = calculateConsistencyScore(sortedSessions, expectedSessionsPerWeek);

  // 2. Depth Score (0-100)
  // Based on message length and session duration
  const depthScore = calculateDepthScore(sortedSessions);

  // 3. Sentiment Stability Score (0-100)
  // Based on variance in sentiment scores
  const sentimentStabilityScore = calculateSentimentStabilityScore(sortedSessions);

  // 4. Interaction Quality Score (0-100)
  // Based on response latency and engagement patterns
  const interactionQualityScore = calculateInteractionQualityScore(sortedSessions);

  // Calculate overall score using weighted formula
  const overallScore = Math.round(
    (0.3 * consistencyScore) +
    (0.3 * depthScore) +
    (0.2 * sentimentStabilityScore) +
    (0.2 * interactionQualityScore)
  );

  // Determine trend by comparing recent vs older scores
  const midpoint = Math.floor(sortedSessions.length / 2);
  const olderSessions = sortedSessions.slice(0, midpoint);
  const recentSessions = sortedSessions.slice(midpoint);

  let trend: "improving" | "stable" | "declining" = "stable";
  if (olderSessions.length > 0 && recentSessions.length > 0) {
    const olderDepth = calculateDepthScore(olderSessions);
    const recentDepth = calculateDepthScore(recentSessions);
    
    if (recentDepth - olderDepth > 10) {
      trend = "improving";
    } else if (olderDepth - recentDepth > 10) {
      trend = "declining";
    }
  }

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    consistencyScore: Math.max(0, Math.min(100, consistencyScore)),
    depthScore: Math.max(0, Math.min(100, depthScore)),
    sentimentStabilityScore: Math.max(0, Math.min(100, sentimentStabilityScore)),
    interactionQualityScore: Math.max(0, Math.min(100, interactionQualityScore)),
    trend
  };
}

function calculateConsistencyScore(sessions: SessionData[], expectedPerWeek: number): number {
  if (sessions.length < 2) return 50;

  const firstDate = sessions[0].startedAt;
  const lastDate = sessions[sessions.length - 1].startedAt;
  const weeksDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  const actualPerWeek = sessions.length / weeksDiff;
  const ratio = actualPerWeek / expectedPerWeek;
  
  // Score based on how close to expected frequency
  // 100 if meeting or exceeding, decreases as ratio drops
  return Math.min(100, Math.round(ratio * 100));
}

function calculateDepthScore(sessions: SessionData[]): number {
  if (sessions.length === 0) return 50;

  // Average message count per session (target: 5+ messages = 100)
  const avgMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length;
  const messageScore = Math.min(100, (avgMessages / 5) * 100);

  // Average message length (target: 100+ chars = 100)
  const allMessages = sessions.flatMap(s => s.userMessages);
  const avgLength = allMessages.length > 0
    ? allMessages.reduce((sum, msg) => sum + msg.length, 0) / allMessages.length
    : 0;
  const lengthScore = Math.min(100, (avgLength / 100) * 100);

  return Math.round((messageScore + lengthScore) / 2);
}

function calculateSentimentStabilityScore(sessions: SessionData[]): number {
  const allScores = sessions.flatMap(s => s.sentimentScores);
  if (allScores.length < 2) return 75;

  // Calculate variance
  const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
  
  // Lower variance = higher stability score
  // Variance of 0 = 100, variance of 1 = 0
  return Math.max(0, Math.round(100 - (variance * 100)));
}

function calculateInteractionQualityScore(sessions: SessionData[]): number {
  if (sessions.length === 0) return 50;

  // Based on emotional keyword diversity and positive moments
  const allKeywords = sessions.flatMap(s => s.emotionalKeywords);
  const uniqueKeywords = new Set(allKeywords);
  
  // More diverse emotional expression = higher quality
  const diversityScore = Math.min(100, uniqueKeywords.size * 10);

  // Positive sentiment ratio
  const allScores = sessions.flatMap(s => s.sentimentScores);
  const positiveRatio = allScores.filter(s => s > 0).length / Math.max(1, allScores.length);
  const positivityScore = positiveRatio * 100;

  return Math.round((diversityScore + positivityScore) / 2);
}

// ============================================================================
// 4. EMOTIONAL KEYWORD FREQUENCY ANALYSIS
// ============================================================================

/**
 * Track dominant emotional themes and detect spikes
 */
export function analyzeEmotionalKeywords(
  sessions: SessionData[],
  windowSize: number = 7
): EmotionalKeywordAnalysis {
  if (sessions.length === 0) {
    return {
      keywords: [],
      dominantCategory: "neutral",
      spikes: []
    };
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );

  // Count keyword frequencies
  const keywordCounts: Record<string, number> = {};
  const keywordBySession: Record<string, number[]> = {};

  sortedSessions.forEach((session, idx) => {
    session.emotionalKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      if (!keywordBySession[keyword]) {
        keywordBySession[keyword] = new Array(sortedSessions.length).fill(0);
      }
      keywordBySession[keyword][idx]++;
    });
  });

  // Calculate trends for each keyword
  const keywords = Object.entries(keywordCounts)
    .map(([word, count]) => {
      const sessionCounts = keywordBySession[word] || [];
      const trend = calculateKeywordTrend(sessionCounts);
      return { word, count, trend };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Determine dominant category
  const emotionCategories: Record<string, string[]> = {
    stress: ["stressed", "overwhelmed", "pressure", "anxious", "worried"],
    anxiety: ["anxious", "nervous", "panic", "fear", "scared"],
    fatigue: ["tired", "exhausted", "drained", "burnt out", "fatigued"],
    hope: ["hopeful", "optimistic", "positive", "better", "improving"],
    motivation: ["motivated", "determined", "focused", "energized", "ready"],
    calm: ["calm", "peaceful", "relaxed", "content", "serene"]
  };

  let dominantCategory = "neutral";
  let maxCategoryCount = 0;

  for (const [category, categoryKeywords] of Object.entries(emotionCategories)) {
    const count = keywords
      .filter(k => categoryKeywords.some(ck => k.word.includes(ck)))
      .reduce((sum, k) => sum + k.count, 0);
    
    if (count > maxCategoryCount) {
      maxCategoryCount = count;
      dominantCategory = category;
    }
  }

  // Detect spikes (sudden increases in keyword frequency)
  const spikes: { keyword: string; date: Date; magnitude: number }[] = [];
  
  for (const [keyword, sessionCounts] of Object.entries(keywordBySession)) {
    for (let i = windowSize; i < sessionCounts.length; i++) {
      const windowAvg = sessionCounts.slice(i - windowSize, i).reduce((a, b) => a + b, 0) / windowSize;
      const current = sessionCounts[i];
      
      if (windowAvg > 0 && current > windowAvg * 2) {
        spikes.push({
          keyword,
          date: sortedSessions[i].startedAt,
          magnitude: current / windowAvg
        });
      }
    }
  }

  return {
    keywords,
    dominantCategory,
    spikes: spikes.slice(0, 5)
  };
}

function calculateKeywordTrend(sessionCounts: number[]): "up" | "down" | "stable" {
  if (sessionCounts.length < 3) return "stable";

  const midpoint = Math.floor(sessionCounts.length / 2);
  const firstHalf = sessionCounts.slice(0, midpoint);
  const secondHalf = sessionCounts.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  if (secondAvg > firstAvg * 1.3) return "up";
  if (secondAvg < firstAvg * 0.7) return "down";
  return "stable";
}

// ============================================================================
// 5. EARLY RISK SIGNAL DETECTION (NON-CLINICAL)
// ============================================================================

/**
 * Detect early warning signs - NOT diagnoses
 * Combines multiple signals for risk assessment
 */
export function detectRiskSignals(
  sessions: SessionData[],
  sentimentTrajectory: SentimentTrajectory,
  behaviouralDrift: BehaviouralDrift,
  keywordAnalysis: EmotionalKeywordAnalysis
): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const now = new Date();

  // 1. Check for declining sentiment trajectory
  if (sentimentTrajectory.trend === "declining" && sentimentTrajectory.confidence > 0.6) {
    signals.push({
      type: "emotional_overload",
      severity: sentimentTrajectory.slope < -0.1 ? "elevated" : "moderate",
      indicators: [
        "Sentiment has been declining over recent sessions",
        `Average sentiment: ${sentimentTrajectory.averageSentiment.toFixed(2)}`
      ],
      suggestedAction: "Consider a grounding exercise or reaching out to someone you trust.",
      detectedAt: now
    });
  }

  // 2. Check for behavioural drift
  if (behaviouralDrift.isSignificant && behaviouralDrift.direction === "concerning") {
    signals.push({
      type: "disengagement",
      severity: behaviouralDrift.signals.length >= 3 ? "elevated" : "moderate",
      indicators: behaviouralDrift.signals,
      suggestedAction: "It's okay to take breaks. When you're ready, I'm here.",
      detectedAt: now
    });
  }

  // 3. Check for negative emotion dominance
  const negativeCategories = ["stress", "anxiety", "fatigue"];
  if (negativeCategories.includes(keywordAnalysis.dominantCategory)) {
    const negativeKeywords = keywordAnalysis.keywords
      .filter(k => k.trend === "up")
      .map(k => k.word);

    if (negativeKeywords.length >= 2) {
      signals.push({
        type: "burnout",
        severity: negativeKeywords.length >= 4 ? "elevated" : "low",
        indicators: [
          `Dominant emotional theme: ${keywordAnalysis.dominantCategory}`,
          `Rising keywords: ${negativeKeywords.join(", ")}`
        ],
        suggestedAction: "You've been carrying a lot. Consider taking some time for self-care.",
        detectedAt: now
      });
    }
  }

  // 4. Check for crisis indicators in recent sessions
  const recentSessions = sessions.slice(-3);
  const crisisKeywords = ["hopeless", "worthless", "give up", "can't go on", "end it"];
  
  for (const session of recentSessions) {
    const hasCrisisIndicator = session.emotionalKeywords.some(k =>
      crisisKeywords.some(ck => k.toLowerCase().includes(ck))
    );

    if (hasCrisisIndicator) {
      signals.push({
        type: "crisis_indicator",
        severity: "elevated",
        indicators: ["Recent messages contain concerning language"],
        suggestedAction: "Please consider reaching out to a crisis helpline. You don't have to face this alone.",
        detectedAt: now
      });
      break;
    }
  }

  return signals;
}

// ============================================================================
// 6. PET BOND LEVEL CALCULATION
// ============================================================================

/**
 * Calculate pet bond level based on engagement metrics
 * Reinforces emotional continuity and motivation
 */
export function calculatePetBondLevel(
  sessions: SessionData[],
  currentBondLevel: number = 0
): PetBondMetrics {
  const sessionCount = sessions.length;
  
  // Base bond from session count (max 40 points)
  const sessionBonus = Math.min(40, sessionCount * 2);

  // Consistency bonus (max 20 points)
  // Based on regular engagement
  let consistencyBonus = 0;
  if (sessions.length >= 2) {
    const sortedSessions = [...sessions].sort(
      (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
    );
    
    let streakDays = 0;
    for (let i = 1; i < sortedSessions.length; i++) {
      const daysDiff = (sortedSessions[i].startedAt.getTime() - sortedSessions[i - 1].startedAt.getTime()) / (24 * 60 * 60 * 1000);
      if (daysDiff <= 2) {
        streakDays++;
      }
    }
    consistencyBonus = Math.min(20, streakDays * 2);
  }

  // Emotional openness bonus (max 20 points)
  // Based on variety of emotions expressed
  const allKeywords = sessions.flatMap(s => s.emotionalKeywords);
  const uniqueEmotions = new Set(allKeywords);
  const emotionalOpennessBonus = Math.min(20, uniqueEmotions.size * 2);

  // Positive moments bonus (max 20 points)
  // Based on positive sentiment instances
  const allScores = sessions.flatMap(s => s.sentimentScores);
  const positiveCount = allScores.filter(s => s > 0.3).length;
  const positiveMomentsBonus = Math.min(20, positiveCount * 2);

  // Calculate total bond level
  const calculatedBond = sessionBonus + consistencyBonus + emotionalOpennessBonus + positiveMomentsBonus;
  
  // Bond level can only increase (never decrease)
  const bondLevel = Math.max(currentBondLevel, Math.min(100, calculatedBond));

  return {
    bondLevel,
    sessionCount,
    consistencyBonus,
    emotionalOpennessBonus,
    positiveMomentsBonus
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyRollingWindow(values: number[], windowSize: number): number[] {
  if (values.length <= windowSize) return values;

  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    result.push(avg);
  }
  return result;
}

function calculateLinearRegression(values: number[]): { slope: number; confidence: number } {
  if (values.length < 2) {
    return { slope: 0, confidence: 0 };
  }

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared for confidence
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssRes += Math.pow(values[i] - predicted, 2);
    ssTot += Math.pow(values[i] - yMean, 2);
  }

  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  return {
    slope,
    confidence: Math.max(0, Math.min(1, rSquared))
  };
}

function calculatePercentageChange(baseline: number, current: number): number {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return ((current - baseline) / baseline) * 100;
}

function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;

  const counts: Record<string, number> = {};
  let maxCount = 0;
  let mostFrequent = arr[0];

  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      mostFrequent = item;
    }
  }

  return mostFrequent;
}

// ============================================================================
// COMPREHENSIVE DASHBOARD DATA
// ============================================================================

export interface ComprehensiveDashboardData {
  sentimentTrajectory: SentimentTrajectory;
  behaviouralDrift: BehaviouralDrift;
  engagementHealth: EngagementHealthIndex;
  emotionalKeywords: EmotionalKeywordAnalysis;
  riskSignals: RiskSignal[];
  petBond: PetBondMetrics;
  summary: {
    overallWellness: number;
    trend: "improving" | "stable" | "declining";
    primaryConcern: string | null;
    positiveHighlight: string | null;
  };
}

/**
 * Generate comprehensive dashboard data from sessions
 */
export function generateDashboardData(
  sessions: SessionData[],
  currentBondLevel: number = 0
): ComprehensiveDashboardData {
  const sentimentTrajectory = analyzeSentimentTrajectory(sessions);
  const behaviouralDrift = detectBehaviouralDrift(sessions);
  const engagementHealth = calculateEngagementHealthIndex(sessions);
  const emotionalKeywords = analyzeEmotionalKeywords(sessions);
  const riskSignals = detectRiskSignals(sessions, sentimentTrajectory, behaviouralDrift, emotionalKeywords);
  const petBond = calculatePetBondLevel(sessions, currentBondLevel);

  // Generate summary
  const overallWellness = Math.round(
    (engagementHealth.overallScore + (sentimentTrajectory.averageSentiment + 1) * 50) / 2
  );

  let trend: "improving" | "stable" | "declining" = "stable";
  if (sentimentTrajectory.trend === "improving" && engagementHealth.trend === "improving") {
    trend = "improving";
  } else if (sentimentTrajectory.trend === "declining" || engagementHealth.trend === "declining") {
    trend = "declining";
  }

  const primaryConcern = riskSignals.length > 0 
    ? riskSignals[0].suggestedAction 
    : null;

  const positiveHighlight = sentimentTrajectory.trend === "improving"
    ? "Your emotional wellbeing is trending upward!"
    : petBond.bondLevel > 50
    ? `Your bond with your companion is growing stronger!`
    : null;

  return {
    sentimentTrajectory,
    behaviouralDrift,
    engagementHealth,
    emotionalKeywords,
    riskSignals,
    petBond,
    summary: {
      overallWellness,
      trend,
      primaryConcern,
      positiveHighlight
    }
  };
}
