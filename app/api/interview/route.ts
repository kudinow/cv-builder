import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  streamOpenRouterChat,
  type ChatMessage,
} from "@/lib/openrouter";
import { INTERVIEW_SYSTEM_PROMPT } from "@/lib/prompts/interview-system";
import { INTERVIEW_LIMITS } from '@/lib/token-costs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Не авторизован" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, resumeText, sessionId } = (await req.json()) as {
      messages: ChatMessage[];
      resumeText?: string;
      sessionId?: string;
    };

    // Validate message length
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && lastMessage.content.length > INTERVIEW_LIMITS.MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Сообщение слишком длинное', maxLength: INTERVIEW_LIMITS.MAX_MESSAGE_LENGTH }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the full message array with system prompt
    const systemContent = resumeText
      ? `${INTERVIEW_SYSTEM_PROMPT}\n\n## Загруженное резюме пользователя:\n${resumeText}\n\nПользователь загрузил существующее резюме. Начни с его анализа (сильные/слабые стороны), затем предложи улучшить или создать новое.`
      : INTERVIEW_SYSTEM_PROMPT;

    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...messages,
    ];

    // Stream response from OpenRouter
    const openRouterResponse = await streamOpenRouterChat({
      messages: fullMessages,
      maxTokens: 2048,
    });

    // Transform the SSE stream from OpenRouter to our client
    const reader = openRouterResponse.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: "No stream" }), {
        status: 500,
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Interview error:", error);
    return new Response(
      JSON.stringify({ error: "Ошибка при интервью" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
