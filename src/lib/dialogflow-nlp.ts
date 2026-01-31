/**
 * Sahara – Dialogflow & NLP integration
 *
 * Uses Google Dialogflow ES/CX for intent detection and optional fulfillment text.
 * Supports the "chirag" agent for crisis detection and therapeutic responses.
 * Local sentiment (unified-ai) is always used for crisis detection and fallback.
 */

import type { TherapeuticApproach } from "@/lib/unified-ai";

export interface DialogflowConfig {
  projectId: string;
  /** Agent ID for Dialogflow CX, or empty for ES. */
  agentId?: string;
  /** Optional: path to service account JSON. Defaults to GOOGLE_APPLICATION_CREDENTIALS. */
  keyFilename?: string;
  /** Language for detectIntent (e.g. "en-US"). */
  languageCode?: string;
  /** Agent name (e.g. "chirag") for logging. */
  agentName?: string;
}

export interface DialogflowResult {
  /** Matched intent display name (e.g. "anxiety", "crisis", "Default Fallback Intent"). */
  intent: string;
  /** 0–1. */
  confidence: number;
  /** Response text from the agent, if any. */
  fulfillmentText: string | null;
  /** Extracted parameters from the intent. */
  parameters: Record<string, unknown>;
  /** Whether Dialogflow returned a usable result (not fallback or low confidence). */
  hasFulfillment: boolean;
}

/** Maps Dialogflow intent display names to Sahara therapeutic approaches. */
const INTENT_TO_APPROACH: Record<string, TherapeuticApproach> = {
  anxiety: "grounding",
  depression: "validation",
  stress: "grounding",
  crisis: "crisis_support",
  suicidal: "crisis_support",
  validation: "validation",
  exploration: "exploration",
  encouragement: "encouragement",
  comfort: "comfort",
  reflection: "reflection",
  grounding: "grounding",
};

const FALLBACK_INTENT_NAMES = ["Default Fallback Intent", "default"];

function getConfig(): DialogflowConfig | null {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  if (!projectId?.trim()) return null;
  return {
    projectId: projectId.trim(),
    agentId: process.env.DIALOGFLOW_AGENT_ID || undefined,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    languageCode: process.env.DIALOGFLOW_LANGUAGE_CODE || "en-US",
    agentName: process.env.DIALOGFLOW_AGENT_NAME || "chirag",
  };
}

/**
 * Get the configured agent name (for logging/display).
 */
export function getAgentName(): string {
  return process.env.DIALOGFLOW_AGENT_NAME || "chirag";
}

/**
 * Returns true if Dialogflow is configured and can be used.
 */
export function isDialogflowEnabled(): boolean {
  return getConfig() !== null;
}

/**
 * Detects intent and optional fulfillment from Dialogflow for the given user message.
 * Use the same sessionId for a conversation to keep context.
 */
export async function detectIntent(
  text: string,
  sessionId: string
): Promise<DialogflowResult | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const { SessionsClient } = await import("@google-cloud/dialogflow");
    const client = new SessionsClient(
      config.keyFilename ? { keyFilename: config.keyFilename } : undefined
    );
    const sessionPath = client.projectAgentSessionPath(
      config.projectId,
      sessionId
    );
    const [response] = await client.detectIntent({
      session: sessionPath,
      queryInput: {
        text: {
          text: text.slice(0, 256),
          languageCode: config.languageCode,
        },
      },
    });

    const queryResult = response?.queryResult;
    if (!queryResult) return null;

    const intentName = queryResult.intent?.displayName ?? "";
    const confidence = queryResult.intentDetectionConfidence ?? 0;
    const fulfillmentText =
      queryResult.fulfillmentText?.trim() || null;
    const parameters: Record<string, unknown> = {};
    if (queryResult.parameters?.fields) {
      for (const [k, v] of Object.entries(queryResult.parameters.fields)) {
        const val = (v as { stringValue?: string; numberValue?: number })?.stringValue
          ?? (v as { numberValue?: number })?.numberValue;
        if (val !== undefined) parameters[k] = val;
      }
    }

    const isFallback = FALLBACK_INTENT_NAMES.some(
      (name) => intentName.toLowerCase().includes(name.toLowerCase())
    );
    const hasFulfillment =
      !isFallback &&
      confidence >= 0.5 &&
      (fulfillmentText?.length ?? 0) > 0;

    return {
      intent: intentName,
      confidence,
      fulfillmentText,
      parameters,
      hasFulfillment,
    };
  } catch (err) {
    console.error("[dialogflow-nlp] detectIntent error:", err);
    return null;
  }
}

/**
 * Maps a Dialogflow intent display name to a Sahara TherapeuticApproach.
 */
export function mapIntentToApproach(intentDisplayName: string): TherapeuticApproach | null {
  const key = intentDisplayName.toLowerCase().replace(/\s+/g, "_");
  if (INTENT_TO_APPROACH[key]) return INTENT_TO_APPROACH[key];
  for (const [name, approach] of Object.entries(INTENT_TO_APPROACH)) {
    if (key.includes(name)) return approach;
  }
  return null;
}
