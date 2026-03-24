import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  streamOpenRouterChat,
  type ChatMessage,
} from "@/lib/openrouter";
import { INTERVIEW_SYSTEM_PROMPT } from "@/lib/prompts/interview-system";
import { INTERVIEW_LIMITS } from '@/lib/token-costs'
import { addMessage, shouldForceFinalize } from '@/lib/interview-session'

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

    const { messages, sessionId } = (await req.json()) as {
      messages: ChatMessage[];
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

    // Load session from DB if sessionId is provided (security: use DB resume text, not client-sent)
    let uploadedResumeText: string | undefined
    if (sessionId) {
      const { data: session } = await supabase
        .from('interview_sessions')
        .select('uploaded_resume_text, mode, message_count, ai_tokens_used, status')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!session || session.status === 'completed' || session.status === 'expired') {
        return new Response(
          JSON.stringify({ error: 'Сессия недействительна' }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      }

      // Check if session has exceeded limits
      if (shouldForceFinalize({ messageCount: session.message_count, aiTokensUsed: session.ai_tokens_used })) {
        return new Response(
          JSON.stringify({ error: 'Лимит сообщений исчерпан', forceFinalize: true }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        )
      }

      uploadedResumeText = session.uploaded_resume_text ?? undefined
    }

    // Build the full message array with system prompt
    const systemContent = uploadedResumeText
      ? `${INTERVIEW_SYSTEM_PROMPT}\n\n## Загруженное резюме пользователя:\n${uploadedResumeText}\n\nПользователь загрузил существующее резюме. Начни с его анализа (сильные/слабые стороны), затем предложи улучшить или создать новое.`
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

    // Capture full assistant content and token usage for session persistence
    let assistantContent = ""
    let promptTokensUsed = 0

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
                  assistantContent += content
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    )
                  );
                }
                // Capture token usage from final chunk (OpenRouter sends usage in last chunk)
                if (parsed.usage?.total_tokens) {
                  promptTokensUsed = parsed.usage.total_tokens
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

          // After streaming completes, persist messages to session
          if (sessionId && lastMessage?.role === 'user') {
            const now = new Date().toISOString()
            try {
              // Save user message
              await addMessage(sessionId, {
                role: 'user',
                content: lastMessage.content,
                timestamp: now,
              })
              // Save assistant message with AI token usage
              if (assistantContent) {
                await addMessage(sessionId, {
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: new Date().toISOString(),
                }, promptTokensUsed)
              }
            } catch (saveErr) {
              console.error('[interview] Failed to save messages to session:', saveErr)
            }
          }
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
