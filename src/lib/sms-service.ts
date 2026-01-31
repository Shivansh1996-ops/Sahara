/**
 * Sahara SMS Notification Service
 * 
 * Sends SMS notifications for crisis alerts and important updates.
 * Supports Twilio as the SMS provider.
 */

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  toNumber: string;
}

export interface SMSMessage {
  to?: string;
  body: string;
  type: "crisis_alert" | "wellness_update" | "reminder" | "notification";
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get SMS configuration from environment variables
 */
function getConfig(): SMSConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const toNumber = process.env.ALERT_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    return null;
  }

  return {
    accountSid,
    authToken,
    fromNumber,
    toNumber,
  };
}

/**
 * Check if SMS service is enabled
 */
export function isSMSEnabled(): boolean {
  return getConfig() !== null;
}

/**
 * Send an SMS message
 */
export async function sendSMS(message: SMSMessage): Promise<SMSResult> {
  const config = getConfig();
  
  if (!config) {
    console.warn("[sms-service] SMS not configured. Set TWILIO_* and ALERT_PHONE_NUMBER env vars.");
    return { success: false, error: "SMS not configured" };
  }

  try {
    // Dynamic import to avoid issues if twilio is not installed
    const twilio = await import("twilio");
    const client = twilio.default(config.accountSid, config.authToken);

    const toNumber = message.to || config.toNumber;
    
    const result = await client.messages.create({
      body: message.body,
      from: config.fromNumber,
      to: toNumber,
    });

    console.log(`[sms-service] SMS sent: ${result.sid} to ${toNumber}`);
    
    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error("[sms-service] Failed to send SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a crisis alert SMS
 */
export async function sendCrisisAlert(params: {
  userId?: string;
  userName?: string;
  message: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
}): Promise<SMSResult> {
  const { userId, userName, message, riskLevel } = params;
  
  const alertBody = `🚨 SAHARA CRISIS ALERT

User: ${userName || userId || "Anonymous"}
Risk Level: ${riskLevel.toUpperCase()}

Message: "${message.slice(0, 200)}${message.length > 200 ? "..." : ""}"

Please check on this user immediately.

Time: ${new Date().toLocaleString()}`;

  return sendSMS({
    body: alertBody,
    type: "crisis_alert",
    userId,
    metadata: { riskLevel, originalMessage: message },
  });
}

/**
 * Send a wellness update SMS
 */
export async function sendWellnessUpdate(params: {
  userId?: string;
  userName?: string;
  wellnessScore: number;
  mood: string;
  streakDays?: number;
}): Promise<SMSResult> {
  const { userId, userName, wellnessScore, mood, streakDays } = params;
  
  const updateBody = `📊 Sahara Wellness Update

User: ${userName || userId || "Anonymous"}
Wellness Score: ${wellnessScore}%
Current Mood: ${mood}
${streakDays ? `Streak: ${streakDays} days` : ""}

Time: ${new Date().toLocaleString()}`;

  return sendSMS({
    body: updateBody,
    type: "wellness_update",
    userId,
    metadata: { wellnessScore, mood, streakDays },
  });
}

/**
 * Send a journal warning SMS when a serious journal entry is detected
 * (e.g. self-harm, suicidal ideation, or high-risk content)
 */
export async function sendJournalAlert(params: {
  userId?: string;
  userName?: string;
  content: string;
  riskLevel: "high" | "critical";
  triggerWords?: string[];
}): Promise<SMSResult> {
  const { userId, userName, content, riskLevel, triggerWords } = params;

  const triggerInfo = triggerWords && triggerWords.length > 0 
    ? `\n🚨 TRIGGER WORDS DETECTED: ${triggerWords.join(", ")}`
    : "";

  const alertBody = `⚠️ SAHARA JOURNAL ALERT – Possible Risk

User: ${userName || userId || "Anonymous"}
Risk Level: ${riskLevel.toUpperCase()}${triggerInfo}

Journal excerpt: "${content.slice(0, 200)}${content.length > 200 ? "..." : ""}"

Please check on this user IMMEDIATELY.

Time: ${new Date().toLocaleString()}`;

  return sendSMS({
    body: alertBody,
    type: "crisis_alert",
    userId,
    metadata: { source: "journal", riskLevel, triggerWords, originalContent: content },
  });
}

/**
 * Send a Dialogflow-triggered notification
 */
export async function sendDialogflowNotification(params: {
  intent: string;
  confidence: number;
  userId?: string;
  message: string;
  response?: string;
}): Promise<SMSResult> {
  const { intent, confidence, userId, message, response } = params;
  
  // Only send for high-confidence crisis or important intents
  const importantIntents = ["crisis", "suicidal", "emergency", "harm", "help"];
  const isImportant = importantIntents.some(i => intent.toLowerCase().includes(i));
  
  if (!isImportant || confidence < 0.7) {
    return { success: true }; // Skip non-important intents
  }
  
  const notificationBody = `⚠️ Sahara Dialogflow Alert

Intent: ${intent}
Confidence: ${(confidence * 100).toFixed(1)}%
User: ${userId || "Anonymous"}

User said: "${message.slice(0, 150)}${message.length > 150 ? "..." : ""}"

${response ? `AI Response: "${response.slice(0, 100)}..."` : ""}

Time: ${new Date().toLocaleString()}`;

  return sendSMS({
    body: notificationBody,
    type: "notification",
    userId,
    metadata: { intent, confidence },
  });
}
