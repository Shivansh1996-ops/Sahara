import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HELPLINE_RESOURCES } from "@/lib/utils";
import { analyze, type TherapeuticApproach, type PetAnimation } from "@/lib/nlp";
import { generateResponse } from "@/lib/unified-ai";
import {
  isDialogflowEnabled,
  detectIntent,
  mapIntentToApproach,
  getAgentName,
} from "@/lib/dialogflow-nlp";
import {
  isSMSEnabled,
  sendCrisisAlert,
  sendDialogflowNotification,
} from "@/lib/sms-service";
import {
  isChiragEnabled,
  chatWithChiragAI,
} from "@/lib/chirag-service";
import type { PetAnimationState } from "@/types";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function approachToAnimation(approach: TherapeuticApproach): PetAnimation {
  const map: Record<TherapeuticApproach, PetAnimation> = {
    crisis_support: "comfort",
    comfort: "glow",
    grounding: "glow",
    validation: "idle",
    exploration: "thinking",
    reflection: "thinking",
    encouragement: "celebrate",
  };
  return map[approach] ?? "idle";
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    const userMessageContent = latestUserMessage.content;

    const supabase = await createClient();
    let petName = "Buddy";
    let petPersonality = "supportive";

    if (userId) {
      try {
        const { data: userPet } = await supabase
          .from("user_pets")
          .select(`
            pet:pets(name, personality, ai_tone_modifier)
          `)
          .eq("user_id", userId)
          .eq("is_active", true)
          .single();

        if (userPet?.pet) {
          const petData = userPet.pet as unknown as {
            name: string;
            personality: string;
            ai_tone_modifier: string;
          };
          petName = petData.name || "Buddy";
          petPersonality = petData.personality || "supportive";
        }
      } catch {
        // use defaults
      }
    }

    // Local NLP: sentiment, emotions, themes, crisis (always on)
    const sentiment = analyze(userMessageContent);
    const isCrisisDetected =
      sentiment.riskLevel === "critical" || sentiment.emotionalAnalysis.isCrisis;

    let content: string;
    let approach: TherapeuticApproach;
    let suggestedAnimation: PetAnimationState;
    let dialogflowIntent: string | undefined;
    let dialogflowConfidence: number | undefined;
    let aiProvider: string = "local";

    // Priority 1: Use Chirag AI (if enabled and not crisis)
    if (isChiragEnabled() && !isCrisisDetected) {
      console.log("[chat-api] Using Chirag AI");
      
      // Get conversation history for context
      const conversationHistory = messages
        .slice(-10)
        .map((m: ChatMessage) => `${m.role}: ${m.content}`);
      
      const chiragResponse = await chatWithChiragAI(
        userMessageContent,
        conversationHistory,
        { petName, petPersonality, userId }
      );
      
      if (chiragResponse.success && chiragResponse.response) {
        content = chiragResponse.response;
        aiProvider = "chirag";
        approach = sentiment.emotionalAnalysis.isCrisis 
          ? "crisis_support" 
          : sentiment.category === "positive" 
            ? "encouragement" 
            : "validation";
        suggestedAnimation = approachToAnimation(approach) as PetAnimationState;
        
        console.log("[chat-api] Chirag response received successfully");
      } else {
        // Fallback to local AI if Chirag fails
        console.log("[chat-api] Chirag failed, falling back to local AI:", chiragResponse.error);
        const therapeuticResponse = generateResponse(userMessageContent, petName);
        content = therapeuticResponse.content;
        approach = therapeuticResponse.approach;
        suggestedAnimation = therapeuticResponse.suggestedAnimation as PetAnimationState;
      }
    }
    // Priority 2: Use Dialogflow (if enabled)
    else if (isDialogflowEnabled()) {
      const sessionId =
        (userId as string) ||
        `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const df = await detectIntent(userMessageContent, sessionId);
      
      // Store Dialogflow results for logging/notifications
      if (df) {
        dialogflowIntent = df.intent;
        dialogflowConfidence = df.confidence;
        aiProvider = "dialogflow";
        
        console.log(`[chat-api] Dialogflow (${getAgentName()}) - Intent: ${df.intent}, Confidence: ${df.confidence.toFixed(2)}`);
      }

      if (
        df?.hasFulfillment &&
        df.fulfillmentText &&
        !isCrisisDetected
      ) {
        content = df.fulfillmentText;
        approach =
          mapIntentToApproach(df.intent) ||
          (sentiment.emotionalAnalysis.isCrisis ? "crisis_support" : "reflection");
        suggestedAnimation = approachToAnimation(approach) as PetAnimationState;
        
        // Send Dialogflow notification for important intents
        if (isSMSEnabled() && df.confidence >= 0.7) {
          sendDialogflowNotification({
            intent: df.intent,
            confidence: df.confidence,
            userId: userId as string,
            message: userMessageContent,
            response: content,
          }).catch(err => console.error("[chat-api] SMS notification error:", err));
        }
      } else {
        const therapeuticResponse = generateResponse(userMessageContent, petName);
        content = therapeuticResponse.content;
        approach = therapeuticResponse.approach;
        suggestedAnimation =
          therapeuticResponse.suggestedAnimation as PetAnimationState;
      }
    } 
    // Priority 3: Local AI fallback
    else {
      const therapeuticResponse = generateResponse(userMessageContent, petName);
      content = therapeuticResponse.content;
      approach = therapeuticResponse.approach;
      suggestedAnimation =
        therapeuticResponse.suggestedAnimation as PetAnimationState;
    }

    // Send SMS alert for crisis situations
    if (isCrisisDetected && isSMSEnabled()) {
      sendCrisisAlert({
        userId: userId as string,
        userName: petName !== "Buddy" ? petName : undefined,
        message: userMessageContent,
        riskLevel: sentiment.riskLevel as "low" | "moderate" | "high" | "critical",
      }).catch(err => console.error("[chat-api] Crisis SMS alert error:", err));
    }

    return NextResponse.json({
      content,
      emotionalKeywords: sentiment.keywords,
      suggestedAnimation,
      isCrisisDetected,
      crisisResources: isCrisisDetected ? HELPLINE_RESOURCES : undefined,
      sentiment: {
        category: sentiment.category,
        wellnessScore: sentiment.wellnessScore,
        riskLevel: sentiment.riskLevel,
      },
      confidence: sentiment.confidence,
      approach,
      aiProvider, // "chirag", "dialogflow", or "local"
      // Dialogflow info (if available)
      dialogflow: dialogflowIntent ? {
        agent: getAgentName(),
        intent: dialogflowIntent,
        confidence: dialogflowConfidence,
      } : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      content:
        "I'm here for you. Would you like to share more about how you're feeling?",
      emotionalKeywords: [],
      suggestedAnimation: "idle" as PetAnimationState,
      isCrisisDetected: false,
    });
  }
}
