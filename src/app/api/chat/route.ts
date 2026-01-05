import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { detectCrisisKeywords, HELPLINE_RESOURCES } from "@/lib/utils";
import { analyzeMessage, generateResponse, buildSystemPrompt, SAHARA_SYSTEM_PROMPT } from "@/lib/unified-ai";
import type { PetAnimationState } from "@/types";

// Initialize OpenAI client lazily
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const SYSTEM_PROMPT = SAHARA_SYSTEM_PROMPT;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
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

    // Get user's active pet for tone modification
    const supabase = await createClient();
    let petToneModifier = "";

    if (userId) {
      const { data: userPet } = await supabase
        .from("user_pets")
        .select(`
          pet:pets(ai_tone_modifier, personality)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (userPet?.pet) {
        const petData = userPet.pet as unknown as { ai_tone_modifier: string; personality: string };
        petToneModifier = petData.ai_tone_modifier || "";
      }
    }

    // Check for crisis in the latest user message
    const latestUserMessage = messages[messages.length - 1];
    const isCrisisDetected = latestUserMessage?.role === "user" && 
      detectCrisisKeywords(latestUserMessage.content);

    // Analyze message with unified AI
    const sentiment = latestUserMessage?.role === "user" 
      ? analyzeMessage(latestUserMessage.content)
      : null;

    // Build the conversation with enhanced system prompt
    const enhancedSystemPrompt = buildSystemPrompt(
      petToneModifier ? "Your Pet" : undefined,
      petToneModifier || undefined
    );

    const conversationMessages: ChatMessage[] = [
      { role: "system", content: enhancedSystemPrompt + (petToneModifier ? `\n\nAdditional tone guidance: ${petToneModifier}` : "") },
      ...messages.slice(-10), // Keep last 10 messages for context
    ];

    // If crisis detected, add special instruction
    if (isCrisisDetected) {
      conversationMessages.push({
        role: "system",
        content: "The user may be in distress. Respond with extra care and compassion. Acknowledge their pain, let them know they're not alone, and gently remind them that professional support is available. Do not dismiss their feelings.",
      });
    }

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationMessages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content || 
      "I'm here for you. Would you like to share more about how you're feeling?";

    // Extract emotional keywords using unified AI
    const emotionalKeywords = sentiment?.keywords || extractEmotionalKeywords(latestUserMessage?.content || "");

    // Determine suggested animation based on sentiment analysis
    const suggestedAnimation = sentiment 
      ? determinePetAnimationFromSentiment(sentiment.category, sentiment.riskLevel)
      : determinePetAnimation(responseContent, isCrisisDetected);

    return NextResponse.json({
      content: responseContent,
      emotionalKeywords,
      suggestedAnimation,
      isCrisisDetected,
      crisisResources: isCrisisDetected ? HELPLINE_RESOURCES : undefined,
      sentiment: sentiment ? {
        category: sentiment.category,
        wellnessScore: sentiment.wellnessScore,
        riskLevel: sentiment.riskLevel
      } : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Use unified AI for fallback response
    const fallbackResponse = generateResponse("I need support");
    
    return NextResponse.json({
      content: fallbackResponse.content,
      emotionalKeywords: [],
      suggestedAnimation: fallbackResponse.suggestedAnimation as PetAnimationState,
      isCrisisDetected: false,
    });
  }
}

function extractEmotionalKeywords(text: string): string[] {
  const emotionWords = [
    "happy", "sad", "anxious", "worried", "stressed", "calm", "peaceful",
    "angry", "frustrated", "hopeful", "grateful", "lonely", "loved",
    "scared", "confident", "overwhelmed", "relaxed", "tired", "energetic",
    "confused", "clear", "motivated", "stuck", "free", "trapped"
  ];

  const lowerText = text.toLowerCase();
  return emotionWords.filter(word => lowerText.includes(word));
}

function determinePetAnimation(response: string, isCrisis: boolean): PetAnimationState {
  if (isCrisis) return "glow"; // Comforting glow during crisis
  
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes("breathe") || lowerResponse.includes("breath")) {
    return "breathe";
  }
  if (lowerResponse.includes("proud") || lowerResponse.includes("wonderful") || lowerResponse.includes("great")) {
    return "happy";
  }
  if (lowerResponse.includes("?")) {
    return "thinking";
  }
  
  return "idle";
}

function determinePetAnimationFromSentiment(category: string, riskLevel: string): PetAnimationState {
  if (riskLevel === "critical" || riskLevel === "high") return "glow";
  
  switch (category) {
    case "normal":
      return "happy";
    case "anxiety":
    case "stress":
      return "breathe";
    case "depression":
      return "glow";
    default:
      return "thinking";
  }
}
