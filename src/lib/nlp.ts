/**
 * Sahara – Local NLP integration (always on)
 *
 * Single entry point for natural language processing: sentiment, emotions,
 * themes, crisis detection, and wellness scoring. Uses unified-ai under the hood.
 * No external APIs required.
 */

import {
  analyzeMessage,
  type SentimentResult,
  type SentimentCategory,
  type EmotionalAnalysis,
} from "@/lib/unified-ai";

export type { SentimentResult, SentimentCategory, EmotionalAnalysis };

/** Full NLP analysis of user text: sentiment, emotions, themes, risk, wellness. */
export function analyze(text: string): SentimentResult {
  return analyzeMessage(text);
}

/** Whether the text indicates crisis / self-harm intent. Always prefer this for safety. */
export function detectCrisis(text: string): boolean {
  const result = analyzeMessage(text);
  return result.riskLevel === "critical" || result.emotionalAnalysis.isCrisis;
}

/** Wellness score 0–100 from the message. */
export function getWellnessScore(text: string): number {
  return analyzeMessage(text).wellnessScore;
}

/** Top emotional keywords/phrases detected in the message. */
export function extractKeywords(text: string): string[] {
  return analyzeMessage(text).keywords;
}

/** Detected themes (e.g. relationships, work, health). */
export function extractThemes(text: string): string[] {
  return analyzeMessage(text).emotionalAnalysis.themes;
}

/** Dominant emotion label (e.g. sadness, anxiety, happiness). */
export function getDominantEmotion(text: string): string {
  return analyzeMessage(text).emotionalAnalysis.dominantEmotion;
}

/** Primary sentiment category (normal, anxiety, depression, stress, etc.). */
export function getCategory(text: string): SentimentCategory {
  return analyzeMessage(text).category;
}

/** Risk level: low, moderate, high, critical. */
export function getRiskLevel(text: string): SentimentResult["riskLevel"] {
  return analyzeMessage(text).riskLevel;
}
