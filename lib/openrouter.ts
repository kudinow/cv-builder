const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}

interface OpenRouterChatOptions {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  stream?: boolean;
}

function getHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "ResumeAI",
  };
}

// Simple single-turn call (for adapt, etc.)
export async function callOpenRouter({
  systemPrompt,
  userMessage,
  model = "anthropic/claude-sonnet-4-6",
  maxTokens = 4096,
}: OpenRouterOptions): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Streaming multi-turn chat (for interview)
export async function streamOpenRouterChat({
  messages,
  model = "anthropic/claude-sonnet-4-6",
  maxTokens = 4096,
}: OpenRouterChatOptions): Promise<Response> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  return response;
}
