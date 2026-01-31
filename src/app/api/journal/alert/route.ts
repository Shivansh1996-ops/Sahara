import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/nlp";
import { isSMSEnabled, sendJournalAlert } from "@/lib/sms-service";

/**
 * Direct trigger words that should ALWAYS send an alert
 * These are checked with word boundaries to avoid false positives
 */
const TRIGGER_WORDS = [
  "die", "dying", "death", "dead",
  "suicide", "suicidal", 
  "kill", "killing",
  "end my life", "end it all",
  "not interested in life", "tired of living",
  "don't want to live", "dont want to live",
  "want to die", "wanna die",
  "better off dead", "wish i was dead",
  "hurt myself", "harm myself",
  "self harm", "self-harm", "selfharm",
  "no reason to live", "no point in living",
  "can't go on", "cant go on",
  "overdose", "hanging", "drown", "jump off"
];

/**
 * Check if text contains any trigger words
 */
function containsTriggerWord(text: string): { found: boolean; words: string[] } {
  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];
  
  for (const word of TRIGGER_WORDS) {
    // For phrases (containing space), check direct inclusion
    if (word.includes(" ")) {
      if (lowerText.includes(word)) {
        foundWords.push(word);
      }
    } else {
      // For single words, use word boundary check
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundWords.push(word);
      }
    }
  }
  
  return { found: foundWords.length > 0, words: foundWords };
}

/**
 * POST /api/journal/alert
 * Checks journal content for serious/crisis indicators and sends an SMS
 * warning to ALERT_PHONE_NUMBER via Twilio when risk is detected.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, userId, userName } = body as {
      content?: string;
      userId?: string;
      userName?: string;
    };

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 }
      );
    }

    const text = content.trim();
    if (!text) {
      return NextResponse.json({ sent: false, reason: "empty" });
    }

    // First check for direct trigger words (most important)
    const triggerCheck = containsTriggerWord(text);
    
    // Also run full NLP analysis
    const result = analyze(text);
    const isCrisis = result.riskLevel === "critical" || result.emotionalAnalysis.isCrisis;
    const isHighRisk = result.riskLevel === "high";

    // Alert if: trigger word found OR crisis/high risk detected
    const shouldAlert = triggerCheck.found || isCrisis || isHighRisk;

    if (!shouldAlert) {
      return NextResponse.json({ sent: false, reason: "no_risk", riskLevel: result.riskLevel });
    }

    console.log("[journal-alert] Risk detected!", {
      triggerWords: triggerCheck.words,
      riskLevel: result.riskLevel,
      isCrisis
    });

    if (!isSMSEnabled()) {
      console.warn("[journal-alert] SMS not configured; would have sent alert for:", {
        triggerWords: triggerCheck.words,
        riskLevel: result.riskLevel
      });
      return NextResponse.json({ sent: false, reason: "sms_not_configured", triggerWords: triggerCheck.words });
    }

    // Determine risk level - trigger words = critical
    const riskLevel = triggerCheck.found ? "critical" : (result.riskLevel === "critical" ? "critical" : "high");
    
    await sendJournalAlert({
      userId,
      userName,
      content: text,
      riskLevel,
      triggerWords: triggerCheck.words,
    });

    return NextResponse.json({ sent: true, riskLevel, triggerWords: triggerCheck.words });
  } catch (error) {
    console.error("[journal-alert] Error:", error);
    return NextResponse.json(
      { error: "Failed to process journal alert" },
      { status: 500 }
    );
  }
}
