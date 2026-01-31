/**
 * Chirag Integration Service
 * 
 * Connects to the Chirag FastAPI backend for enhanced AI conversations.
 * Chirag is a friendly, compassionate AI mental health companion.
 */

export interface ChiragConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ChiragChatResponse {
  response: string;
  user?: {
    name?: string;
    age?: string;
  };
  updated_context?: string;
  calendar_event?: {
    title: string;
    start_datetime: string;
    end_datetime: string;
    description: string;
  };
}

export interface ChiragResponse {
  success: boolean;
  response?: string;
  context?: string;
  error?: string;
}

/**
 * Get Chirag configuration from environment variables
 */
function getConfig(): ChiragConfig | null {
  const baseUrl = process.env.CHIRAG_API_URL || process.env.NEXT_PUBLIC_CHIRAG_API_URL;
  
  if (!baseUrl) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''), // Remove trailing slash
    apiKey: process.env.CHIRAG_API_KEY,
  };
}

/**
 * Check if Chirag service is enabled
 * Returns true if either CHIRAG_API_URL or GROQ_API_KEY is configured
 */
export function isChiragEnabled(): boolean {
  const hasChiragApi = getConfig() !== null;
  const hasGroqKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key';
  return hasChiragApi || hasGroqKey;
}

/**
 * Send a chat message to Chirag
 */
export async function chatWithChirag(
  message: string,
  userId?: string,
  authToken?: string
): Promise<ChiragResponse> {
  const config = getConfig();
  
  if (!config) {
    return { success: false, error: "Chirag service not configured" };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${config.baseUrl}/api/v1/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        chat_input: message,
        user_location: null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chirag-service] API error:", errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    return {
      success: true,
      response: data.response || data.message || "I'm here to listen.",
      context: data.updated_context,
    };
  } catch (error) {
    console.error("[chirag-service] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Use Chirag's Groq-based LLM directly (for local integration)
 * This calls the Groq API directly using the same prompt as Chirag
 */
export async function chatWithChiragAI(
  message: string,
  conversationHistory: string[] = [],
  userContext: Record<string, unknown> = {}
): Promise<ChiragResponse> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    return { success: false, error: "GROQ_API_KEY not configured" };
  }

  try {
    const prompt = buildChiragPrompt(message, conversationHistory, userContext);
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are Chirag, a friendly and compassionate mental health companion who supports users with mental wellness. You were created by Google Dialogflow and enhanced with AI capabilities. Respond warmly and empathetically."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[chirag-service] Groq API error:", errorText);
      return { success: false, error: `Groq API error: ${response.status}` };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to listen and support you.";
    
    return {
      success: true,
      response: aiResponse,
    };
  } catch (error) {
    console.error("[chirag-service] Groq error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build the Chirag-style prompt
 */
function buildChiragPrompt(
  userInput: string,
  conversationHistory: string[],
  userContext: Record<string, unknown>
): string {
  const now = new Date().toISOString().split('T')[0];
  
  return `You are Chirag, a friendly and compassionate mental health companion supporting the user's wellness.

Previous Conversations:
${conversationHistory.slice(-5).join('\n') || 'None'}

User Context:
${JSON.stringify(userContext) || 'No previous context'}

Today's Date: ${now}

User's Message: "${userInput}"

Respond as a supportive and understanding friend. Your response should be:
1. Warm, positive, and constructive while acknowledging emotions
2. Brief (2-3 sentences)
3. Encouraging and supportive
4. End with an open-ended question if appropriate

Respond naturally without JSON formatting.`;
}

/**
 * Health check for Chirag service
 */
export async function checkChiragHealth(): Promise<boolean> {
  const config = getConfig();
  
  if (!config) {
    return false;
  }

  try {
    const response = await fetch(`${config.baseUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}
